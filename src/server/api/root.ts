import { createTRPCRouter } from '@/server/api/trpc';
import { userRouter } from '@/server/api/routers/user';
import { policyRouter } from '@/server/api/routers/policy';
import { claimRouter } from '@/server/api/routers/claim';
import { notificationRouter } from '@/server/api/routers/notification';
import { paymentRouter } from '@/server/api/routers/payment';
import { invitationRouter } from '@/server/api/routers/invitation';
import { emailTemplateRouter } from '@/server/api/routers/email-template';
import { settingsRouter } from '@/server/api/routers/settings';
import { securityRouter } from '@/server/api/routers/security';
import { analyticsRouter } from '@/server/api/routers/analytics';
import { emailAnalyticsRouter } from '@/server/api/routers/email-analytics';
import { emailRouter } from '@/server/api/routers/email';
import { agentSettingsRouter } from '@/server/api/routers/agent-settings';

export const appRouter = createTRPCRouter({
  user: userRouter,
  policy: policyRouter,
  claim: claimRouter,
  notification: notificationRouter,
  payment: paymentRouter,
  invitation: invitationRouter,
  emailTemplate: emailTemplateRouter,
  settings: settingsRouter,
  security: securityRouter,
  analytics: analyticsRouter,
  emailAnalytics: emailAnalyticsRouter,
  email: emailRouter,
  agentSettings: agentSettingsRouter,
});

export type AppRouter = typeof appRouter;