# Agent Settings Documentation

## Overview

The Agent Settings system allows insurance agents to manage their profile information, professional credentials, preferences, and working schedule through a comprehensive settings interface.

## Features

### 📋 Profile Management

- **Personal Information**: First name, last name, email, phone
- **Address Information**: Street address, city, province, postal code, country
- **Professional Details**: Agent code, license number, commission rate

### ⚙️ Preferences Configuration

- **Notification Settings**: Email, SMS, weekly reports, auto follow-up
- **Localization**: Timezone and language preferences
- **Working Hours**: Daily schedule configuration for each day of the week

### 🔒 Security & Validation

- **Form Validation**: Comprehensive Zod schema validation
- **Agent Code Uniqueness**: Ensures unique agent codes across the system
- **Role-based Access**: Only agents and admins can update agent settings

## Database Schema

### New Fields Added to User Model

```prisma
// Agent-specific fields
agentCode      String? // Unique agent identifier
licenseNumber  String? // Insurance license number
commissionRate Float?  // Commission rate percentage

// Agent preferences
agentPreferences AgentPreferences?

// Agent working hours
workingHours WorkingHours?
```

### Embedded Types

```prisma
type AgentPreferences {
  emailNotifications Boolean @default(true)
  smsNotifications   Boolean @default(true)
  weeklyReports      Boolean @default(true)
  autoFollowUp       Boolean @default(false)
  timezone           String  @default("Africa/Johannesburg")
  language           String  @default("en")
}

type WorkingHours {
  monday    DaySchedule
  tuesday   DaySchedule
  wednesday DaySchedule
  thursday  DaySchedule
  friday    DaySchedule
  saturday  DaySchedule
  sunday    DaySchedule
}

type DaySchedule {
  enabled Boolean @default(true)
  start   String  @default("08:00")
  end     String  @default("17:00")
}
```

## API Endpoints

### REST API Routes

#### `GET /api/staff/settings`

Retrieve current user's agent settings.

**Response:**

```json
{
  "settings": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "agent@lalisure.com",
    "phone": "+27123456789",
    "agentCode": "AGT123456",
    "licenseNumber": "LIC123456",
    "commissionRate": 15.5,
    "address": {
      "street": "123 Main Street",
      "city": "Cape Town",
      "province": "Western Cape",
      "postalCode": "8001",
      "country": "South Africa"
    },
    "preferences": {
      "emailNotifications": true,
      "smsNotifications": true,
      "weeklyReports": true,
      "autoFollowUp": false,
      "timezone": "Africa/Johannesburg",
      "language": "en"
    },
    "workingHours": {
      "monday": { "enabled": true, "start": "08:00", "end": "17:00" },
      "tuesday": { "enabled": true, "start": "08:00", "end": "17:00" }
      // ... other days
    }
  }
}
```

#### `PUT /api/staff/settings`

Update current user's agent settings.

**Request Body:** AgentSettings schema
**Response:**

```json
{
  "success": true,
  "message": "Settings updated successfully",
  "user": {
    /* updated user data */
  }
}
```

### tRPC Routes

#### `agentSettings.getSettings`

Type-safe query to get agent settings.

#### `agentSettings.updateSettings`

Type-safe mutation to update agent settings.

#### `agentSettings.checkAgentCode`

Check if an agent code is available.

#### `agentSettings.getAllAgents`

Get all agents (admin only).

## Frontend Components

### AgentSettings Component

**Location:** `src/components/agent/agent-settings.tsx`

**Features:**

- Tabbed interface (Profile, Professional, Preferences, Schedule)
- Form validation with real-time error display
- Edit/view mode toggle
- Loading states and error handling
- Responsive design

**Usage:**

```tsx
import { AgentSettings } from "@/components/agent/agent-settings";

export default function SettingsPage() {
  return <AgentSettings />;
}
```

## Validation Schema

**Location:** `src/lib/validations/agent.ts`

The validation schema includes:

- Required field validation
- Email format validation
- Phone number validation
- Agent code uniqueness
- Commission rate range validation
- Address validation
- Working hours validation

## Migration

### Running the Migration

To add agent settings to existing users:

```bash
npx tsx scripts/migrate-agent-settings.ts
```

This migration will:

1. Add default agent preferences to all users
2. Add default working hours to all users
3. Generate unique agent codes for existing agents
4. Provide a summary of changes

### Manual Database Update

If you need to update the database schema manually:

```bash
npx prisma db push
```

## Navigation

The settings page is accessible through:

- **URL:** `/agent/settings`
- **Navigation:** Agent sidebar → Settings
- **Icon:** Settings icon in the navigation menu

## Security Considerations

1. **Authentication Required**: All endpoints require valid staff authentication
2. **Role-based Access**: Only agents and admins can update agent settings
3. **Agent Code Uniqueness**: System prevents duplicate agent codes
4. **Input Validation**: All inputs are validated using Zod schemas
5. **Session Management**: Uses secure JWT-based staff authentication

## Error Handling

The system provides comprehensive error handling:

- **Validation Errors**: Clear field-specific error messages
- **Network Errors**: User-friendly error notifications
- **Permission Errors**: Appropriate access denied messages
- **Loading States**: Visual feedback during API calls

## Future Enhancements

Potential future improvements:

1. **Profile Picture Upload**: Add avatar management
2. **Advanced Scheduling**: Recurring schedule patterns
3. **Notification Templates**: Customizable notification preferences
4. **Audit Logging**: Track settings changes
5. **Bulk Import**: Import agent data from external systems
6. **API Rate Limiting**: Prevent abuse of settings endpoints

## Testing

### Manual Testing Checklist

- [ ] Load settings page successfully
- [ ] View all tabs (Profile, Professional, Preferences, Schedule)
- [ ] Edit mode toggle works correctly
- [ ] Form validation displays appropriate errors
- [ ] Save changes works and shows success message
- [ ] Cancel button resets form to original values
- [ ] Loading states display correctly
- [ ] Agent code uniqueness validation works
- [ ] Working hours can be enabled/disabled per day
- [ ] All form fields save and load correctly

### API Testing

Test the following scenarios:

- [ ] GET settings returns correct data
- [ ] PUT settings updates data correctly
- [ ] Invalid data returns validation errors
- [ ] Unauthorized access returns 401
- [ ] Agent code conflicts return 409
- [ ] Non-agent users cannot update settings

## Troubleshooting

### Common Issues

1. **Settings not loading**: Check authentication and database connection
2. **Form validation errors**: Verify input data matches schema requirements
3. **Agent code conflicts**: Ensure agent codes are unique across the system
4. **Permission denied**: Verify user has AGENT or ADMIN role
5. **Database errors**: Check Prisma schema and migration status

### Debug Steps

1. Check browser console for client-side errors
2. Verify API endpoints are accessible
3. Confirm database schema is up to date
4. Validate user authentication status
5. Check server logs for backend errors
