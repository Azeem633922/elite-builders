import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { scoringQueue } from '@/server/jobs/queue';

export const submissionRouter = createTRPCRouter({
  getByChallengeId: publicProcedure
    .input(z.object({ challengeId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.submission.findMany({
        where: { challengeId: input.challengeId },
        include: { user: true, scoreDimensions: true },
        orderBy: { createdAt: 'desc' },
      });
    }),

  getById: publicProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) => {
    return ctx.db.submission.findUnique({
      where: { id: input.id },
      include: { user: true, challenge: true, scoreDimensions: true },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        description: z.string().min(10),
        repoUrl: z.string().url(),
        deckUrl: z.string().url().optional(),
        videoUrl: z.string().url().optional(),
        challengeId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({ where: { clerkId: ctx.userId } });
      if (!user) throw new Error('User not found');

      const submission = await ctx.db.submission.create({
        data: { ...input, userId: user.id },
      });

      // Enqueue AI scoring job
      await scoringQueue.add('score', { submissionId: submission.id });

      return submission;
    }),
});
