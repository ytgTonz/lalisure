# Mobile API Documentation Updates

## 📋 Overview

This document outlines the comprehensive updates made to the Lalisure Mobile API Documentation to reflect all current backend implementations and provide detailed examples for mobile developers.

## ✅ Major Updates Completed

### 1. **Enhanced Policy Management Section**

- ✅ Updated all policy endpoints with new rural property support
- ✅ Added comprehensive examples for policy creation with rural properties
- ✅ Documented draft policy system (save, retrieve, convert)
- ✅ Added quote expiration functionality
- ✅ Enhanced premium calculation examples

### 2. **New Agent Settings Management Section**

- ✅ Complete agent settings API documentation
- ✅ 4 new endpoints: `getSettings`, `updateSettings`, `checkAgentCode`, `getAllAgents`
- ✅ Comprehensive examples with working hours and preferences
- ✅ Role-based access control documentation

### 3. **Comprehensive API Examples Section**

- ✅ Detailed examples for every endpoint with actual HTTP requests
- ✅ Complete request/response examples with real data
- ✅ Error handling examples with proper error responses
- ✅ Batch request examples for multiple queries

### 4. **South African Data Constants Section**

- ✅ Complete province data with risk assessments
- ✅ 12 property types (4 urban + 8 rural)
- ✅ 8 construction types for rural properties
- ✅ 10 safety features with descriptions
- ✅ Access road types for rural properties

### 5. **Premium Calculation Examples**

- ✅ Real-world rural property premium calculation example
- ✅ Detailed breakdown of all risk factors
- ✅ Safety feature discount calculations
- ✅ Rural property adjustments

## 🔧 Technical Documentation Updates

### **New API Endpoints Documented**

#### Agent Settings (4 endpoints)

```javascript
// Get agent settings
GET / api / trpc / agentSettings.getSettings;

// Update agent settings
POST / api / trpc / agentSettings.updateSettings;

// Check agent code availability
GET / api / trpc / agentSettings.checkAgentCode;

// Get all agents (admin only)
GET / api / trpc / agentSettings.getAllAgents;
```

#### Draft Policy Management (3 endpoints)

```javascript
// Save draft policy
POST / api / trpc / policy.saveDraft;

// Get draft policies
GET / api / trpc / policy.getDrafts;

// Convert draft to policy
POST / api / trpc / policy.convertDraftToPolicy;
```

#### Quote Management (1 endpoint)

```javascript
// Check quote expiration
GET / api / trpc / policy.checkQuoteExpiration;
```

### **Enhanced Request/Response Examples**

#### Complete Policy Creation Example

```javascript
const policyData = {
  type: "HOME",
  coverage: {
    dwelling: 500000,
    personalProperty: 100000,
    liability: 300000,
    additionalLivingExpenses: 50000,
  },
  deductible: 2500,
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  riskFactors: {
    location: {
      province: "WC",
      postalCode: "8001",
      ruralArea: false,
      distanceFromFireStation: 5,
      distanceFromPoliceStation: 3,
    },
    demographics: {
      age: 35,
      gender: "male",
      maritalStatus: "married",
    },
    personal: {
      employmentStatus: "employed",
      monthlyIncome: 25000,
      claimsHistory: 0,
    },
  },
  propertyInfo: {
    address: "123 Main Street",
    city: "Cape Town",
    province: "WC",
    postalCode: "8001",
    propertyType: "SINGLE_FAMILY",
    buildYear: 2015,
    squareFeet: 2400,
    bedrooms: 3,
    bathrooms: 2.5,
    constructionType: "BRICK",
    roofType: "TILE",
    foundationType: "CONCRETE_SLAB",
    heatingType: "GAS",
    coolingType: "AIR_CONDITIONING",
    safetyFeatures: ["SMOKE_DETECTORS", "SECURITY_ALARM"],
    hasPool: false,
    hasGarage: true,
    garageSpaces: 2,
    hasFarmBuildings: false,
    hasLivestock: false,
    hasCrops: false,
    propertySize: 0.5,
    accessRoad: "TARRED",
  },
  personalInfo: {
    firstName: "John",
    lastName: "Doe",
    dateOfBirth: "1989-01-15",
    phone: "+27123456789",
    email: "john@example.com",
  },
};
```

