import { notFound } from 'next/navigation';
import { createCaller } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';
import { ChallengeDetail } from '@/features/challenges/components/challenge-detail';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const ctx = await createTRPCContext({ headers: new Headers() });
  const caller = createCaller(ctx);
  const challenge = await caller.challenge.getBySlug({ slug });

  if (!challenge) return { title: 'Challenge Not Found — EliteBuilders' };

  return {
    title: `${challenge.title} — EliteBuilders`,
    description: challenge.description,
  };
}

export default async function ChallengeDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const ctx = await createTRPCContext({ headers: new Headers() });
  const caller = createCaller(ctx);
  const challenge = await caller.challenge.getBySlug({ slug });

  if (!challenge) notFound();

  const userId = ctx.userId;
  const userSubmission = userId ? challenge.submissions.find((s) => s.userId === userId) : null;

  return (
    <ChallengeDetail
      challenge={{
        id: challenge.id,
        title: challenge.title,
        slug: challenge.slug,
        description: challenge.description,
        problemStatement: challenge.problemStatement,
        evaluationRubric: challenge.evaluationRubric as {
          dimensions: { name: string; weight: number; description: string }[];
        } | null,
        prizeAmount: challenge.prizeAmount,
        deadline: challenge.deadline.toISOString(),
        createdAt: challenge.createdAt.toISOString(),
        difficulty: challenge.difficulty,
        status: challenge.status,
        organization: {
          name: challenge.organization.name,
          logo: challenge.organization.logo,
          industry: challenge.organization.industry,
        },
      }}
      hasSubmitted={!!userSubmission}
      userSubmissionId={userSubmission?.id ?? null}
    />
  );
}
