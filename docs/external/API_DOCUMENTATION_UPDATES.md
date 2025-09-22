# API Documentation Updates

## 📋 Overview

This document outlines the comprehensive updates made to the API documentation to reflect all current backend implementations and new features.

## ✅ Updated Sections

### 1. **Agent Settings Management** (NEW)

- ✅ Added complete agent settings API documentation
- ✅ Documented `agentSettings.getSettings` endpoint
- ✅ Documented `agentSettings.updateSettings` endpoint
- ✅ Documented `agentSettings.checkAgentCode` endpoint
- ✅ Documented `agentSettings.getAllAgents` endpoint
- ✅ Included comprehensive type definitions for agent settings

### 2. **Enhanced Policy Management**

- ✅ Added `policy.getDrafts` endpoint documentation
- ✅ Added `policy.saveDraft` endpoint documentation
- ✅ Added `policy.convertDraftToPolicy` endpoint documentation
- ✅ Updated `policy.createPolicy` with rural property examples
- ✅ Enhanced `policy.calculateQuote` with new response structure
- ✅ Added `policy.checkQuoteExpiration` endpoint documentation

### 3. **Rural Property Support Documentation**

- ✅ Added 12 property types (4 urban + 8 rural)
- ✅ Added 8 construction types for rural properties
- ✅ Added 10 safety features with descriptions
- ✅ Documented rural-specific fields and validation

### 4. **Enhanced Premium Calculation Documentation**

- ✅ Added comprehensive premium calculation factors
- ✅ Documented rural property adjustments
- ✅ Added safety feature discount calculations
- ✅ Included construction type factors
- ✅ Added access road factors

### 5. **South African Data Constants** (NEW)

- ✅ Added complete province data with risk assessments
- ✅ Documented rural property types with descriptions
- ✅ Added construction types for rural areas
- ✅ Included safety features with descriptions

### 6. **Quote Expiration System**

- ✅ Documented quote expiration checking
- ✅ Added 30-day quote validity
- ✅ Included expiration response types

## 🔧 Technical Documentation Updates

### **New API Endpoints Added**

#### Agent Settings

```typescript
// Get agent settings
api.agentSettings.getSettings.useQuery();

// Update agent settings
api.agentSettings.updateSettings.useMutation();

// Check agent code availability
api.agentSettings.checkAgentCode.useQuery();

// Get all agents (admin only)
api.agentSettings.getAllAgents.useQuery();
```

#### Draft Policy Management

```typescript
// Get draft policies
api.policy.getDrafts.useQuery();

// Save draft policy
api.policy.saveDraft.useMutation();

// Convert draft to policy
api.policy.convertDraftToPolicy.useMutation();
```

#### Quote Management

```typescript
// Check quote expiration
api.policy.checkQuoteExpiration.useQuery();
```

### **Enhanced Type Definitions**

#### Agent Settings Types

```typescript
type AgentSettings = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  agentCode: string;
  licenseNumber: string;
  commissionRate: number;
  address: Address;
  preferences: AgentPreferences;
  workingHours: WorkingHours;
};
```

#### Draft Policy Types

```typescript
type DraftPolicyInput = {
  type?: PolicyType;
  startDate?: Date;
  endDate?: Date;
  deductible?: number;
  coverage?: CoverageOptions;
  riskFactors?: RiskFactors;
  propertyInfo?: PropertyInfo;
  personalInfo?: PersonalInfo;
  isDraft: boolean;
  completionPercentage: number;
};
```

#### Enhanced Property Info Types

```typescript
type PropertyInfo = {
  // ... existing fields
  // Rural-specific features
  hasFarmBuildings: boolean;
  hasLivestock: boolean;
  hasCrops: boolean;
  propertySize: number; // in hectares
  accessRoad: "TARRED" | "GRAVEL" | "DIRT" | "PRIVATE";
};
```

### **Enhanced Risk Factors**

```typescript
type RiskFactors = {
  location: {
    province: "WC" | "EC" | "NC" | "FS" | "KZN" | "NW" | "GP" | "MP" | "LP";
    postalCode: string;
    ruralArea: boolean;
    distanceFromFireStation?: number;
    distanceFromPoliceStation?: number;
  };
  demographics: {
    age: number;
    gender?: "male" | "female" | "other";
    maritalStatus?: "single" | "married" | "divorced" | "widowed";
  };
  personal: {
    employmentStatus?:
      | "employed"
      | "self_employed"
      | "unemployed"
      | "retired"
      | "student";
    monthlyIncome?: number;
    claimsHistory: number;
  };
};
```

## 🎯 Key Features Documented

### **1. Rural Property Support**

- **12 Property Types**: 4 urban + 8 rural property types
- **8 Construction Types**: Traditional + rural construction methods
- **10 Safety Features**: Basic + advanced security options
- **Rural-Specific Fields**: Farm buildings, livestock, crops, property size, access roads

### **2. Enhanced Premium Calculation**

- **Base Rate**: 0.8% per R1,000 coverage
- **Location Factors**: Province-based + rural adjustments
- **Property Factors**: Construction type + rural features
- **Personal Factors**: Employment + income + claims history
- **Safety Discounts**: Up to 15% discount for security features
- **Emergency Services**: Distance-based adjustments