#### Agent Settings Update Example

```javascript
const settingsData = {
  firstName: "John",
  lastName: "Smith",
  agentCode: "AGT001",
  commissionRate: 15.5,
  preferences: {
    emailNotifications: true,
    smsNotifications: true,
    weeklyReports: true,
    autoFollowUp: false,
    timezone: "Africa/Johannesburg",
    language: "en",
  },
  workingHours: {
    monday: { enabled: true, start: "08:00", end: "17:00" },
    tuesday: { enabled: true, start: "08:00", end: "17:00" },
    wednesday: { enabled: true, start: "08:00", end: "17:00" },
    thursday: { enabled: true, start: "08:00", end: "17:00" },
    friday: { enabled: true, start: "08:00", end: "17:00" },
    saturday: { enabled: false, start: "09:00", end: "13:00" },
    sunday: { enabled: false, start: "09:00", end: "13:00" },
  },
};
```

### **HTTP Request Examples**

#### GET Request Example

```javascript
const response = await fetch(
  'https://your-domain.com/api/trpc/user.getProfile?batch=1&input={"0":{"json":null}}',
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${clerkJWT}`,
      "Content-Type": "application/json",
    },
  }
);
```

#### POST Request Example

```javascript
const response = await fetch("https://your-domain.com/api/trpc/policy.create", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${userJWT}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify([
    {
      json: policyData,
    },
  ]),
});
```

### **Error Handling Examples**

#### Standard Error Response

```javascript
{
  "error": {
    "json": {
      "message": "Invalid input data",
      "code": -32001,
      "data": {
        "code": "VALIDATION_ERROR",
        "httpStatus": 422,
        "stack": "...",
        "path": "policy.create",
        "zodError": {
          "issues": [
            {
              "code": "invalid_type",
              "expected": "string",
              "received": "undefined",
              "path": ["propertyInfo", "address"],
              "message": "Property address is required"
            }
          ]
        }
      }
    }
  }
}
```

#### Error Handling in Mobile App

```javascript
const handleApiCall = async (url, options) => {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (data.error) {
      const error = data.error.json;
      console.error("API Error:", error.message);

      switch (error.data.code) {
        case "UNAUTHORIZED":
          // Redirect to login
          break;
        case "FORBIDDEN":
          // Show access denied message
          break;
        case "VALIDATION_ERROR":
          // Show validation errors
          break;
        default:
          // Show generic error
          break;
      }
    } else {
      return data.result.data;
    }
  } catch (error) {
    console.error("Network Error:", error);
  }
};
```

## 🇿🇦 South African Data Constants

### **Provinces with Risk Data**

```javascript
const PROVINCES = [
  {
    code: "WC",
    name: "Western Cape",
    crimeRate: "medium",
    ruralPercentage: 35,
  },
  { code: "EC", name: "Eastern Cape", crimeRate: "high", ruralPercentage: 65 },
  { code: "NC", name: "Northern Cape", crimeRate: "low", ruralPercentage: 80 },
  { code: "FS", name: "Free State", crimeRate: "medium", ruralPercentage: 60 },
  {
    code: "KZN",
    name: "KwaZulu-Natal",
    crimeRate: "high",
    ruralPercentage: 45,
  },
  { code: "NW", name: "North West", crimeRate: "medium", ruralPercentage: 70 },
  { code: "GP", name: "Gauteng", crimeRate: "high", ruralPercentage: 15 },
  { code: "MP", name: "Mpumalanga", crimeRate: "medium", ruralPercentage: 55 },
  { code: "LP", name: "Limpopo", crimeRate: "medium", ruralPercentage: 75 },
];
```

### **Property Types (12 total)**

```javascript
const PROPERTY_TYPES = {
  // Urban Properties (4)
  SINGLE_FAMILY: "Single Family Home",
  TOWNHOUSE: "Townhouse",
  CONDO: "Condominium",
  APARTMENT: "Apartment",

  // Rural Properties (8)
  FARMHOUSE: "Farmhouse",
  RURAL_HOMESTEAD: "Rural Homestead",
  COUNTRY_ESTATE: "Country Estate",
  SMALLHOLDING: "Smallholding",
  GAME_FARM_HOUSE: "Game Farm House",
  VINEYARD_HOUSE: "Vineyard House",
  MOUNTAIN_CABIN: "Mountain Cabin",
  COASTAL_COTTAGE: "Coastal Cottage",
};
```

### **Construction Types (8 total)**

```javascript
const CONSTRUCTION_TYPES = {
  // Traditional (4)
  BRICK: "Brick",
  STONE: "Stone",
  CONCRETE: "Concrete",
  WOOD_FRAME: "Wood Frame",

  // Rural (4)
  STEEL_FRAME: "Steel Frame",
  TRADITIONAL_MUD: "Traditional Mud",
  THATCH_ROOF: "Thatch Roof",
  MIXED_CONSTRUCTION: "Mixed Construction",
};
```

### **Safety Features (10 total)**

```javascript
const SAFETY_FEATURES = {
  // Basic (3)
  SMOKE_DETECTORS: "Smoke Detectors",
  SECURITY_ALARM: "Security Alarm",
  FIRE_EXTINGUISHERS: "Fire Extinguishers",

  // Advanced (7)
  MONITORED_ALARM: "Monitored Alarm",
  SECURITY_CAMERAS: "Security Cameras",
  ELECTRIC_FENCING: "Electric Fencing",
  SECURITY_GATES: "Security Gates",
  SAFE_ROOM: "Safe Room",
  SPRINKLER_SYSTEM: "Sprinkler System",
  NONE: "None",
};
```

## 📊 Premium Calculation Examples

### **Rural Property Premium Calculation**

```javascript
// Example: Farmhouse in Western Cape
const ruralPolicyData = {
  type: "HOME",
  coverage: {
    dwelling: 800000,
    personalProperty: 150000,
    liability: 500000,
    additionalLivingExpenses: 80000,
  },
  deductible: 5000,
  riskFactors: {
    location: {
      province: "WC",
      postalCode: "8001",
      ruralArea: true,
      distanceFromFireStation: 25,
      distanceFromPoliceStation: 20,
    },
    demographics: {
      age: 45,
      gender: "male",
      maritalStatus: "married",
    },
    personal: {
      employmentStatus: "self_employed",
      monthlyIncome: 35000,
      claimsHistory: 1,
    },
  },
  propertyInfo: {
    address: "Farm Road 123",
    city: "Stellenbosch",
    province: "WC",
    postalCode: "7600",
    propertyType: "FARMHOUSE",
    buildYear: 2010,
    squareFeet: 3500,
    bedrooms: 4,
    bathrooms: 3,
    constructionType: "BRICK",
    roofType: "THATCH",
    foundationType: "CONCRETE_SLAB",
    heatingType: "WOOD_BURNING",
    coolingType: "CEILING_FANS",
    safetyFeatures: ["ELECTRIC_FENCING", "SECURITY_CAMERAS", "MONITORED_ALARM"],
    hasPool: false,
    hasGarage: true,
    garageSpaces: 3,
    hasFarmBuildings: true,
    hasLivestock: true,
    hasCrops: false,
    propertySize: 5.5,
    accessRoad: "GRAVEL",
  },
};

