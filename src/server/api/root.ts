import { createTRPCRouter } from '@/server/api/trpc';
import { userRouter } from '@/server/api/routers/user';
import { policyRouter } from '@/server/api/routers/policy';
import { claimRouter } from '@/server/api/routers/claim';

export const appRouter = createTRPCRouter({
  user: userRouter,
  policy: policyRouter,
  claim: claimRouter,
});

export type AppRouter = typeof appRouter;