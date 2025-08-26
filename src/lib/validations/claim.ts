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
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().min(5, 'Valid zip code is required'),
    what3words: z.string().optional(),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }).optional(),
  }),
  estimatedAmount: z.number().min(0, 'Amount must be positive').optional(),
  witnesses: z.array(z.object({
    name: z.string().min(1, 'Witness name is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
    email: z.string().email('Valid email is required').optional(),
  })).optional(),
  policeReport: z.object({
    reportNumber: z.string().optional(),
    officerName: z.string().optional(),
    department: z.string().optional(),
    filed: z.boolean().default(false),
  }).optional(),
  medicalTreatment: z.object({
    received: z.boolean().default(false),
    provider: z.string().optional(),
    hospitalName: z.string().optional(),
    treatmentDate: z.date().optional(),
  }).optional(),
  vehicleDetails: z.object({
    drivable: z.boolean().optional(),
    towedTo: z.string().optional(),
    damageDescription: z.string().optional(),
    airbagDeployed: z.boolean().optional(),
  }).optional(),
  propertyDetails: z.object({
    damageType: z.string().optional(),
    affectedAreas: z.array(z.string()).optional(),
    structuralDamage: z.boolean().optional(),
    temporaryRepairs: z.boolean().optional(),
  }).optional(),
  documents: z.array(z.object({
    name: z.string(),
    type: z.string(),
    url: z.string(),
    size: z.number(),
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