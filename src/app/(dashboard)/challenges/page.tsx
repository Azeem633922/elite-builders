import { createCaller } from '@/server/api/root';
import { createTRPCContext } from '@/server/api/trpc';
import { ChallengeCatalogue } from '@/features/challenges/components/challenge-catalogue';

export const metadata = {
  title: 'Challenges — EliteBuilders',
  description: 'Browse active AI-powered MVP challenges. Compete, build, and win prizes.',
};

export default async function ChallengesPage() {
  const ctx = await createTRPCContext({ headers: new Headers() });
  const caller = createCaller(ctx);
  const challenges = await caller.challenge.getActive();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Challenges</h1>
        <p className="mt-1 text-muted-foreground">
          Browse open challenges and submit your AI-powered MVP.
        </p>
      </div>
      <ChallengeCatalogue challenges={challenges} />
    </div>
  );
}
