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
  address: z.string().min(1, 'Property address is required'),
  city: z.string().min(1, 'City is required'),
  province: z.enum([
    'WC',
    'EC', 
    'NC',
    'FS',
    'KZN',
    'NW',
    'GP',
    'MP',
    'LP'
  ], { required_error: 'Province is required' }),
  postalCode: z.string().min(4, 'Postal code must be at least 4 digits').max(4, 'Postal code must be exactly 4 digits'),
  propertyType: z.enum([
    'SINGLE_FAMILY',
    'FARMHOUSE',
    'RURAL_HOMESTEAD',
    'COUNTRY_ESTATE',
    'SMALLHOLDING',
    'GAME_FARM_HOUSE',
    'VINEYARD_HOUSE',
    'MOUNTAIN_CABIN',
    'COASTAL_COTTAGE',
    'TOWNHOUSE',
    'CONDO',
    'APARTMENT'
  ], { required_error: 'Property type is required' }),
  buildYear: z.number().min(1800, 'Build year must be after 1800').max(new Date().getFullYear(), 'Build year cannot be in the future'),
  squareFeet: z.number().min(100, 'Property must be at least 100 sq ft').max(50000, 'Property size cannot exceed 50,000 sq ft'),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  constructionType: z.enum([
    'BRICK',
    'STONE',
    'CONCRETE',
    'STEEL_FRAME',
    'WOOD_FRAME',
    'MIXED_CONSTRUCTION',
    'TRADITIONAL_MUD',
    'THATCH_ROOF'
  ]).optional(),
  roofType: z.enum([
    'TILE',
    'THATCH',
    'METAL',
    'SLATE',
    'SHINGLE',
    'CONCRETE',
    'CORRUGATED_IRON'
  ]).optional(),
  foundationType: z.enum([
    'CONCRETE_SLAB',
    'CONCRETE_FOUNDATION',
    'STONE_FOUNDATION',
    'PIER_AND_BEAM',
    'CRAWL_SPACE',
    'BASEMENT'
  ]).optional(),
  heatingType: z.enum([
    'GAS',
    'ELECTRIC',
    'WOOD_BURNING',
    'SOLAR',
    'HEAT_PUMP',
    'COAL',
    'NONE'
  ]).optional(),
  coolingType: z.enum([
    'AIR_CONDITIONING',
    'CEILING_FANS',
    'EVAPORATIVE_COOLING',
    'NONE'
  ]).optional(),
  safetyFeatures: z.array(z.enum([
    'SMOKE_DETECTORS',
    'SECURITY_ALARM',
    'MONITORED_ALARM',
    'SECURITY_CAMERAS',
    'ELECTRIC_FENCING',
    'SECURITY_GATES',
    'SAFE_ROOM',
    'FIRE_EXTINGUISHERS',
    'SPRINKLER_SYSTEM',
    'NONE'
  ])).optional(),
  hasPool: z.boolean().default(false),
  hasGarage: z.boolean().default(false),
  garageSpaces: z.number().min(0).optional(),
  // Rural-specific features
  hasFarmBuildings: z.boolean().default(false),
  hasLivestock: z.boolean().default(false),
  hasCrops: z.boolean().default(false),
  propertySize: z.number().min(0).optional(), // in hectares
  accessRoad: z.enum(['TARRED', 'GRAVEL', 'DIRT', 'PRIVATE']).optional(),
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

// V2: Coverage amount validation - aligned with PRD_V2.md (R30k-R200k)
export const coverageAmountSchema = z.number()
  .min(30000, "Minimum coverage is R30,000")
  .max(200000, "Maximum coverage is R200,000")
  .refine(amount => amount % 5000 === 0, "Amount must be in R5,000 increments");

// Coverage options schema (legacy support) - Updated for LaLiSure simplified model
export const coverageOptionsSchema = z.object({
  dwelling: z.number().min(25000).max(5000000).optional(),
  personalProperty: z.number().min(5000).max(1000000).optional(),
  liability: z.number().min(25000).max(2000000).optional(), // Reduced from 100000 to support LaLiSure model
  medicalPayments: z.number().min(1000).max(50000).optional(),
  collision: z.number().min(10000).max(100000).optional(),
  comprehensive: z.number().min(10000).max(100000).optional(),
  deathBenefit: z.number().min(50000).max(5000000).optional(),
});

// Per-amount coverage options schema for the new model
export const perAmountCoverageSchema = z.object({
  totalAmount: coverageAmountSchema,
  // Optional breakdown (will be calculated if not provided)
  dwelling: z.number().min(0).optional(),
  personalProperty: z.number().min(0).optional(),
  liability: z.number().min(0).optional(),
  medicalPayments: z.number().min(0).optional(),
});

