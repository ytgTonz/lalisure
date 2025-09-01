import { z } from 'zod';
import { ClaimType, ClaimStatus } from '@prisma/client';

export const claimSubmissionSchema = z.object({
  policyId: z.string().min(1, 'Policy ID is required'),
  type: z.nativeEnum(ClaimType),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  incidentDate: z.date({
    required_error: 'Incident date is required',
  }),
  incidentLocation: z.object({
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    province: z.string().min(2, 'Province is required'),
    postalCode: z.string().min(4, 'Valid postal code is required'),
  }).optional(),
  what3words: z.string().optional(),
  estimatedAmount: z.number().min(0, 'Amount must be positive').optional(),
  witnesses: z.array(z.object({
    name: z.string().min(1, 'Witness name is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
    email: z.string().email('Valid email is required').optional(),
  })).optional(),
  documents: z.array(z.object({
    name: z.string(),
    type: z.string().optional(),
    url: z.string(),
    size: z.number(),
    mimeType: z.string().optional(),
  })).optional(),
});

export const claimUpdateSchema = z.object({
  id: z.string().min(1),
  status: z.nativeEnum(ClaimStatus).optional(),
  adjustorNotes: z.string().optional(),
  settlementAmount: z.number().min(0).optional(),
  denialReason: z.string().optional(),
  approvedAmount: z.number().min(0).optional(),
});

export const claimFilterSchema = z.object({
  search: z.string().optional(),
  type: z.nativeEnum(ClaimType).optional(),
  status: z.nativeEnum(ClaimStatus).optional(),
  policyId: z.string().optional(),
  userId: z.string().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  sortBy: z.enum(['createdAt', 'incidentDate', 'amount', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ClaimSubmissionInput = z.infer<typeof claimSubmissionSchema>;
export type ClaimUpdateInput = z.infer<typeof claimUpdateSchema>;
export type ClaimFilterInput = z.infer<typeof claimFilterSchema>;