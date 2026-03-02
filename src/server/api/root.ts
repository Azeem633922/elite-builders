import { createCallerFactory, createTRPCRouter } from './trpc';
import { challengeRouter } from './routers/challenge';
import { submissionRouter } from './routers/submission';
import { userRouter } from './routers/user';
import { scoreRouter } from './routers/score';

export const appRouter = createTRPCRouter({
  challenge: challengeRouter,
  submission: submissionRouter,
  user: userRouter,
  score: scoreRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
