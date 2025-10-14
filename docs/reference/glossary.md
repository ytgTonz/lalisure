---
title: Glossary
description: Common terms and definitions used in the Lalisure platform
status: active
last_updated: 2025-10-14
---

# Lalisure Platform Glossary

> **Quick reference** for terms, acronyms, and concepts used throughout the Lalisure platform

---

## A

### Agent
An insurance agent who creates policies on behalf of customers and manages client relationships. Agents require Supervisor approval for policy creation.

### API (Application Programming Interface)
Interface that allows external applications to interact with Lalisure programmatically.

### Authentication
Process of verifying user identity before granting access to the platform.

### Authorization
Process of determining what actions an authenticated user is allowed to perform.

---

## C

### Claim
A formal request from a policyholder to receive compensation for a covered loss or damage to their property.

### Clerk
Third-party authentication service used for customer web portal authentication.

### Cover Amount
The maximum amount of money an insurance policy will pay out for a covered claim. Ranges from R30,000 to R200,000 in Lalisure.

### Customer
End user who purchases insurance policies through Lalisure.

---

## D

### Dashboard
Main interface for users after logging in, showing overview of policies, claims, and account information.

---

## E

### E2E Testing (End-to-End Testing)
Testing that validates complete user workflows from start to finish.

### Environment Variables
Configuration values stored in `.env` file, containing sensitive information like API keys.

---

## J

### JWT (JSON Web Token)
Secure token format used for mobile and staff authentication sessions.

---

## M

### Middleware
Code that runs before request handlers, used for authentication, authorization, and request validation in Next.js.

### Mobile Session
30-day authentication session for mobile app users, created after OTP verification.

### MongoDB
NoSQL database used by Lalisure to store all application data.

---

## O

### OTP (One-Time Password)
6-digit code sent via SMS for mobile authentication. Valid for 5 minutes.

### Onboarding
Process of setting up a new user account and initial configuration.

---

## P

### Paystack
Payment processing service used for accepting insurance premiums and processing payments in South African Rands (ZAR).

### Policy
Insurance contract between Lalisure and a customer, specifying coverage terms, premium amount, and covered property.

### Policy Number
Unique identifier for an insurance policy (format: `POL-HOME-XXXXX`).

### Policy Tier
Coverage level based on insured amount (R30k, R50k, R75k, R100k, R150k, R200k).

### Premium
Monthly payment amount required to keep an insurance policy active.

### Prisma
TypeScript ORM (Object-Relational Mapping) used for type-safe database access.

### PRD (Product Requirements Document)
Comprehensive document outlining product features, requirements, and specifications.

---

## R

### RBAC (Role-Based Access Control)
Security model that restricts system access based on user roles (Customer, Agent, Supervisor, Admin).

### Resend
Email service provider used for sending transactional emails.

### Rural Address
Property location in rural South Africa without traditional street address, identified using What3Words.

---

## S

### Session
Period during which a user remains authenticated without needing to log in again.

### Session Token
Encrypted token that identifies an authenticated user session.

### SMS (Short Message Service)
Text messaging service used to send OTP codes for mobile authentication.

### SSR (Server-Side Rendering)
Next.js feature that renders pages on the server before sending to client.

### Supervisor
Staff role with authority to approve or reject policies and claims created by Agents.

---

## T

### tRPC
TypeScript-first RPC (Remote Procedure Call) framework providing end-to-end type safety between client and server.

### Twilio
SMS service provider used for sending OTP codes.

---

## U

### User Role
Classification of user type determining access permissions: Customer, Agent, Supervisor, Admin.

---

## W

### What3Words (W3W)
Geocoding system that identifies any location using three words (e.g., "index.home.raft"). Used for rural addressing.

### Webhook
HTTP callback that Lalisure sends to external systems when events occur (e.g., policy activation, payment success).

---

## Z

### ZAR (South African Rand)
Currency used throughout Lalisure platform (symbol: R).

### Zod
TypeScript schema validation library used for input validation and type inference.

### Zustand
Lightweight state management library used for client-side state in React components.

---

## Acronyms Quick Reference

| Acronym | Full Term | Description |
|---------|-----------|-------------|
| **API** | Application Programming Interface | Interface for programmatic access |
| **CI/CD** | Continuous Integration/Continuous Deployment | Automated testing and deployment |
| **CSP** | Content Security Policy | Web security header |
| **CORS** | Cross-Origin Resource Sharing | HTTP header-based mechanism |
| **E2E** | End-to-End | Complete workflow testing |
| **ENV** | Environment | Configuration settings |
| **HTTP** | Hypertext Transfer Protocol | Web communication protocol |
| **HTTPS** | HTTP Secure | Encrypted HTTP |
| **JWT** | JSON Web Token | Token-based authentication |
| **MFA** | Multi-Factor Authentication | Additional security layer |
| **ORM** | Object-Relational Mapping | Database abstraction layer |
| **OTP** | One-Time Password | Single-use authentication code |
| **POPIA** | Protection of Personal Information Act | SA data protection law |
| **PRD** | Product Requirements Document | Product specification |
| **PWA** | Progressive Web App | Web app with native features |
| **RBAC** | Role-Based Access Control | Permission system |
| **REST** | Representational State Transfer | API architectural style |
| **SDK** | Software Development Kit | Development tools |
| **SMS** | Short Message Service | Text messaging |
| **SQL** | Structured Query Language | Database query language |
| **SSR** | Server-Side Rendering | Server rendering |
| **UI** | User Interface | Visual interface |
| **UX** | User Experience | User interaction design |
| **W3W** | What3Words | Location service |
| **ZAR** | South African Rand | South African currency |

---

## Common Lalisure-Specific Terms

### Mobile Auth
Custom OTP-based authentication system for mobile app users.

### Per-Amount Policy
Insurance policy model where coverage is selected in fixed tiers (R30k - R200k) rather than being itemized.

### Rural-First
Platform design philosophy prioritizing features and UX for rural South African users.

### Staff Portal
Web interface for Agents, Supervisors, and Admins to manage policies and claims.

### Customer Portal
Web interface for customers to view policies, submit claims, and manage payments.

---

## Technical Stack Terms

### Next.js
React framework used for building Lalisure's web application.

### React
JavaScript library for building user interfaces.

### TypeScript
Typed superset of JavaScript used throughout Lalisure codebase.

### Tailwind CSS
Utility-first CSS framework used for styling.

### shadcn/ui
Component library built on Radix UI primitives.

### TanStack Query
Data fetching and caching library (formerly React Query).

---

## Business Domain Terms

### Policyholder
Person who owns an insurance policy (synonym: Customer).

### Underwriting
Process of evaluating insurance risk and determining coverage terms (being phased out in V2).

### Claim Settlement
Final payment made to policyholder after claim approval.

### Premium Calculator
Service that determines monthly premium based on coverage amount, property type, and risk factors.

### Coverage Period
Duration for which an insurance policy remains active (typically 12 months, renewable).

---

## Related Documentation

- [Architecture Overview](../architecture/overview.md) - System design
- [API Documentation](../api/README.md) - API reference
- [Developer Guide](../guides/developer/README.md) - Development docs
- [V2 PRD](./PRD_V2.md) - Product requirements

---

**Last Updated**: October 14, 2025
**Version**: 2.0
