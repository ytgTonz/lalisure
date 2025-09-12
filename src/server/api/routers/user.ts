import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure } from '@/server/api/trpc';
import { TRPCError } from "@trpc/server";
import { UserRole } from '@prisma/client';
import { SecurityLogger } from '@/lib/services/security-logger';

// Temporary enum definitions until Prisma client is regenerated
enum IdType {
  ID = 'ID',
  PASSPORT = 'PASSPORT',
}

enum EmploymentStatus {
  EMPLOYED = 'EMPLOYED',
  SELF_EMPLOYED = 'SELF_EMPLOYED',
  UNEMPLOYED = 'UNEMPLOYED',
  STUDENT = 'STUDENT',
  RETIRED = 'RETIRED',
  PENSIONER = 'PENSIONER',
}

export const userRouter = createTRPCRouter({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),

  createProfile: publicProcedure
    .input(
      z.object({
        clerkId: z.string(),
        email: z.string().email(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.create({
        data: {
          clerkId: input.clerkId,
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          role: UserRole.CUSTOMER,
        },
      });
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        // Basic Information
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        avatar: z.string().optional(),
        
        // Extended Profile Information
        dateOfBirth: z.date().optional(),
        idNumber: z.string().optional(),
        idType: z.nativeEnum(IdType).optional(),
        country: z.string().optional(),
        workPhone: z.string().optional(),
        
        // Address Information
        streetAddress: z.string().optional(),
        city: z.string().optional(),
        province: z.string().optional(),
        postalCode: z.string().optional(),
        
        // Employment Details
        employmentStatus: z.nativeEnum(EmploymentStatus).optional(),
        employer: z.string().optional(),
        jobTitle: z.string().optional(),
        workAddress: z.string().optional(),
        
        // Income Details
        monthlyIncome: z.number().positive().optional(),
        incomeSource: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: {
          id: ctx.user.id,
        },
        data: input,
      });
    }),

  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const [policiesCount, claimsCount, activePoliciесCount] = await Promise.all([
      ctx.db.policy.count({
        where: { userId: ctx.user.id },
      }),
      ctx.db.claim.count({
        where: { userId: ctx.user.id },
      }),
      ctx.db.policy.count({
        where: { 
          userId: ctx.user.id,
          status: 'ACTIVE'
        },
      }),
    ]);

    return {
      policiesCount,
      claimsCount,
      activePoliciesCount: activePoliciесCount,
    };
  }),

  // Admin: Get all users with filters
  getAllUsers: adminProcedure // Temporarily changed from adminProcedure for testing
    .input(z.object({
      role: z.nativeEnum(UserRole).optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const whereClause: {
        role?: UserRole;
        OR?: Array<{
          firstName?: { contains: string; mode: 'insensitive' };
          lastName?: { contains: string; mode: 'insensitive' };
          email?: { contains: string; mode: 'insensitive' };
        }>;
      } = {};
      
      if (input.role) {
        whereClause.role = input.role;
      }
      
      if (input.search) {
        whereClause.OR = [
          { firstName: { contains: input.search, mode: 'insensitive' } },
          { lastName: { contains: input.search, mode: 'insensitive' } },
          { email: { contains: input.search, mode: 'insensitive' } },
        ];
      }

      const [users, total] = await Promise.all([
        ctx.db.user.findMany({
          where: whereClause,
          take: input.limit,
          skip: input.offset,
          orderBy: { createdAt: 'desc' },
          include: {
            policies: {
              select: { id: true }
            },
            claims: {
              select: { id: true }
            }
          }
        }),
        ctx.db.user.count({ where: whereClause })
      ]);

      return {
        users: users.map(user => ({
          ...user,
          policiesCount: user.policies.length,
          claimsCount: user.claims.length,
        })),
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Admin: Update user role
  updateRole: adminProcedure // Temporarily changed from adminProcedure for testing
    .input(z.object({
      userId: z.string(),
      newRole: z.nativeEnum(UserRole),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Prevent admin from demoting themselves
      if (user.clerkId === ctx.user.clerkId && input.newRole !== UserRole.ADMIN) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot change your own admin role",
        });
      }

      const oldRole = user.role;
      const updatedUser = await ctx.db.user.update({
        where: { id: input.userId },
        data: { role: input.newRole },
      });

      // Log the role change
      await SecurityLogger.logRoleChange(
        user.id,
        user.email,
        oldRole,
        input.newRole,
        ctx.user.email,
        ctx.req?.headers['x-forwarded-for'] as string,
        ctx.req?.headers['user-agent']
      );

      return updatedUser;
    }),

  // Admin: Get user statistics
  getUserStats: adminProcedure // Temporarily changed from adminProcedure for testing
    .query(async ({ ctx }) => {
      const [
        totalUsers,
        customerCount,
        agentCount,
        underwriterCount,
        adminCount,
        activeUsersThisMonth,
      ] = await Promise.all([
        ctx.db.user.count(),
        ctx.db.user.count({ where: { role: UserRole.CUSTOMER } }),
        ctx.db.user.count({ where: { role: UserRole.AGENT } }),
        ctx.db.user.count({ where: { role: UserRole.UNDERWRITER } }),
        ctx.db.user.count({ where: { role: UserRole.ADMIN } }),
        ctx.db.user.count({
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
      ]);

      return {
        total: totalUsers,
        byRole: {
          [UserRole.CUSTOMER]: customerCount,
          [UserRole.AGENT]: agentCount,
          [UserRole.UNDERWRITER]: underwriterCount,
          [UserRole.ADMIN]: adminCount,
        },
        activeThisMonth: activeUsersThisMonth,
      };
    }),

  // Admin: Bulk update user roles
  bulkUpdateRole: adminProcedure
    .input(z.object({
      userIds: z.array(z.string()),
      newRole: z.nativeEnum(UserRole),
    }))
    .mutation(async ({ ctx, input }) => {
      const users = await ctx.db.user.findMany({
        where: { id: { in: input.userIds } }
      });

      const updatedUsers = await Promise.all(
        users.map(async user => {
          const oldRole = user.role;
          const updatedUser = await ctx.db.user.update({
            where: { id: user.id },
            data: { role: input.newRole }
          });

          // Log role change
          await SecurityLogger.logRoleChange(
            user.id,
            user.email,
            oldRole,
            input.newRole,
            ctx.user.email,
            ctx.req?.headers['x-forwarded-for'] as string,
            ctx.req?.headers['user-agent']
          );

          return updatedUser;
        })
      );

      // Log bulk role update
      await SecurityLogger.logSystemAccess(
        ctx.userId,
        ctx.user.email,
        `Bulk updated roles for ${updatedUsers.length} users to ${input.newRole}`,
        ctx.req?.headers['x-forwarded-for'] as string,
        ctx.req?.headers['user-agent'],
        { userIds: input.userIds, newRole: input.newRole, count: updatedUsers.length }
      );

      return { updatedCount: updatedUsers.length };
    }),

  // Admin: Bulk activate/deactivate users
  bulkActivate: adminProcedure
    .input(z.object({
      userIds: z.array(z.string()),
      active: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Note: This would require adding an 'active' field to the User model
      // For now, we'll simulate this by updating a hypothetical field
      const users = await ctx.db.user.findMany({
        where: { id: { in: input.userIds } }
      });

      // Log bulk activation/deactivation
      await SecurityLogger.logSystemAccess(
        ctx.userId,
        ctx.user.email,
        `Bulk ${input.active ? 'activated' : 'deactivated'} ${users.length} users`,
        ctx.req?.headers['x-forwarded-for'] as string,
        ctx.req?.headers['user-agent'],
        { userIds: input.userIds, active: input.active, count: users.length }
      );

      return { processedCount: users.length };
    }),

  // Admin: Bulk send invitations
  bulkInvite: adminProcedure
    .input(z.object({
      emails: z.array(z.string().email()),
      role: z.nativeEnum(UserRole),
    }))
    .mutation(async ({ ctx, input }) => {
      const invitations = await Promise.all(
        input.emails.map(email => 
          ctx.db.invitation.create({
            data: {
              email,
              role: input.role,
              invitedBy: ctx.userId,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            }
          })
        )
      );

      // Log bulk invitations
      await SecurityLogger.logSystemAccess(
        ctx.userId,
        ctx.user.email,
        `Sent bulk invitations to ${invitations.length} users`,
        ctx.req?.headers['x-forwarded-for'] as string,
        ctx.req?.headers['user-agent'],
        { emails: input.emails, role: input.role, count: invitations.length }
      );

      return { sentCount: invitations.length };
    }),
});