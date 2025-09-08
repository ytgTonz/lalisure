import { z } from 'zod';
import { PolicyType } from '@prisma/client';

// Base policy validation schema
const basePolicySchema = z.object({
  policyType: z.nativeEnum(PolicyType),
  coverageAmount: z.number().min(1000).max(10000000),
  deductible: z.number().min(0).max(50000),
  termLength: z.number().min(1).max(120),
  age: z.number().min(16).max(120),
  location: z.string().min(1),
  creditScore: z.number().min(300).max(850),
  previousClaims: z.number().min(0).max(20),
});

// Property information schema - matching Prisma PropertyInfo
export const propertyInfoSchema = z.object({
  address: z.string().min(1),
  city: z.string().min(1),
  province: z.string().min(1),
  postalCode: z.string().min(4).max(4),
  propertyType: z.string(),
  buildYear: z.number().min(1800).max(new Date().getFullYear()),
  squareFeet: z.number().min(100).max(50000),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  constructionType: z.string().optional(),
  roofType: z.string().optional(),
  foundationType: z.string().optional(),
  heatingType: z.string().optional(),
  coolingType: z.string().optional(),
  safetyFeatures: z.array(z.string()).optional(),
  hasPool: z.boolean().default(false),
  hasGarage: z.boolean().default(false),
  garageSpaces: z.number().min(0).optional(),
});

// Vehicle information schema
export const vehicleInfoSchema = z.object({
  make: z.string().min(1, 'Vehicle make is required'),
  model: z.string().min(1, 'Vehicle model is required'),
  year: z.number().min(1980).max(new Date().getFullYear() + 1),
  vin: z.string().min(17, 'VIN must be 17 characters').max(17, 'VIN must be 17 characters'),
  mileage: z.number().min(0).max(500000),
  safetyFeatures: z.enum(['BASIC', 'ADVANCED', 'PREMIUM']),
});

// Personal information schema
export const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
  height: z.number().min(50).max(300),
  weight: z.number().min(20).max(300),
  smokingStatus: z.enum(['NEVER', 'FORMER', 'CURRENT']),
  medicalHistory: z.string().optional(),
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
    province: z.string().min(1, 'Province is required'),
    postalCode: z.string().length(4, 'Postal code must be 4 digits'),
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
export const createPolicySchema = z.object({
  type: z.nativeEnum(PolicyType),
  startDate: z.date(),
  endDate: z.date(),
  deductible: z.number().min(0),
  coverage: coverageOptionsSchema,
  riskFactors: riskFactorsSchema,
  propertyInfo: propertyInfoSchema, // Required for HOME policies
  personalInfo: personalInfoSchema.optional(), // Optional additional info
});

// Policy update schema (partial updates allowed)
export const updatePolicySchema = z.object({
  id: z.string().min(1, 'Policy ID is required'),
  policyType: z.nativeEnum(PolicyType).optional(),
  coverageAmount: z.number().min(1000).max(10000000).optional(),
  deductible: z.number().min(0).max(50000).optional(),
  propertyInfo: propertyInfoSchema.partial().optional(),
  personalInfo: personalInfoSchema.partial().optional(),
});

// Policy filtering schema
export const policyFilterSchema = z.object({
  policyType: z.nativeEnum(PolicyType).optional(),
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED']).optional(),
  search: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  minPremium: z.number().min(0).optional(),
  maxPremium: z.number().min(0).optional(),
});

// Quote request schema
export const quoteRequestSchema = basePolicySchema.extend({
  propertyInfo: propertyInfoSchema.optional(),
  personalInfo: personalInfoSchema.optional(),
}).refine((data) => {
  // Ensure required info is present for HOME policies
  if (data.policyType === PolicyType.HOME) {
    return data.propertyInfo !== undefined;
  }
  return true;
}, {
  message: 'Property information is required for home insurance quotes',
  path: ['propertyInfo'],
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