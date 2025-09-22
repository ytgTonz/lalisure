'use client';

import { useUser } from '@clerk/nextjs';
import { api } from '@/trpc/react';

/**
 * Custom hook that provides complete user profile data by prioritizing
 * database profile data over Clerk user data for better consistency
 * when users update their profiles through the application.
 */
export const useCompleteProfile = () => {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { data: dbProfile, isLoading: dbLoading, error: dbError } = api.user.getProfile.useQuery(
    undefined,
    {
      enabled: !!clerkUser, // Only fetch when Clerk user is available
    }
  );

  // Determine loading state
  const isLoading = !clerkLoaded || (clerkUser && dbLoading);

  // Create complete profile object that prioritizes database data
  const completeProfile = clerkUser ? {
    // Clerk user data as base
    ...clerkUser,

    // Override with database profile data when available
    firstName: dbProfile?.firstName || clerkUser.firstName || '',
    lastName: dbProfile?.lastName || clerkUser.lastName || '',
    phone: dbProfile?.phone || '',

    // Additional database-only fields
    dateOfBirth: dbProfile?.dateOfBirth || null,
    idNumber: dbProfile?.idNumber || '',
    idType: dbProfile?.idType || null,
    country: dbProfile?.country || '',
    workPhone: dbProfile?.workPhone || '',
    streetAddress: dbProfile?.streetAddress || '',
    city: dbProfile?.city || '',
    province: dbProfile?.province || '',
    postalCode: dbProfile?.postalCode || '',
    employmentStatus: dbProfile?.employmentStatus || null,
    employer: dbProfile?.employer || '',
    jobTitle: dbProfile?.jobTitle || '',
    workAddress: dbProfile?.workAddress || '',
    monthlyIncome: dbProfile?.monthlyIncome || null,
    incomeSource: dbProfile?.incomeSource || '',

    // Verification status from database
    emailVerified: dbProfile?.emailVerified || false,
    phoneVerified: dbProfile?.phoneVerified || false,
    idVerified: dbProfile?.idVerified || false,

    // Role and status from database
    role: dbProfile?.role || 'CUSTOMER',
    status: dbProfile?.status || 'ACTIVE',
  } : null;

  // Helper to get display name
  const getDisplayName = () => {
    if (!completeProfile) return 'User';

    const firstName = completeProfile.firstName;
    const lastName = completeProfile.lastName;

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    } else {
      // Fallback to email username if no names available
      const email = completeProfile.emailAddresses?.[0]?.emailAddress;
      if (email) {
        return email.split('@')[0];
      }
      return 'User';
    }
  };

  // Helper to get first name for greetings
  const getFirstName = () => {
    if (!completeProfile) return 'User';

    if (completeProfile.firstName) {
      return completeProfile.firstName;
    } else {
      // Fallback to email username
      const email = completeProfile.emailAddresses?.[0]?.emailAddress;
      if (email) {
        return email.split('@')[0];
      }
      return 'User';
    }
  };

  return {
    // Complete profile with prioritized data
    user: completeProfile,

    // Database profile for detailed information
    dbProfile,

    // Original Clerk user for authentication-specific data
    clerkUser,

    // Loading and error states
    isLoading,
    isLoaded: clerkLoaded && !dbLoading,
    error: dbError,

    // Helper functions
    getDisplayName,
    getFirstName,

    // Profile completeness helpers
    hasBasicInfo: !!(completeProfile?.firstName && completeProfile?.lastName),
    hasContactInfo: !!(completeProfile?.phone),
    hasAddressInfo: !!(completeProfile?.streetAddress && completeProfile?.city),
    hasEmploymentInfo: !!(completeProfile?.employmentStatus),

    // Verification status helpers
    isEmailVerified: completeProfile?.emailVerified || false,
    isPhoneVerified: completeProfile?.phoneVerified || false,
    isIdVerified: completeProfile?.idVerified || false,
  };
};

export default useCompleteProfile;