# Database Migrations - Insurance Platform

## Overview
This MongoDB-based insurance platform uses Prisma with MongoDB provider. Unlike SQL databases, MongoDB doesn't use traditional schema migrations, but this directory documents database changes.

## Migration History

### Initial Schema (2025-08-26)
**Migration**: `init_insurance_platform`
**Description**: Initial database schema setup with all core models

**Collections Created:**
- `users` - User accounts and profile information
- `policies` - Insurance policies with embedded type-specific data
- `claims` - Insurance claims with status tracking
- `payments` - Premium payments and claim payouts  
- `documents` - File attachments for policies and claims

**Indexes Created:**
- `users_clerkId_key` - Unique index on clerkId field
- `users_email_key` - Unique index on email field
- `policies_policyNumber_key` - Unique index on policyNumber field
- `claims_claimNumber_key` - Unique index on claimNumber field
- `payments_stripeId_key` - Unique index on stripeId field

**Embedded Types:**
- `VehicleInfo` - Vehicle details for auto policies
- `PropertyInfo` - Property details for home policies
- `PersonalInfo` - Personal details for life/health policies

### Schema Updates

To apply schema changes in MongoDB:
1. Update `schema.prisma`
2. Run `npx prisma db push` to sync database
3. Run `npx prisma generate` to update client
4. Document changes in this file

### Development Commands
```bash
# Push schema changes to database
npx prisma db push

# Generate Prisma client after schema changes
npx prisma generate

# Seed database with test data
npm run db:seed

# View database in Prisma Studio
npm run db:studio

# Reset database (development only)
npx prisma db push --force-reset
```

## Production Deployment
For production deployments:
1. Ensure DATABASE_URL points to production MongoDB cluster
2. Run schema validation: `npx prisma validate`
3. Push schema: `npx prisma db push`
4. Generate client: `npx prisma generate`
5. Seed initial data if needed

## Backup Strategy
- MongoDB Atlas automatic backups enabled
- Point-in-time recovery available
- Manual exports via mongodump for critical data