// Expected premium calculation factors:
// - Base rate: 0.8% of coverage
// - Rural area: +10%
// - Distance from fire station >15km: +10%
// - Distance from police station >10km: +5%
// - Farm buildings: +10%
// - Livestock: +5%
// - Thatch roof: +20%
// - Electric fencing: -4%
// - Security cameras: -3%
// - Monitored alarm: -5%
// - Gravel road: Base rate
// - Property size >5 hectares: +10%
```

## 🔄 Batch Request Examples

### **Multiple Queries in One Request**

```javascript
// Method: GET
// URL: /api/trpc/user.getProfile,policy.getUserPolicies,notification.getUnreadCount?batch=1&input={"0":{"json":null},"1":{"json":{"limit":5}},"2":{"json":null}}

const response = await fetch(
  'https://your-domain.com/api/trpc/user.getProfile,policy.getUserPolicies,notification.getUnreadCount?batch=1&input={"0":{"json":null},"1":{"json":{"limit":5}},"2":{"json":null}}',
  {
    method: "GET",
    headers: {
      Authorization: `Bearer ${userJWT}`,
      "Content-Type": "application/json",
    },
  }
);

const data = await response.json();
// Response: { "result": { "data": [profileData, policiesData, unreadCount] } }
```

## 📱 Mobile Integration Examples

### **React Native with tRPC**

```javascript
import { createTRPCReact } from '@trpc/react-query';
import { AppRouter } from './path-to-server/api/root';

