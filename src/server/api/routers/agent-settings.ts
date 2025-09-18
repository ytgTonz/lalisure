import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { agentSettingsSchema } from '@/lib/validations/agent';
import { UserRole } from '@prisma/client';

export const agentSettingsRouter = createTRPCRouter({
  // Get current user's agent settings
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        agentCode: true,
        licenseNumber: true,
        commissionRate: true,
        streetAddress: true,
        city: true,
        province: true,
        postalCode: true,
        country: true,
        agentPreferences: true,
        workingHours: true,
        role: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Transform the data to match the expected format
    return {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      phone: user.phone || '',
      agentCode: user.agentCode || '',
      licenseNumber: user.licenseNumber || '',
      commissionRate: user.commissionRate || 0,
      address: {
        street: user.streetAddress || '',
        city: user.city || '',
        province: user.province || '',
        postalCode: user.postalCode || '',
        country: user.country || 'South Africa',
      },
      preferences: user.agentPreferences || {
        emailNotifications: true,
        smsNotifications: true,
        weeklyReports: true,
        autoFollowUp: false,
        timezone: 'Africa/Johannesburg',
        language: 'en',
      },
      workingHours: user.workingHours || {
        monday: { enabled: true, start: '08:00', end: '17:00' },
        tuesday: { enabled: true, start: '08:00', end: '17:00' },
        wednesday: { enabled: true, start: '08:00', end: '17:00' },
        thursday: { enabled: true, start: '08:00', end: '17:00' },
        friday: { enabled: true, start: '08:00', end: '17:00' },
        saturday: { enabled: false, start: '09:00', end: '13:00' },
        sunday: { enabled: false, start: '09:00', end: '13:00' },
      },
    };
  }),

  // Update current user's agent settings
  updateSettings: protectedProcedure
    .input(agentSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if user exists and is an agent
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { id: true, role: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Only agents can update agent-specific settings
      if (user.role !== UserRole.AGENT && user.role !== UserRole.ADMIN) {
        throw new Error('Only agents can update agent settings');
      }

      // Check if agent code is unique (if provided and different from current)
      if (input.agentCode) {
        const existingAgent = await ctx.db.user.findFirst({
          where: {
            agentCode: input.agentCode,
            id: { not: user.id },
          },
        });

        if (existingAgent) {
          throw new Error('Agent code already exists');
        }
      }

      // Update user settings
      const updatedUser = await ctx.db.user.update({
        where: { id: user.id },
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          phone: input.phone,
          agentCode: input.agentCode,
          licenseNumber: input.licenseNumber,
          commissionRate: input.commissionRate,
          streetAddress: input.address.street,
          city: input.address.city,
          province: input.address.province,
          postalCode: input.address.postalCode,
          country: input.address.country,
          agentPreferences: input.preferences,
          workingHours: input.workingHours,
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          agentCode: true,
          licenseNumber: true,
          commissionRate: true,
          streetAddress: true,
          city: true,
          province: true,
          postalCode: true,
          country: true,
          agentPreferences: true,
          workingHours: true,
        },
      });

      return {
        success: true,
        message: 'Settings updated successfully',
        user: updatedUser,
      };
    }),

  // Get agent code availability
  checkAgentCode: protectedProcedure
    .input(z.object({ agentCode: z.string() }))
    .query(async ({ ctx, input }) => {
      const existingAgent = await ctx.db.user.findFirst({
        where: {
          agentCode: input.agentCode,
          id: { not: ctx.session.user.id },
        },
      });

      return {
        available: !existingAgent,
        message: existingAgent ? 'Agent code already exists' : 'Agent code is available',
      };
    }),

  // Get all agents (for admin use)
  getAllAgents: protectedProcedure.query(async ({ ctx }) => {
    // Check if user is admin
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== UserRole.ADMIN) {
      throw new Error('Unauthorized: Admin access required');
    }

    const agents = await ctx.db.user.findMany({
      where: { role: UserRole.AGENT },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        agentCode: true,
        licenseNumber: true,
        commissionRate: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return agents;
  }),
});