// Risk factors schema
export const riskFactorsSchema = z.object({
  location: z.object({
    province: z.enum([
      'WC',
      'EC', 
      'NC',
      'FS',
      'KZN',
      'NW',
      'GP',
      'MP',
      'LP'
    ], { required_error: 'Province is required' }),
    postalCode: z.string().length(4, 'Postal code must be exactly 4 digits'),
    crimeRate: z.enum(['low', 'medium', 'high']).optional(),
    naturalDisasterRisk: z.enum(['low', 'medium', 'high']).optional(),
    ruralArea: z.boolean().default(false),
    distanceFromFireStation: z.number().min(0).optional(), // in km
    distanceFromPoliceStation: z.number().min(0).optional(), // in km
  }),
  demographics: z.object({
    age: z.number().min(18, 'Age must be at least 18').max(120, 'Age cannot exceed 120'),
    gender: z.enum(['male', 'female', 'other']).optional(),
    maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
  }),
  personal: z.object({
    creditScore: z.number().min(300, 'Credit score must be at least 300').max(850, 'Credit score cannot exceed 850').optional(),
    occupation: z.string().optional(),
    employmentStatus: z.enum(['employed', 'self_employed', 'unemployed', 'retired', 'student']).optional(),
    monthlyIncome: z.number().min(0).optional(),
    claimsHistory: z.number().min(0, 'Claims history cannot be negative').max(20, 'Claims history cannot exceed 20').default(0),
  }).optional(),
});

// Draft policy schema - for incomplete applications
export const draftPolicySchema = z.object({
  type: z.nativeEnum(PolicyType).default(PolicyType.HOME),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  deductible: z.number().min(0).optional(),
  coverage: coverageOptionsSchema.optional(),
  riskFactors: riskFactorsSchema.optional(),
  propertyInfo: propertyInfoSchema.optional(),
  personalInfo: personalInfoSchema.optional(),
  isDraft: z.boolean().default(true),
  completionPercentage: z.number().min(0).max(100).default(0),
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
  isDraft: z.boolean().default(false),
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

// Extended base policy schema for new frontend structure
const extendedBasePolicySchema = z.object({
  policyType: z.nativeEnum(PolicyType),
  coverageAmount: z.number().min(1000).max(10000000).optional(),
  deductible: z.number().min(0).max(50000),
  termLength: z.number().min(1).max(120).optional(),
  age: z.number().min(16).max(120).optional(),
  location: z.string().optional(),
  creditScore: z.number().min(300).max(850).optional(),
  previousClaims: z.number().min(0).max(20).optional(),
  postalCode: z.string().optional(),
});

// Per-amount quote request schema for new model
export const perAmountQuoteRequestSchema = z.object({
  policyType: z.nativeEnum(PolicyType),
  coverageAmount: coverageAmountSchema,
  deductible: z.number().min(0).max(50000),
  propertyInfo: propertyInfoSchema,
  riskFactors: riskFactorsSchema,
  personalInfo: personalInfoSchema.optional(),
});

// Quote request schema - supports both old and new frontend structures
export const quoteRequestSchema = z.union([
  // New per-amount frontend structure
  perAmountQuoteRequestSchema,
  // New frontend structure (legacy)
  extendedBasePolicySchema.extend({
    propertyInfo: propertyInfoSchema.optional(),
  }),
  // Old frontend structure (legacy)
  basePolicySchema.extend({
    propertyInfo: propertyInfoSchema.optional(),
    personalInfo: personalInfoSchema.optional(),
  })
]).refine((data) => {
  // Ensure required info is present for HOME policies
  if ('policyType' in data && data.policyType === PolicyType.HOME && !('propertyInfo' in data && data.propertyInfo)) {
    return false;
  }
  return true;
}, {
  message: 'Property information is required for home insurance quotes',
  path: ['propertyInfo'],
});

// Types
export type CreatePolicyInput = z.infer<typeof createPolicySchema>;
export type DraftPolicyInput = z.infer<typeof draftPolicySchema>;
export type UpdatePolicyInput = z.infer<typeof updatePolicySchema>;
export type PropertyInfo = z.infer<typeof propertyInfoSchema>;
export type RiskFactors = z.infer<typeof riskFactorsSchema>;
export type CoverageOptions = z.infer<typeof coverageOptionsSchema>;
export type PerAmountCoverage = z.infer<typeof perAmountCoverageSchema>;
export type PerAmountQuoteRequest = z.infer<typeof perAmountQuoteRequestSchema>;
export type PolicyFilters = z.infer<typeof policyFilterSchema>;
export type QuoteRequest = z.infer<typeof quoteRequestSchema>;
export type VehicleInfo = z.infer<typeof vehicleInfoSchema>;
export type PersonalInfo = z.infer<typeof personalInfoSchema>;

// V2: Simplified amount-based quote schema for LaLiSure model (R30k-R200k)
export const simpleQuoteRequestSchema = z.object({
  coverageAmount: z.number()
    .min(30000, 'Minimum coverage is R30,000')
    .max(200000, 'Maximum coverage is R200,000')
    .refine(amount => amount % 5000 === 0, 'Amount must be in R5,000 increments'),
});

export type SimpleQuoteRequest = z.infer<typeof simpleQuoteRequestSchema>;