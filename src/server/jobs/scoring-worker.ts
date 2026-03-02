import { Worker, type Job } from 'bullmq';
import Anthropic from '@anthropic-ai/sdk';
import * as Sentry from '@sentry/nextjs';
import { db } from '@/server/db';
import { connection } from './queue';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? '',
});

interface RubricDimension {
  name: string;
  weight: number;
  description: string;
}

interface ScoreResult {
  dimension: string;
  score: number;
  feedback: string;
}

async function fetchReadme(repoUrl: string): Promise<string> {
  // Extract owner/repo from GitHub URL
  const match = /github\.com\/([\w.-]+)\/([\w.-]+)/.exec(repoUrl);
  if (!match) throw new Error(`Invalid GitHub URL: ${repoUrl}`);

  const [, owner, repo] = match;
  const cleanRepo = (repo ?? '').replace(/\.git$/, '');

  const res = await fetch(`https://api.github.com/repos/${String(owner)}/${cleanRepo}/readme`, {
    headers: {
      Accept: 'application/vnd.github.raw+json',
      'User-Agent': 'EliteBuilders-Scoring',
    },
  });

  if (!res.ok) {
    if (res.status === 404) return '(No README found in repository)';
    throw new Error(`GitHub API error: ${String(res.status)} ${res.statusText}`);
  }

  const text = await res.text();
  // Truncate to avoid excessive token usage
  return text.length > 15000 ? text.slice(0, 15000) + '\n\n...(truncated)' : text;
}

async function scoreWithClaude(
  challengeTitle: string,
  problemStatement: string,
  rubricDimensions: RubricDimension[],
  submissionDescription: string,
  readme: string,
): Promise<ScoreResult[]> {
  const dimensionsList = rubricDimensions
    .map(
      (d, i) => `${String(i + 1)}. **${d.name}** (weight: ${String(d.weight)}%) — ${d.description}`,
    )
    .join('\n');

  const prompt = `You are an expert judge for a competitive AI/software building challenge. Score the following submission objectively and fairly.

## Challenge
**Title:** ${challengeTitle}

**Problem Statement:**
${problemStatement}

## Evaluation Rubric
Score each dimension from 0 to 10 (0 = no effort, 5 = meets basic expectations, 10 = exceptional).

${dimensionsList}

## Submission
**Description from the builder:**
${submissionDescription}

**Repository README:**
${readme}

## Instructions
Evaluate the submission against each rubric dimension. Be fair but critical. Consider:
- Does the submission address the problem statement?
- Is the technical implementation sound based on the README?
- How complete and polished is the solution?

Return ONLY a valid JSON object in this exact format, no markdown code fences:
{"scores":[{"dimension":"<exact dimension name>","score":<0-10>,"feedback":"<1-2 sentence feedback>"}]}`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = message.content[0]?.type === 'text' ? message.content[0].text : '';

  const parsed = JSON.parse(responseText) as { scores: ScoreResult[] };

  if (!Array.isArray(parsed.scores)) {
    throw new Error('Invalid Claude response format: missing scores array');
  }

  return parsed.scores;
}

export async function processScoring(job: Job<{ submissionId: string }>) {
  const { submissionId } = job.data;
  console.log(
    `[scoring-queue] Processing submission ${submissionId} (attempt ${String(job.attemptsMade + 1)})`,
  );

  try {
    // 1. Mark as SCORING
    await db.submission.update({
      where: { id: submissionId },
      data: { status: 'SCORING' },
    });

    // 2. Fetch submission + challenge with rubric
    const submission = await db.submission.findUnique({
      where: { id: submissionId },
      include: {
        challenge: true,
      },
    });

    if (!submission) throw new Error(`Submission ${submissionId} not found`);

    const rubric = submission.challenge.evaluationRubric as {
      dimensions: RubricDimension[];
    } | null;

    if (!rubric?.dimensions.length) {
      throw new Error(`No evaluation rubric found for challenge ${submission.challenge.id}`);
    }

    // 3. Fetch README from GitHub
    const readme = await fetchReadme(submission.repoUrl);

    // 4. Call Claude for scoring
    const scores = await scoreWithClaude(
      submission.challenge.title,
      submission.challenge.problemStatement,
      rubric.dimensions,
      submission.description,
      readme,
    );

    // 5. Save ScoreDimension records
    await db.scoreDimension.createMany({
      data: scores.map((s) => ({
        dimensionName: s.dimension,
        score: s.score,
        feedback: s.feedback,
        scoredBy: 'AI' as const,
        submissionId,
      })),
    });

    // 6. Calculate weighted average
    const totalWeight = rubric.dimensions.reduce((sum, d) => sum + d.weight, 0);
    let weightedSum = 0;

    for (const score of scores) {
      const dim = rubric.dimensions.find(
        (d) => d.name.toLowerCase() === score.dimension.toLowerCase(),
      );
      const weight = dim?.weight ?? totalWeight / rubric.dimensions.length;
      weightedSum += (score.score / 10) * weight;
    }

    const provisionalScore = Math.round((weightedSum / totalWeight) * 100 * 100) / 100;

    // 7. Update submission with score and status
    await db.submission.update({
      where: { id: submissionId },
      data: {
        provisionalScore,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        aiFeedback: JSON.parse(JSON.stringify(scores)),
        status: 'SCORED',
      },
    });

    console.log(
      `[scoring-queue] Submission ${submissionId} scored: ${String(provisionalScore)}/100`,
    );
  } catch (error) {
    console.error(`[scoring-queue] Error scoring submission ${submissionId}:`, error);

    // Mark as ERROR
    await db.submission
      .update({
        where: { id: submissionId },
        data: { status: 'ERROR' },
      })
      .catch(() => {
        /* noop */
      });

    // Log to Sentry
    Sentry.captureException(error, {
      extra: { submissionId, jobId: job.id, attempt: job.attemptsMade + 1 },
    });

    // Re-throw so BullMQ retries
    throw error;
  }
}

export function startScoringWorker() {
  const worker = new Worker('scoring-queue', processScoring, {
    connection,
    concurrency: 1,
  });

  worker.on('completed', (job) => {
    console.log(`[scoring-queue] Job ${String(job.id)} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(
      `[scoring-queue] Job ${String(job?.id)} failed (attempt ${String(job?.attemptsMade)}):`,
      err.message,
    );
  });

  return worker;
}
