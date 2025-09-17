import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure
} from "@/server/api/trpc";
import { UserRole, InvitationStatus } from '@prisma/client';
import { TRPCError } from "@trpc/server";
import { randomBytes } from "crypto";
import { NotificationService } from '@/lib/services/notification';

const createInvitationSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(UserRole),
  department: z.string().optional(),
  message: z.string().optional(),
});

const updateInvitationSchema = z.object({
  id: z.string(),
  status: z.nativeEnum(InvitationStatus).optional(),
  role: z.nativeEnum(UserRole).optional(),
});

export const invitationRouter = createTRPCRouter({
  // Create a new invitation (Admin only)
  create: adminProcedure
    .input(createInvitationSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if user already exists
      const existingUser = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A user with this email already exists",
        });
      }

      // Check if there's already a pending invitation
      const existingInvitation = await ctx.db.invitation.findFirst({
        where: {
          email: input.email,
          status: InvitationStatus.PENDING,
        },
      });

      if (existingInvitation) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A pending invitation already exists for this email",
        });
      }

      // Generate unique token
      const token = randomBytes(32).toString('hex');
      
      // Create invitation with 7 days expiry
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const invitation = await ctx.db.invitation.create({
        data: {
          email: input.email,
          role: input.role,
          token,
          department: input.department,
          message: input.message,
          invitedBy: ctx.user.id,
          expiresAt,
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

      // Send invitation email using enhanced EmailService
      const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/accept-invitation/${token}`;

      const { EmailService } = await import('@/lib/services/email');
      const { EmailType } = await import('@prisma/client');

      await EmailService.sendTrackedEmail({
        to: input.email,
        subject: `You're invited to join Home Insurance Platform - ${input.role} Role`,
        html: EmailService.generateInvitationHtml({
          inviteeEmail: input.email,
          inviterName: `${ctx.user.firstName || ''} ${ctx.user.lastName || ''}`.trim(),
          role: input.role,
          department: input.department,
          message: input.message,
          acceptUrl,
          expiresAt: expiresAt.toISOString(),
        }),
        type: EmailType.INVITATION,
        userId: ctx.user.id,
        metadata: {
          invitationId: invitation.id,
          role: input.role,
          department: input.department,
          expiresAt: expiresAt.toISOString()
        }
      });

      return invitation;
    }),

  // Get all invitations (Admin only)
  getAll: adminProcedure
    .input(z.object({
      status: z.nativeEnum(InvitationStatus).optional(),
      role: z.nativeEnum(UserRole).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const whereClause: any = {};
      
      if (input?.status) {
        whereClause.status = input.status;
      }
      
      if (input?.role) {
        whereClause.role = input.role;
      }

      const invitations = await ctx.db.invitation.findMany({
        where: whereClause,
        include: {
          inviter: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return invitations;
    }),

  // Get invitation by token (Public endpoint for accepting invitations)
  getByToken: protectedProcedure
    .input(z.object({
      token: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const invitation = await ctx.db.invitation.findUnique({
        where: { token: input.token },
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

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      if (invitation.status !== InvitationStatus.PENDING) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This invitation is no longer valid",
        });
      }

      if (invitation.expiresAt < new Date()) {
        // Mark as expired
        await ctx.db.invitation.update({
          where: { id: invitation.id },
          data: { status: InvitationStatus.EXPIRED },
        });

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This invitation has expired",
        });
      }

      return invitation;
    }),

  // Accept invitation (sets user role)
  accept: protectedProcedure
    .input(z.object({
      token: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const invitation = await ctx.db.invitation.findUnique({
        where: { token: input.token },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      if (invitation.status !== InvitationStatus.PENDING) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This invitation is no longer valid",
        });
      }

      if (invitation.expiresAt < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This invitation has expired",
        });
      }

      if (invitation.email !== ctx.user.email) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This invitation is not for your email address",
        });
      }

      // Update user role and mark invitation as accepted
      const [updatedUser] = await ctx.db.$transaction([
        ctx.db.user.update({
          where: { id: ctx.user.id },
          data: { role: invitation.role },
        }),
        ctx.db.invitation.update({
          where: { id: invitation.id },
          data: {
            status: InvitationStatus.ACCEPTED,
            acceptedAt: new Date(),
            acceptedBy: ctx.user.id,
          },
        }),
      ]);

      return updatedUser;
    }),

  // Update invitation (Admin only)
  update: adminProcedure
    .input(updateInvitationSchema)
    .mutation(async ({ ctx, input }) => {
      const invitation = await ctx.db.invitation.findUnique({
        where: { id: input.id },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      const updatedInvitation = await ctx.db.invitation.update({
        where: { id: input.id },
        data: {
          status: input.status,
          role: input.role,
          updatedAt: new Date(),
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

      return updatedInvitation;
    }),

  // Cancel invitation (Admin only)
  cancel: adminProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const invitation = await ctx.db.invitation.update({
        where: { id: input.id },
        data: {
          status: InvitationStatus.CANCELLED,
          updatedAt: new Date(),
        },
      });

      return invitation;
    }),

  // Resend invitation (Admin only)
  resend: adminProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const invitation = await ctx.db.invitation.findUnique({
        where: { id: input.id },
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

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      // Generate new token and extend expiry
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const updatedInvitation = await ctx.db.invitation.update({
        where: { id: input.id },
        data: {
          token,
          expiresAt,
          status: InvitationStatus.PENDING,
          updatedAt: new Date(),
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

      // Send invitation email
      const acceptUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/accept-invitation/${updatedInvitation.token}`;
      await NotificationService.notifyInvitation({
        inviteeEmail: updatedInvitation.email,
        inviterName: `${ctx.user.firstName || ''} ${ctx.user.lastName || ''}`.trim(),
        role: updatedInvitation.role,
        department: updatedInvitation.department || undefined,
        message: updatedInvitation.message || undefined,
        acceptUrl,
        expiresAt: updatedInvitation.expiresAt.toISOString(),
      });

      return updatedInvitation;
    }),

  // Get invitation statistics (Admin only)
  getStats: adminProcedure
    .query(async ({ ctx }) => {
      const [total, pending, accepted, expired, cancelled] = await Promise.all([
        ctx.db.invitation.count(),
        ctx.db.invitation.count({ where: { status: InvitationStatus.PENDING } }),
        ctx.db.invitation.count({ where: { status: InvitationStatus.ACCEPTED } }),
        ctx.db.invitation.count({ where: { status: InvitationStatus.EXPIRED } }),
        ctx.db.invitation.count({ where: { status: InvitationStatus.CANCELLED } }),
      ]);

      const roleDistribution = await ctx.db.invitation.groupBy({
        by: ['role'],
        _count: {
          role: true,
        },
      });

      return {
        total,
        byStatus: {
          pending,
          accepted,
          expired,
          cancelled,
        },
        byRole: roleDistribution.reduce((acc, item) => {
          acc[item.role] = item._count.role;
          return acc;
        }, {} as Record<UserRole, number>),
      };
    }),
});