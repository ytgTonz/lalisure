import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure, adminProcedure } from '@/server/api/trpc';
import { TRPCError } from "@trpc/server";
import { UserRole, UserStatus } from '@prisma/client';
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

  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
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
      status: z.nativeEnum(UserStatus).optional(),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const whereClause: {
        role?: UserRole;
        status?: UserStatus;
        OR?: Array<{
          firstName?: { contains: string; mode: 'insensitive' };
          lastName?: { contains: string; mode: 'insensitive' };
          email?: { contains: string; mode: 'insensitive' };
        }>;
      } = {};
      
      if (input.role) {
        whereClause.role = input.role;
      }
      
      if (input.status) {
        whereClause.status = input.status;
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
        ctx.req?.headers.get('x-forwarded-for') || 'unknown',
        ctx.req?.headers.get('user-agent') || 'unknown'
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
            ctx.req?.headers.get('x-forwarded-for') || 'unknown',
            ctx.req?.headers.get('user-agent') || 'unknown'
          );

          return updatedUser;
        })
      );

      // Log bulk role update
      await SecurityLogger.logSystemAccess(
        ctx.userId,
        ctx.user.email,
        `Bulk updated roles for ${updatedUsers.length} users to ${input.newRole}`,
        ctx.req?.headers.get('x-forwarded-for') || 'unknown',
        ctx.req?.headers.get('user-agent') || 'unknown',
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
      // Get users first to check if any are the current admin
      const users = await ctx.db.user.findMany({
        where: { id: { in: input.userIds } }
      });

      // Prevent admin from deactivating themselves
      const currentUserInList = users.find(user => user.id === ctx.user.id);
      if (currentUserInList && !input.active) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot deactivate your own account",
        });
      }

      // Update user statuses
      const newStatus = input.active ? UserStatus.ACTIVE : UserStatus.INACTIVE;
      await ctx.db.user.updateMany({
        where: { id: { in: input.userIds } },
        data: { status: newStatus }
      });

      // Log bulk activation/deactivation
      await SecurityLogger.logSystemAccess(
        ctx.userId,
        ctx.user.email,
        `Bulk ${input.active ? 'activated' : 'deactivated'} ${users.length} users`,
        ctx.req?.headers.get('x-forwarded-for') || 'unknown',
        ctx.req?.headers.get('user-agent') || 'unknown',
        { userIds: input.userIds, active: input.active, count: users.length }
      );

      return { processedCount: users.length };
    }),

  // Admin: Bulk send invitations
  bulkInvite: adminProcedure
    .input(z.object({
      emails: z.array(z.string().email()),
      role: z.nativeEnum(UserRole).optional().default(UserRole.CUSTOMER),
    }))
    .mutation(async ({ ctx, input }) => {
      const { randomBytes } = await import('crypto');
      
      const invitations = await Promise.all(
        input.emails.map(async (email) => {
          const token = randomBytes(32).toString('hex');
          
          const invitation = await ctx.db.invitation.create({
            data: {
              email,
              role: input.role,
              invitedBy: ctx.userId,
              token,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            },
            include: {
              inviter: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          });

          // Send invitation email using proper template system
          const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/accept-invitation/${token}`;

          try {
            const { EmailService } = await import('@/lib/services/email');
            const { EmailType } = await import('@prisma/client');

            // Use the proper invitation template with generateInvitationHtml
            const htmlContent = EmailService.generateInvitationHtml({
              inviteeEmail: email,
              inviterName: `${invitation.inviter.firstName} ${invitation.inviter.lastName}`,
              role: input.role,
              acceptUrl,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            });

            await EmailService.sendTrackedEmail({
              to: email,
              type: EmailType.INVITATION,
              subject: `You're invited to join Lalisure - ${input.role} Role`,
              html: htmlContent,
              metadata: {
                invitationId: invitation.id,
                role: input.role,
              },
            });
          } catch (emailError) {
            console.error(`Failed to send invitation email to ${email}:`, emailError);
          }

          return invitation;
        })
      );

      // Log bulk invitations
      await SecurityLogger.logSystemAccess(
        ctx.userId,
        ctx.user.email,
        `Sent bulk invitations to ${invitations.length} users`,
        ctx.req?.headers.get('x-forwarded-for') || 'unknown',
        ctx.req?.headers.get('user-agent') || 'unknown',
        { emails: input.emails, role: input.role, count: invitations.length }
      );

      return { sentCount: invitations.length };
    }),

  // Admin: Create new user
  createUser: adminProcedure
    .input(z.object({
      email: z.string().email(),
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      role: z.nativeEnum(UserRole),
      phone: z.string().optional(),
      sendInvitation: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user already exists
      const existingUser = await ctx.db.user.findUnique({
        where: { email: input.email }
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      // Create the user
      const newUser = await ctx.db.user.create({
        data: {
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          role: input.role,
          phone: input.phone,
          emailVerified: false,
          phoneVerified: false,
          idVerified: false,
        },
      });

      // Send invitation if requested
      if (input.sendInvitation) {
        const { randomBytes } = await import('crypto');
        const token = randomBytes(32).toString('hex');
        
        // Create invitation with proper token
        const invitation = await ctx.db.invitation.create({
          data: {
            email: input.email,
            role: input.role,
            invitedBy: ctx.userId,
            token,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
          },
          include: {
            inviter: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        });

        // Send invitation email using proper template system
        const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/accept-invitation/${token}`;

        try {
          const { EmailService } = await import('@/lib/services/email');
          const { EmailType } = await import('@prisma/client');

          // Use the proper invitation template with generateInvitationHtml
          const htmlContent = EmailService.generateInvitationHtml({
            inviteeEmail: input.email,
            inviterName: `${invitation.inviter.firstName} ${invitation.inviter.lastName}`,
            role: input.role,
            acceptUrl,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          });

          await EmailService.sendTrackedEmail({
            to: input.email,
            type: EmailType.INVITATION,
            subject: `You're invited to join Lalisure - ${input.role} Role`,
            html: htmlContent,
            metadata: {
              invitationId: invitation.id,
              role: input.role,
            },
          });
        } catch (emailError) {
          console.error('Failed to send invitation email:', emailError);
          // Don't fail the user creation if email fails
        }
      }

      // Log user creation
      await SecurityLogger.logSystemAccess(
        ctx.userId,
        ctx.user.email,
        `Created new user: ${input.email} with role ${input.role}`,
        ctx.req?.headers.get('x-forwarded-for') || 'unknown',
        ctx.req?.headers.get('user-agent') || 'unknown',
        { createdUserId: newUser.id, email: input.email, role: input.role }
      );

      return newUser;
    }),

  // Admin: Update user details
  updateUser: adminProcedure
    .input(z.object({
      userId: z.string(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      role: z.nativeEnum(UserRole).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId, ...updateData } = input;

      // Check if user exists
      const existingUser = await ctx.db.user.findUnique({
        where: { id: userId }
      });

      if (!existingUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // If email is being updated, check for conflicts
      if (input.email && input.email !== existingUser.email) {
        const emailConflict = await ctx.db.user.findUnique({
          where: { email: input.email }
        });

        if (emailConflict) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already in use by another user",
          });
        }
      }

      // Update the user
      const updatedUser = await ctx.db.user.update({
        where: { id: userId },
        data: updateData,
      });

      // Log role change if role was updated
      if (input.role && input.role !== existingUser.role) {
        await SecurityLogger.logRoleChange(
          userId,
          existingUser.email,
          existingUser.role,
          input.role,
          ctx.user.email,
          ctx.req?.headers.get('x-forwarded-for') || 'unknown',
          ctx.req?.headers.get('user-agent') || 'unknown'
        );
      }

      // Log user update
      await SecurityLogger.logSystemAccess(
        ctx.userId,
        ctx.user.email,
        `Updated user: ${existingUser.email}`,
        ctx.req?.headers.get('x-forwarded-for') || 'unknown',
        ctx.req?.headers.get('user-agent') || 'unknown',
        { updatedUserId: userId, changes: updateData }
      );

      return updatedUser;
    }),

  // Admin: Delete user
  deleteUser: adminProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
        include: {
          policies: true,
          claims: true,
        }
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Prevent deletion of users with active policies
      const activePolicies = user.policies.filter(p => p.status === 'ACTIVE');
      if (activePolicies.length > 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot delete user with active policies",
        });
      }

      // Prevent admin from deleting themselves
      if (user.id === ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot delete your own account",
        });
      }

      // Delete the user (cascading deletes will handle related records)
      await ctx.db.user.delete({
        where: { id: input.userId }
      });

      // Log user deletion
      await SecurityLogger.logSystemAccess(
        ctx.userId,
        ctx.user.email,
        `Deleted user: ${user.email}`,
        ctx.req?.headers.get('x-forwarded-for') || 'unknown',
        ctx.req?.headers.get('user-agent') || 'unknown',
        { deletedUserId: input.userId, deletedUserEmail: user.email }
      );

      return { success: true };
    }),

  // Admin: Update user status
  updateUserStatus: adminProcedure
    .input(z.object({
      userId: z.string(),
      status: z.nativeEnum(UserStatus),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId }
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Prevent admin from deactivating themselves
      if (user.id === ctx.user.id && input.status !== UserStatus.ACTIVE) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot deactivate your own account",
        });
      }

      const oldStatus = user.status;
      const updatedUser = await ctx.db.user.update({
        where: { id: input.userId },
        data: { status: input.status },
      });

      // Log status change
      await SecurityLogger.logSystemAccess(
        ctx.userId,
        ctx.user.email,
        `Changed user status: ${user.email} from ${oldStatus} to ${input.status}`,
        ctx.req?.headers.get('x-forwarded-for') || 'unknown',
        ctx.req?.headers.get('user-agent') || 'unknown',
        { userId: input.userId, oldStatus, newStatus: input.status }
      );

      return updatedUser;
    }),

  // Get user by ID with full details
  getUserById: adminProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
        include: {
          policies: {
            select: { id: true, policyNumber: true, status: true, premium: true }
          },
          claims: {
            select: { id: true, claimNumber: true, status: true, amount: true }
          }
        }
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return {
        ...user,
        policiesCount: user.policies.length,
        claimsCount: user.claims.length,
      };
    }),
});