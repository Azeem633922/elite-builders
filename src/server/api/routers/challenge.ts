import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';

export const challengeRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z
        .object({
          status: z.enum(['DRAFT', 'ACTIVE', 'JUDGING', 'CLOSED']).optional(),
        })
        .optional(),
    )
    .query(({ ctx, input }) => {
      return ctx.db.challenge.findMany({
        where: input?.status ? { status: input.status } : { status: { not: 'DRAFT' } },
        include: { organization: true },
        orderBy: { createdAt: 'desc' },
      });
    }),

  getActive: publicProcedure.query(({ ctx }) => {
    return ctx.db.challenge.findMany({
      where: { status: 'ACTIVE' },
      include: { organization: true },
      orderBy: { deadline: 'asc' },
    });
  }),

  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(({ ctx, input }) => {
    return ctx.db.challenge.findUnique({
      where: { slug: input.slug },
      include: {
        organization: true,
        submissions: { include: { user: true } },
      },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(3),
        slug: z.string().min(3),
        description: z.string().min(10),
        problemStatement: z.string().min(10),
        evaluationRubric: z.any().optional(),
        dataPackUrl: z.string().url().optional(),
        prizeAmount: z.number().min(0).optional(),
        deadline: z.coerce.date(),
        organizationId: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.db.challenge.create({ data: input });
    }),
});
