import { notFound, redirect } from 'next/navigation';
import { createCaller } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';
import { SubmissionForm } from '@/features/challenges/components/submission-form';

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
    title: `Submit — ${challenge.title} — EliteBuilders`,
  };
}

export default async function SubmitPage({ params }: PageProps) {
  const { slug } = await params;
  const ctx = await createTRPCContext({ headers: new Headers() });
  const caller = createCaller(ctx);
  const challenge = await caller.challenge.getBySlug({ slug });

  if (!challenge) notFound();

  // Check if deadline passed
  if (new Date(challenge.deadline) < new Date()) {
    redirect(`/challenges/${slug}`);
  }

  // Check if user already submitted
  const userId = ctx.userId;
  if (userId) {
    const existing = challenge.submissions.find((s) => s.userId === userId);
    if (existing) {
      redirect(`/challenges/${slug}`);
    }
  }

  return (
    <SubmissionForm
      challenge={{
        id: challenge.id,
        title: challenge.title,
        slug: challenge.slug,
        deadline: challenge.deadline.toISOString(),
      }}
    />
  );
}
