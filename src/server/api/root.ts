import { createTRPCRouter } from '@/server/api/trpc';
import { userRouter } from '@/server/api/routers/user';
import { policyRouter } from '@/server/api/routers/policy';
import { claimRouter } from '@/server/api/routers/claim';
import { notificationRouter } from '@/server/api/routers/notification';
import { paymentRouter } from '@/server/api/routers/payment';
import { invitationRouter } from '@/server/api/routers/invitation';

export const appRouter = createTRPCRouter({
  user: userRouter,
  policy: policyRouter,
  claim: claimRouter,
  notification: notificationRouter,
  payment: paymentRouter,
  invitation: invitationRouter,
});

export type AppRouter = typeof appRouter;