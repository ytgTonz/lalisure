import { z } from 'zod';

export const agentSettingsSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number must be less than 15 digits'),
  
  // Professional Information
  agentCode: z.string().min(3, 'Agent code must be at least 3 characters').max(20, 'Agent code must be less than 20 characters'),
  licenseNumber: z.string().min(1, 'License number is required').max(50, 'License number must be less than 50 characters'),
  commissionRate: z.number().min(0, 'Commission rate cannot be negative').max(100, 'Commission rate cannot exceed 100%'),
  
  // Contact Information
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    province: z.string().min(1, 'Province is required'),
    postalCode: z.string().min(4, 'Postal code must be at least 4 characters').max(10, 'Postal code must be less than 10 characters'),
    country: z.string().default('South Africa'),
  }),
  
  // Preferences
  preferences: z.object({
    emailNotifications: z.boolean().default(true),
    smsNotifications: z.boolean().default(true),
    weeklyReports: z.boolean().default(true),
    autoFollowUp: z.boolean().default(false),
    timezone: z.string().default('Africa/Johannesburg'),
    language: z.string().default('en'),
  }),
  
  // Working Hours
  workingHours: z.object({
    monday: z.object({
      enabled: z.boolean().default(true),
      start: z.string().default('08:00'),
      end: z.string().default('17:00'),
    }),
    tuesday: z.object({
      enabled: z.boolean().default(true),
      start: z.string().default('08:00'),
      end: z.string().default('17:00'),
    }),
    wednesday: z.object({
      enabled: z.boolean().default(true),
      start: z.string().default('08:00'),
      end: z.string().default('17:00'),
    }),
    thursday: z.object({
      enabled: z.boolean().default(true),
      start: z.string().default('08:00'),
      end: z.string().default('17:00'),
    }),
    friday: z.object({
      enabled: z.boolean().default(true),
      start: z.string().default('08:00'),
      end: z.string().default('17:00'),
    }),
    saturday: z.object({
      enabled: z.boolean().default(false),
      start: z.string().default('09:00'),
      end: z.string().default('13:00'),
    }),
    sunday: z.object({
      enabled: z.boolean().default(false),
      start: z.string().default('09:00'),
      end: z.string().default('13:00'),
    }),
  }),
});

export type AgentSettings = z.infer<typeof agentSettingsSchema>;

export const agentProfileUpdateSchema = agentSettingsSchema.partial();

export type AgentProfileUpdate = z.infer<typeof agentProfileUpdateSchema>;
