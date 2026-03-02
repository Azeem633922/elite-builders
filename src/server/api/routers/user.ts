import { z } from 'zod';
import { clerkClient } from '@clerk/nextjs/server';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const userRouter = createTRPCRouter({
  getCurrent: protectedProcedure.query(({ ctx }) => {
    return ctx.db.user.findUnique({
      where: { clerkId: ctx.userId },
    });
  }),

  update: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).optional(),
        avatarUrl: z.string().url().optional(),
        githubUrl: z.string().url().optional(),
        portfolioUrl: z.string().url().optional(),
        cvUrl: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(ctx.userId);

      await ctx.db.user.upsert({
        where: { clerkId: ctx.userId },
        create: {
          clerkId: ctx.userId,
          email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
          name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null,
          avatarUrl: clerkUser.imageUrl,
          ...input,
        },
        update: input,
      });
    }),

  completeOnboarding: protectedProcedure
    .input(
      z.object({
        githubUrl: z.string().url(),
        portfolioUrl: z.string().url().optional(),
        cvUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const client = await clerkClient();

      // Get Clerk user info + upsert + mark onboarded in one go
      const [clerkUser] = await Promise.all([client.users.getUser(ctx.userId)]);

      await ctx.db.user.upsert({
        where: { clerkId: ctx.userId },
        create: {
          clerkId: ctx.userId,
          email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
          name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null,
          avatarUrl: clerkUser.imageUrl,
          githubUrl: input.githubUrl,
          portfolioUrl: input.portfolioUrl,
          cvUrl: input.cvUrl,
          onboardingCompleted: true,
        },
        update: {
          githubUrl: input.githubUrl,
          portfolioUrl: input.portfolioUrl,
          cvUrl: input.cvUrl,
          onboardingCompleted: true,
        },
      });

      // Update Clerk metadata so JWT reflects onboarding status
      await client.users.updateUser(ctx.userId, {
        publicMetadata: { onboardingCompleted: true },
      });

      return { success: true };
    }),
});
