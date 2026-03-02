import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

export const scoreRouter = createTRPCRouter({
  getBySubmission: publicProcedure
    .input(z.object({ submissionId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.db.scoreDimension.findMany({
        where: { submissionId: input.submissionId },
        orderBy: { createdAt: 'desc' },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        submissionId: z.string(),
        dimensionName: z.string().min(1),
        score: z.number().min(0).max(100),
        feedback: z.string().optional(),
        scoredBy: z.enum(['AI', 'HUMAN']),
      }),
    )
    .mutation(({ ctx: { db }, input }) => {
      return db.scoreDimension.create({ data: input });
    }),
});
