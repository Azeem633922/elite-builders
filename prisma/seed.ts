import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean existing seed data
  await prisma.challenge.deleteMany();
  await prisma.organization.deleteMany();

  // Create test organization
  const org = await prisma.organization.create({
    data: {
      name: 'NovaTech Ventures',
      logo: 'https://ui-avatars.com/api/?name=NovaTech+Ventures&background=6366f1&color=fff&size=128',
      website: 'https://novatech-ventures.example.com',
      industry: 'Technology & Venture Capital',
    },
  });

  console.log(`Created organization: ${org.name} (${org.id})`);

  // Create 3 challenges
  const challenges = await Promise.all([
    prisma.challenge.create({
      data: {
        title: 'AI-Powered Customer Support Agent',
        slug: 'ai-customer-support-agent',
        description:
          'Build an intelligent customer support chatbot that can handle multi-turn conversations, escalate to humans when needed, and learn from past interactions.',
        problemStatement: `## The Problem

Companies spend an average of $1.3 trillion annually on customer service calls. 67% of these interactions involve repetitive questions that could be automated.

## Your Mission

Build an AI-powered customer support agent MVP that:

1. **Handles multi-turn conversations** — Maintains context across a full support session, not just single Q&A pairs.
2. **Knows when to escalate** — Detects frustration, complex issues, or explicit requests and hands off to a human agent seamlessly.
3. **Learns from history** — Uses a provided dataset of 10,000 past support tickets to ground its responses in real resolution patterns.
4. **Provides analytics** — Dashboard showing resolution rates, average handle time, and common issue categories.

## Deliverables

- Working web application with a chat interface
- Admin dashboard with analytics
- API documentation
- 3-minute demo video walkthrough`,
        evaluationRubric: {
          dimensions: [
            {
              name: 'Technical Implementation',
              weight: 30,
              description: 'Code quality, architecture, and AI integration depth',
            },
            {
              name: 'User Experience',
              weight: 25,
              description: 'Chat interface polish, response speed, and conversation flow',
            },
            {
              name: 'Escalation Intelligence',
              weight: 20,
              description: 'Accuracy and timing of human handoff decisions',
            },
            {
              name: 'Analytics & Insights',
              weight: 15,
              description: 'Usefulness and clarity of the admin dashboard',
            },
            {
              name: 'Demo & Documentation',
              weight: 10,
              description: 'Quality of video walkthrough and API docs',
            },
          ],
        },
        prizeAmount: 5000,
        deadline: new Date('2026-04-15T23:59:59Z'),
        status: 'ACTIVE',
        difficulty: 'INTERMEDIATE',
        organizationId: org.id,
      },
    }),

    prisma.challenge.create({
      data: {
        title: 'Smart Contract Audit Assistant',
        slug: 'smart-contract-audit-assistant',
        description:
          'Create an AI tool that analyzes Solidity smart contracts for vulnerabilities, gas inefficiencies, and best practice violations — then generates a human-readable audit report.',
        problemStatement: `## The Problem

Smart contract exploits caused over $3.8 billion in losses in 2025. Professional audits cost $50K–$500K and take weeks. Solo developers and small teams ship unaudited code because they can't afford the process.

## Your Mission

Build an AI-powered smart contract audit tool that:

1. **Scans Solidity code** — Accepts a GitHub repo URL or pasted contract code and parses it for analysis.
2. **Detects vulnerabilities** — Identifies common attack vectors: reentrancy, integer overflow, access control issues, front-running risks, and more.
3. **Suggests fixes** — Provides specific code-level recommendations, not just warnings.
4. **Generates a report** — Outputs a professional PDF audit report with severity ratings (Critical / High / Medium / Low / Informational).

## Deliverables

- Web application with code input and report generation
- Support for at least Solidity 0.8.x contracts
- Sample audit reports for 3 provided test contracts
- 3-minute demo video`,
        evaluationRubric: {
          dimensions: [
            {
              name: 'Vulnerability Detection',
              weight: 35,
              description: 'Coverage and accuracy of identified issues across test contracts',
            },
            {
              name: 'Fix Quality',
              weight: 25,
              description: 'Specificity and correctness of suggested remediations',
            },
            {
              name: 'Report Generation',
              weight: 20,
              description: 'Clarity, professionalism, and completeness of the audit report',
            },
            {
              name: 'User Experience',
              weight: 10,
              description: 'Ease of submitting contracts and navigating results',
            },
            {
              name: 'Demo & Documentation',
              weight: 10,
              description: 'Quality of video walkthrough and setup instructions',
            },
          ],
        },
        prizeAmount: 7500,
        deadline: new Date('2026-05-01T23:59:59Z'),
        status: 'ACTIVE',
        difficulty: 'ADVANCED',
        organizationId: org.id,
      },
    }),

    prisma.challenge.create({
      data: {
        title: 'AI Medical Image Pre-Screener',
        slug: 'ai-medical-image-prescreener',
        description:
          'Develop an AI system that pre-screens medical images (X-rays and dermatology photos) to flag potential abnormalities and prioritize radiologist review queues.',
        problemStatement: `## The Problem

Radiologists review an average of 20,000+ images per year. Burnout rates exceed 50%, and missed findings occur in 3–5% of cases. Rural clinics often wait days for specialist review.

## Your Mission

Build an AI medical image pre-screening MVP that:

1. **Accepts image uploads** — Supports chest X-rays and dermatology photographs in standard formats (DICOM, PNG, JPEG).
2. **Flags abnormalities** — Uses computer vision to highlight regions of concern with confidence scores.
3. **Prioritizes review queues** — Sorts incoming images by urgency so critical cases are reviewed first.
4. **Explains its reasoning** — Provides visual heatmaps and text explanations for flagged regions (explainable AI).

## Important Notes

- Use publicly available datasets (NIH Chest X-ray, ISIC Skin Lesion) — no private medical data.
- This is a screening aid concept, not a diagnostic tool. Include appropriate disclaimers.

## Deliverables

- Working web application with image upload and analysis
- Priority queue dashboard for reviewers
- Explainability visualizations (heatmaps / attention maps)
- 3-minute demo video`,
        evaluationRubric: {
          dimensions: [
            {
              name: 'Model Accuracy',
              weight: 30,
              description: 'Detection performance on provided test images',
            },
            {
              name: 'Explainability',
              weight: 25,
              description: 'Quality of heatmaps and reasoning explanations',
            },
            {
              name: 'Queue Prioritization',
              weight: 20,
              description: 'Effectiveness of the urgency-based sorting system',
            },
            {
              name: 'User Interface',
              weight: 15,
              description: 'Upload flow, dashboard usability, and result presentation',
            },
            {
              name: 'Ethics & Disclaimers',
              weight: 10,
              description: 'Appropriate handling of medical AI limitations and bias considerations',
            },
          ],
        },
        prizeAmount: 10000,
        deadline: new Date('2026-05-20T23:59:59Z'),
        status: 'ACTIVE',
        difficulty: 'BEGINNER',
        organizationId: org.id,
      },
    }),
  ]);

  for (const c of challenges) {
    console.log(
      `Created challenge: ${c.title} ($${String(c.prizeAmount)}) — deadline ${c.deadline.toISOString().split('T')[0] ?? ''}`,
    );
  }

  console.log('\nSeed complete!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e: unknown) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
