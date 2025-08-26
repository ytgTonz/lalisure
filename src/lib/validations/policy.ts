import { z } from 'zod';
import { PolicyType } from '@prisma/client';

// Base policy validation schema
export const basePolicySchema = z.object({
  type: z.nativeEnum(PolicyType),
  startDate: z.date().min(new Date(), 'Start date must be in the future'),
  endDate: z.date(),
  deductible: z.number().min(0).max(50000),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

// Property information schema
export const propertyInfoSchema = z.object({
  address: z.string().min(10, 'Please enter a complete address'),
  propertyType: z.enum(['Single Family Home', 'Condo', 'Townhouse', 'Apartment', 'Mobile Home']),
  buildYear: z.number().min(1800).max(new Date().getFullYear()),
  squareFeet: z.number().min(100).max(50000),
  constructionType: z.enum(['frame', 'masonry', 'steel']).optional(),
  safetyFeatures: z.array(z.string()).optional(),
});

// Vehicle information schema
export const vehicleInfoSchema = z.object({
  make: z.string().min(1, 'Vehicle make is required'),
  model: z.string().min(1, 'Vehicle model is required'),
  year: z.number().min(1980).max(new Date().getFullYear() + 1),
  vin: z.string().min(17, 'VIN must be 17 characters').max(17, 'VIN must be 17 characters'),
  licensePlate: z.string().min(1, 'License plate is required'),
  safetyRating: z.number().min(1).max(5).optional(),
  annualMileage: z.number().min(1000).max(50000).optional(),
});

// Personal information schema
export const personalInfoSchema = z.object({
  dateOfBirth: z.date().max(new Date(), 'Date of birth cannot be in the future'),
  occupation: z.string().min(1, 'Occupation is required'),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
  smokingStatus: z.enum(['smoker', 'non-smoker', 'former-smoker']).optional(),
  healthConditions: z.array(z.string()).optional(),
});

// Coverage options schema
export const coverageOptionsSchema = z.object({
  dwelling: z.number().min(50000).max(5000000).optional(),
  personalProperty: z.number().min(10000).max(1000000).optional(),
  liability: z.number().min(100000).max(2000000).optional(),
  medicalPayments: z.number().min(1000).max(50000).optional(),
  collision: z.number().min(10000).max(100000).optional(),
  comprehensive: z.number().min(10000).max(100000).optional(),
  deathBenefit: z.number().min(50000).max(5000000).optional(),
});

// Risk factors schema
export const riskFactorsSchema = z.object({
  location: z.object({
    state: z.string().length(2, 'State must be 2 characters'),
    zipCode: z.string().min(5, 'ZIP code must be at least 5 characters'),
    crimeRate: z.enum(['low', 'medium', 'high']).optional(),
    naturalDisasterRisk: z.enum(['low', 'medium', 'high']).optional(),
  }),
  demographics: z.object({
    age: z.number().min(16).max(120),
    gender: z.enum(['male', 'female', 'other']).optional(),
    maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
  }),
  personal: z.object({
    creditScore: z.number().min(300).max(850).optional(),
    occupation: z.string().optional(),
    smokingStatus: z.enum(['smoker', 'non-smoker', 'former-smoker']).optional(),
    healthConditions: z.array(z.string()).optional(),
  }).optional(),
});

// Complete policy creation schema
export const createPolicySchema = basePolicySchema.extend({
  coverage: coverageOptionsSchema,
  riskFactors: riskFactorsSchema,
  propertyInfo: propertyInfoSchema.optional(),
  vehicleInfo: vehicleInfoSchema.optional(),
  personalInfo: personalInfoSchema.optional(),
}).refine((data) => {
  // Ensure required info is present based on policy type
  switch (data.type) {
    case PolicyType.HOME:
      return data.propertyInfo !== undefined && data.coverage.dwelling !== undefined;
    case PolicyType.AUTO:
      return data.vehicleInfo !== undefined && data.coverage.collision !== undefined;
    case PolicyType.LIFE:
      return data.personalInfo !== undefined && data.coverage.deathBenefit !== undefined;
    default:
      return true;
  }
}, {
  message: 'Required information missing for policy type',
  path: ['type'],
});

// Policy update schema (partial updates allowed)
export const updatePolicySchema = createPolicySchema.partial().extend({
  id: z.string().min(1, 'Policy ID is required'),
});

// Policy filtering schema
export const policyFilterSchema = z.object({
  type: z.nativeEnum(PolicyType).optional(),
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED']).optional(),
  search: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  minPremium: z.number().min(0).optional(),
  maxPremium: z.number().min(0).optional(),
});

// Quote request schema
export const quoteRequestSchema = z.object({
  type: z.nativeEnum(PolicyType),
  coverage: coverageOptionsSchema,
  riskFactors: riskFactorsSchema,
  deductible: z.number().min(0).max(50000),
  propertyInfo: propertyInfoSchema.optional(),
  vehicleInfo: vehicleInfoSchema.optional(),
  personalInfo: personalInfoSchema.optional(),
}).refine((data) => {
  // Ensure required info is present based on policy type
  switch (data.type) {
    case PolicyType.HOME:
      return data.propertyInfo !== undefined && data.coverage.dwelling !== undefined;
    case PolicyType.AUTO:
      return data.vehicleInfo !== undefined;
    case PolicyType.LIFE:
      return data.personalInfo !== undefined && data.coverage.deathBenefit !== undefined;
    default:
      return true;
  }
}, {
  message: 'Required information missing for policy type',
  path: ['type'],
});

// Types
export type CreatePolicyInput = z.infer<typeof createPolicySchema>;
export type UpdatePolicyInput = z.infer<typeof updatePolicySchema>;
export type PolicyFilters = z.infer<typeof policyFilterSchema>;
export type QuoteRequest = z.infer<typeof quoteRequestSchema>;
export type PropertyInfo = z.infer<typeof propertyInfoSchema>;
export type VehicleInfo = z.infer<typeof vehicleInfoSchema>;
export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type CoverageOptions = z.infer<typeof coverageOptionsSchema>;
export type RiskFactors = z.infer<typeof riskFactorsSchema>;