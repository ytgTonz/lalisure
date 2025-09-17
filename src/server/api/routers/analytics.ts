import { z } from 'zod';
import { createTRPCRouter, adminProcedure } from '@/server/api/trpc';

type TimeRange = '7d' | '30d' | '90d' | '1y';

export const analyticsRouter = createTRPCRouter({
  // Get revenue analytics by time range
  getRevenue: adminProcedure
    .input(z.object({
      timeRange: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
    }))
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const startDate = new Date();

      // Calculate start date based on time range
      switch (input.timeRange) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Get total revenue for the period
      const totalRevenue = await ctx.db.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: startDate,
            lte: now
          }
        },
        _sum: {
          amount: true
        }
      });

      // Get revenue by payment method
      const revenueByMethod = await ctx.db.payment.groupBy({
        by: ['method'],
        where: {
          status: 'COMPLETED',
          createdAt: {
            gte: startDate,
            lte: now
          }
        },
        _sum: {
          amount: true
        },
        _count: true
      });

      // Get revenue trend (daily for last 30 days)
      const dailyRevenue = await ctx.db.$queryRaw<Array<{ date: string; revenue: number }>>`
        SELECT
          DATE(createdAt) as date,
          SUM(amount) as revenue
        FROM Payment
        WHERE status = 'COMPLETED'
          AND createdAt >= ${startDate}
          AND createdAt <= ${now}
        GROUP BY DATE(createdAt)
        ORDER BY DATE(createdAt)
      `;

      return {
        totalRevenue: totalRevenue._sum.amount || 0,
        revenueByMethod: revenueByMethod.map(item => ({
          method: item.method,
          amount: item._sum.amount || 0,
          count: item._count
        })),
        dailyRevenue: dailyRevenue.map(item => ({
          date: item.date,
          revenue: Number(item.revenue)
        }))
      };
    }),

  // Get policy metrics
  getPolicyMetrics: adminProcedure
    .input(z.object({
      timeRange: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
    }))
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const startDate = new Date();

      switch (input.timeRange) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Get policy statistics
      const [
        totalPolicies,
        activePolicies,
        pendingPolicies,
        expiredPolicies,
        newPolicies
      ] = await Promise.all([
        ctx.db.policy.count(),
        ctx.db.policy.count({ where: { status: 'ACTIVE' } }),
        ctx.db.policy.count({ where: { status: 'PENDING_REVIEW' } }),
        ctx.db.policy.count({ where: { status: 'EXPIRED' } }),
        ctx.db.policy.count({
          where: {
            createdAt: {
              gte: startDate,
              lte: now
            }
          }
        })
      ]);

      // Get total premium value
      const totalPremium = await ctx.db.policy.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { premium: true }
      });

      // Get policy types distribution
      const policiesByType = await ctx.db.policy.groupBy({
        by: ['type'],
        _count: true,
        where: { status: 'ACTIVE' }
      });

      // Get average premium by policy type
      const avgPremiumByType = await ctx.db.policy.groupBy({
        by: ['type'],
        _avg: { premium: true },
        where: { status: 'ACTIVE' }
      });

      return {
        totalPolicies,
        activePolicies,
        pendingPolicies,
        expiredPolicies,
        newPolicies,
        totalPremium: totalPremium._sum.premium || 0,
        policiesByType: policiesByType.map(item => ({
          type: item.type,
          count: item._count
        })),
        avgPremiumByType: avgPremiumByType.map(item => ({
          type: item.type,
          avgPremium: item._avg.premium || 0
        }))
      };
    }),

  // Get claims analytics
  getClaimsMetrics: adminProcedure
    .input(z.object({
      timeRange: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
    }))
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const startDate = new Date();

      switch (input.timeRange) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Get claims statistics
      const [
        totalClaims,
        submittedClaims,
        reviewingClaims,
        approvedClaims,
        settledClaims,
        rejectedClaims,
        newClaims
      ] = await Promise.all([
        ctx.db.claim.count(),
        ctx.db.claim.count({ where: { status: 'SUBMITTED' } }),
        ctx.db.claim.count({ where: { status: 'UNDER_REVIEW' } }),
        ctx.db.claim.count({ where: { status: 'APPROVED' } }),
        ctx.db.claim.count({ where: { status: 'SETTLED' } }),
        ctx.db.claim.count({ where: { status: 'REJECTED' } }),
        ctx.db.claim.count({
          where: {
            createdAt: {
              gte: startDate,
              lte: now
            }
          }
        })
      ]);

      // Get total claim value
      const totalClaimValue = await ctx.db.claim.aggregate({
        where: { status: 'SETTLED' },
        _sum: { amount: true }
      });

      // Get claims by type
      const claimsByType = await ctx.db.claim.groupBy({
        by: ['type'],
        _count: true,
        _sum: { amount: true }
      });

      // Get average processing time (mock calculation for now)
      const avgProcessingTime = 3.2; // days

      return {
        totalClaims,
        submittedClaims,
        reviewingClaims,
        approvedClaims,
        settledClaims,
        rejectedClaims,
        newClaims,
        totalClaimValue: totalClaimValue._sum.amount || 0,
        claimsByType: claimsByType.map(item => ({
          type: item.type,
          count: item._count,
          totalValue: item._sum.amount || 0
        })),
        avgProcessingTime
      };
    }),

  // Get user analytics
  getUserMetrics: adminProcedure
    .input(z.object({
      timeRange: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
    }))
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const startDate = new Date();

      switch (input.timeRange) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Get user statistics
      const [
        totalUsers,
        activeUsers,
        newUsers,
        customerCount,
        agentCount,
        underwriterCount,
        adminCount
      ] = await Promise.all([
        ctx.db.user.count(),
        ctx.db.user.count({
          where: {
            updatedAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        }),
        ctx.db.user.count({
          where: {
            createdAt: {
              gte: startDate,
              lte: now
            }
          }
        }),
        ctx.db.user.count({ where: { role: 'CUSTOMER' } }),
        ctx.db.user.count({ where: { role: 'AGENT' } }),
        ctx.db.user.count({ where: { role: 'UNDERWRITER' } }),
        ctx.db.user.count({ where: { role: 'ADMIN' } })
      ]);

      // Get user registration trend
      const userRegistrationTrend = await ctx.db.$queryRaw<Array<{ date: string; count: number }>>`
        SELECT
          DATE(createdAt) as date,
          COUNT(*) as count
        FROM User
        WHERE createdAt >= ${startDate}
          AND createdAt <= ${now}
        GROUP BY DATE(createdAt)
        ORDER BY DATE(createdAt)
      `;

      // Get user activity (users with recent logins)
      const activeUserCount = await ctx.db.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      });

      return {
        totalUsers,
        activeUsers,
        newUsers,
        userBreakdown: {
          customers: customerCount,
          agents: agentCount,
          underwriters: underwriterCount,
          admins: adminCount
        },
        userRegistrationTrend: userRegistrationTrend.map(item => ({
          date: item.date,
          count: Number(item.count)
        })),
        activeUserCount
      };
    }),

  // Get dashboard overview metrics
  getOverview: adminProcedure.query(async ({ ctx }) => {
    const [
      totalRevenue,
      totalPolicies,
      activePolicies,
      totalClaims,
      totalUsers,
      newUsersThisMonth,
      pendingClaims
    ] = await Promise.all([
      ctx.db.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      ctx.db.policy.count(),
      ctx.db.policy.count({ where: { status: 'ACTIVE' } }),
      ctx.db.claim.count(),
      ctx.db.user.count(),
      ctx.db.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      ctx.db.claim.count({
        where: {
          status: { in: ['SUBMITTED', 'UNDER_REVIEW'] }
        }
      })
    ]);

    // Calculate growth rates (comparing with previous month)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const [
      lastMonthRevenue,
      lastMonthPolicies,
      lastMonthUsers
    ] = await Promise.all([
      ctx.db.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { lte: lastMonth }
        },
        _sum: { amount: true }
      }),
      ctx.db.policy.count({
        where: { createdAt: { lte: lastMonth } }
      }),
      ctx.db.user.count({
        where: { createdAt: { lte: lastMonth } }
      })
    ]);

    const revenueGrowth = lastMonthRevenue._sum.amount
      ? ((totalRevenue._sum.amount || 0) - lastMonthRevenue._sum.amount) / lastMonthRevenue._sum.amount * 100
      : 0;

    const policyGrowth = lastMonthPolicies
      ? (totalPolicies - lastMonthPolicies) / lastMonthPolicies * 100
      : 0;

    const userGrowth = lastMonthUsers
      ? (totalUsers - lastMonthUsers) / lastMonthUsers * 100
      : 0;

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      totalPolicies,
      activePolicies,
      totalClaims,
      totalUsers,
      newUsersThisMonth,
      pendingClaims,
      revenueGrowth,
      policyGrowth,
      userGrowth
    };
  }),

  // Export analytics data
  exportData: adminProcedure
    .input(z.object({
      type: z.enum(['revenue', 'policies', 'claims', 'users']),
      timeRange: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
      format: z.enum(['json', 'csv']).default('json')
    }))
    .mutation(async ({ ctx, input }) => {
      // This would implement data export functionality
      // For now, return a placeholder
      return {
        message: `Exporting ${input.type} data for ${input.timeRange} in ${input.format} format`,
        status: 'processing'
      };
    })
});