### **3. Draft Policy System**

- **Save Progress**: Save incomplete applications at any step
- **Completion Tracking**: Percentage-based completion tracking
- **Resume Applications**: Continue incomplete policies later
- **Convert to Policy**: Transform drafts into full policies

### **4. Quote Expiration**

- **30-Day Validity**: Quotes expire after 30 days
- **Expiration Checking**: Real-time quote validity checking
- **Days Remaining**: Track remaining validity period

### **5. Agent Settings Management**

- **Profile Management**: Personal and professional information
- **Preferences**: Notification and communication preferences
- **Working Hours**: Configurable schedule management
- **Commission Tracking**: Commission rate management

## 📊 Data Constants Documentation

### **South African Provinces**

```typescript
export const SOUTH_AFRICAN_PROVINCES = [
  {
    code: "WC",
    name: "Western Cape",
    crimeRate: "medium",
    ruralPercentage: 35,
  },
  { code: "EC", name: "Eastern Cape", crimeRate: "high", ruralPercentage: 65 },
  // ... 7 more provinces
];
```

### **Rural Property Types**

```typescript
export const RURAL_PROPERTY_TYPES = [
  {
    value: "FARMHOUSE",
    label: "Farmhouse",
    description: "Traditional farm dwelling",
  },
  {
    value: "RURAL_HOMESTEAD",
    label: "Rural Homestead",
    description: "Family home in rural area",
  },
  // ... 6 more types
];
```

### **Construction Types**

```typescript
export const RURAL_CONSTRUCTION_TYPES = [
  {
    value: "BRICK",
    label: "Brick",
    description: "Traditional brick construction",
  },
  {
    value: "STEEL_FRAME",
    label: "Steel Frame",
    description: "Steel frame construction",
  },
  // ... 6 more types
];
```

### **Safety Features**

```typescript
export const RURAL_SAFETY_FEATURES = [
  {
    value: "SMOKE_DETECTORS",
    label: "Smoke Detectors",
    description: "Smoke detection system",
  },
  {
    value: "ELECTRIC_FENCING",
    label: "Electric Fencing",
    description: "Electric perimeter fencing",
  },
  // ... 8 more features
];
```

## 🔄 Updated Table of Contents

The API documentation now includes:

- [Authentication](#authentication)
- [User Management](#user-management)
- [Agent Settings Management](#agent-settings-management) _(NEW)_
- [Policy Management](#policy-management) _(ENHANCED)_
- [Claims Processing](#claims-processing)
- [Payment Processing](#payment-processing)
- [Notifications](#notifications)
- [Email Analytics](#email-analytics)
- [Security Monitoring](#security-monitoring)
- [System Settings](#system-settings)
- [South African Data Constants](#south-african-data-constants) _(NEW)_
- [Error Handling](#error-handling)

## 📝 Usage Examples

### **Creating a Rural Policy**

```typescript
const policyData = {
  type: "HOME",
  propertyInfo: {
    propertyType: "FARMHOUSE",
    constructionType: "BRICK",
    roofType: "THATCH",
    hasFarmBuildings: true,
    hasLivestock: true,
    accessRoad: "GRAVEL",
    safetyFeatures: ["ELECTRIC_FENCING", "SECURITY_CAMERAS"],
  },
  riskFactors: {
    location: {
      province: "WC",
      ruralArea: true,
      distanceFromFireStation: 25,
    },
  },
};
```

### **Saving a Draft**

```typescript
const draftData = {
  ...partialPolicyData,
  isDraft: true,
  completionPercentage: 65,
};

await api.policy.saveDraft.mutate(draftData);
```

### **Agent Settings Update**

```typescript
const settingsData = {
  firstName: "John",
  lastName: "Smith",
  agentCode: "AGT001",
  preferences: {
    emailNotifications: true,
    smsNotifications: true,
    weeklyReports: true,
  },
  workingHours: {
    monday: { enabled: true, start: "08:00", end: "17:00" },
    // ... other days
  },
};

await api.agentSettings.updateSettings.mutate(settingsData);
```

## 🎉 Summary

The API documentation has been comprehensively updated to include:

- **4 new API endpoints** for agent settings management
- **3 new API endpoints** for draft policy management
- **1 new API endpoint** for quote expiration checking
- **Enhanced type definitions** for all new features
- **Comprehensive examples** for rural property creation
- **Detailed premium calculation** documentation
- **South African data constants** with descriptions
- **Updated table of contents** with new sections

The documentation now provides complete coverage of all backend implementations, making it easy for developers to understand and integrate with the enhanced Lalisure home insurance platform.

## 📚 Additional Resources

- **Type Definitions**: All types are auto-generated from tRPC
- **Data Constants**: Available in `/src/lib/data/south-africa.ts`
- **Validation Schemas**: Available in `/src/lib/validations/policy.ts` and `/src/lib/validations/agent.ts`
- **API Testing**: Use the tRPC panel in development
- **Error Reference**: Check `/src/server/api/trpc.ts` for error handling
