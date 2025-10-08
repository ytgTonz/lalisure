import { PrismaClient } from '@prisma/client';
import {
  createPrismaMonitoringMiddleware,
  createPrismaLoggingMiddleware,
  createPrismaErrorMiddleware,
} from './middleware/prisma-monitoring';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Only add middleware if $use is available (Node.js runtime only)
// In Edge runtime or during build, skip middleware
if (typeof db.$use === 'function') {
  try {
    // Add performance monitoring middleware
    db.$use(createPrismaMonitoringMiddleware());

    // Add error logging middleware
    db.$use(createPrismaErrorMiddleware());

    // Add detailed logging in development
    if (process.env.NODE_ENV === 'development') {
      db.$use(createPrismaLoggingMiddleware());
    }
  } catch (error) {
    // Silently fail if middleware cannot be added
    console.warn('Failed to add Prisma middleware:', error);
  }
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;