export const trpc = createTRPCReact<AppRouter>();

// Query example
const { data: profile } = trpc.user.getProfile.useQuery();

// Mutation example
const createPolicy = trpc.policy.create.useMutation();
```

### **HTTP Client Example (Fetch)**

```javascript
// GET Query
const response = await fetch(
  'https://your-domain.com/api/trpc/user.getProfile?batch=1&input={"0":{"json":null}}',
  {
    headers: {
      Authorization: `Bearer ${clerkJWT}`,
      "Content-Type": "application/json",
    },
  }
);

// POST Mutation
const response = await fetch(
  "https://your-domain.com/api/trpc/user.updateProfile",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${clerkJWT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      {
        json: {
          firstName: "John",
          lastName: "Doe",
        },
      },
    ]),
  }
);
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

## 🔄 Updated Table of Contents

The mobile API documentation now includes:

- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Authentication & User Management](#authentication--user-management)
- [Agent Settings Management](#agent-settings-management) _(NEW)_
- [Policy Management](#policy-management) _(ENHANCED)_
- [Claims Management](#claims-management)
- [Payment Processing](#payment-processing)
- [Notifications](#notifications)
- [tRPC Request Format](#trpc-request-format)
- [Error Handling](#error-handling)
- [Role-Based Access Control](#role-based-access-control)
- [File Uploads](#file-uploads)
- [Webhook Endpoints](#webhook-endpoints)
- [Development Environment](#development-environment)
- [Mobile Integration Examples](#mobile-integration-examples)
- [Comprehensive API Examples](#comprehensive-api-examples) _(NEW)_
- [South African Data Constants](#south-african-data-constants) _(NEW)_
- [Premium Calculation Examples](#premium-calculation-examples) _(NEW)_
- [API Testing Status](#api-testing-status)
- [Support & Contact](#support--contact)

## 🎉 Summary

The Mobile API Documentation has been comprehensively updated to include:

- **8 new API endpoints** for agent settings and draft policy management
- **Comprehensive examples** for every endpoint with actual HTTP requests
- **Complete request/response examples** with real data structures
- **Error handling examples** with proper error responses
- **South African data constants** with descriptions
- **Premium calculation examples** for rural properties
- **Batch request examples** for multiple queries
- **Mobile integration examples** for React Native and HTTP clients

The documentation now provides complete coverage of all backend implementations, making it easy for mobile developers to understand and integrate with the enhanced Lalisure home insurance platform.

## 📚 Additional Resources

- **Type Definitions**: All types are auto-generated from tRPC
- **Data Constants**: Available in `/src/lib/data/south-africa.ts`
- **Validation Schemas**: Available in `/src/lib/validations/policy.ts` and `/src/lib/validations/agent.ts`
- **API Testing**: Use the tRPC panel in development
- **Error Reference**: Check `/src/server/api/trpc.ts` for error handling
