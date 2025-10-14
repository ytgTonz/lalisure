# Lalisure Documentation

> **Version**: 2.0.0 (V2 Development)
> **Last Updated**: October 14, 2025
> **Status**: Active Development

Welcome to the Lalisure Insurance Platform documentation. This comprehensive guide serves developers, users, API consumers, and contributors.

---

## 📚 Documentation Structure

### 🚀 [getting-started/](./getting-started/)
Quick start guides to get you up and running:
- **[Installation Guide](./getting-started/installation.md)** - Environment setup from scratch
- **[OTP Quick Start](./getting-started/otp-quick-start.md)** - Mobile OTP authentication setup
- **[First Policy Guide](./getting-started/first-policy.md)** - Create your first insurance policy

### 📖 [guides/](./guides/)
Comprehensive guides for all user types:

#### 👥 [guides/user/](./guides/user/)
End-user documentation:
- **[Customer Guide](./guides/user/customer-guide.md)** - Using the customer portal
- **[Agent Guide](./guides/user/agent-guide.md)** - Agent workflows and best practices
- **[Admin Guide](./guides/user/admin-guide.md)** - Administrative operations
- **[User Manual](./guides/user/user-manual.md)** - Complete reference for all roles

#### 👨‍💻 [guides/developer/](./guides/developer/)
Developer documentation:
- **[Developer Guide](./guides/developer/README.md)** - Complete development reference
- **[Setup Guides](./guides/developer/setup/)** - Environment configuration (Email, SMS, Database)
- **[Feature Documentation](./guides/developer/features/)** - Feature-specific implementation guides
- **[Testing Guides](./guides/developer/testing/)** - Testing strategies (Bruno, tRPC, E2E)
- **[Deployment Guides](./guides/developer/deployment/)** - Production deployment and checklists

### 🔌 [api/](./api/)
API documentation and integration guides:
- **[API Overview](./api/README.md)** - Getting started with Lalisure APIs
- **[tRPC API Reference](./api/TRPC_API_DOCUMENTATION.md)** - Complete endpoint documentation
- **[Mobile API Guide](./api/MOBILE_API_DOCUMENTATION.md)** - Mobile app integration
- **[Postman Collection](./api/CUSTOMER_API_ENDPOINTS_POSTMAN.md)** - API testing collection

### 🏗️ [architecture/](./architecture/)
System architecture and design documentation:
- **[System Overview](./architecture/overview.md)** - High-level architecture
- **[Database Schema](./architecture/database-schema.md)** - Database design and models
- **[Authentication Flow](./architecture/authentication-flow-security-analysis.md)** - Auth architecture
- **[Security Design](./architecture/security.md)** - Security architecture
- **[Project Breakdown](./architecture/project_breakdown.md)** - Detailed system structure
- **[Flowcharts](./architecture/FLOWCHARTS.md)** - Visual system diagrams

### 📋 [reference/](./reference/)
Reference materials and specifications:
- **[V2 PRD](./reference/PRD_V2.md)** - V2 Product Requirements (Active Development)
- **[V1 PRD](./reference/PRD.md)** - V1 Product Requirements (Archived)
- **[Glossary](./reference/glossary.md)** - Platform terminology and definitions

### 🤝 [contributing/](./contributing/)
Contribution guidelines:
- **[Contributing Guide](./contributing/README.md)** - How to contribute to Lalisure
- **[Code Style Guide](./contributing/code-style.md)** - Coding standards and conventions
- **[Documentation Guide](./contributing/documentation-guide.md)** - Writing documentation

### 📦 [archive/](./archive/)
Historical documentation:
- **[V1 Documentation](./archive/v1/)** - Complete V1 state and transition guides
- **[Phase Reports](./archive/phases/)** - Development phase completion summaries

---

## 🎯 Quick Navigation by Role

### 👨‍💻 **I'm a Developer**
1. Start with [Installation Guide](./getting-started/installation.md)
2. Review [Developer Guide](./guides/developer/README.md)
3. Check [Architecture Overview](./architecture/overview.md)
4. Explore [Feature Documentation](./guides/developer/features/)

### 🔌 **I'm Integrating with the API**
1. Read [API Overview](./api/README.md)
2. Review [tRPC API Reference](./api/TRPC_API_DOCUMENTATION.md)
3. Try [Postman Collection](./api/CUSTOMER_API_ENDPOINTS_POSTMAN.md)
4. Check [Authentication Flow](./architecture/authentication-flow-security-analysis.md)

### 👥 **I'm an End User**
1. Start with [User Manual](./guides/user/user-manual.md)
2. Find your role: [Customer](./guides/user/customer-guide.md) | [Agent](./guides/user/agent-guide.md) | [Admin](./guides/user/admin-guide.md)

### 🤝 **I Want to Contribute**
1. Read [Contributing Guide](./contributing/README.md)
2. Review [Code Style Guide](./contributing/code-style.md)
3. Check [Documentation Guide](./contributing/documentation-guide.md)

---

## 📝 Documentation Standards

All Lalisure documentation follows these standards:

### File Naming
- Use **kebab-case** for file names: `feature-name-guide.md`
- Keep names descriptive but concise
- Use `.md` extension for all documentation

### Frontmatter
All documentation files should include metadata:
```markdown
---
title: Document Title
description: Brief description of the document
status: active | archived | draft
last_updated: 2025-10-14
author: Your Name
---
```

### Content Guidelines
- **Clear & Concise**: Write for clarity, avoid jargon
- **Code Examples**: Include practical, working examples
- **Version Info**: Note version compatibility when relevant
- **Cross-References**: Link to related documentation
- **Keep Updated**: Update docs with code changes

### Markdown Conventions
- Use `#` headings for hierarchy (not underlines)
- Include table of contents for long documents
- Use code fences with language identifiers
- Add alt text to all images
- Use tables for structured data

---

## 🔄 Documentation Updates

### Recent Changes
- **Oct 14, 2025**: Major documentation reorganization (V2.0.0)
  - New folder structure by audience
  - Consolidated OTP authentication docs
  - Added quick start guides
  - Improved navigation and discoverability

### Reporting Issues
Found an error or outdated information?
1. Check if already reported in project issues
2. Create new issue with `documentation` label
3. Include: file path, issue description, suggested fix

---

## 🆘 Support

### For Technical Questions
- **Developers**: Review [Developer Guide](./guides/developer/README.md)
- **API Issues**: Check [API Documentation](./api/README.md)
- **Architecture**: See [Architecture Docs](./architecture/)

### For Feature Requests
- Review [V2 PRD](./reference/PRD_V2.md) for planned features
- Submit feature requests via project issues
- Tag with `enhancement` label

### For General Help
- Start with [User Manual](./guides/user/user-manual.md)
- Check role-specific guides
- Contact support team

---

## 🎓 Learning Path

### Beginner Path (1-2 weeks)
1. ✅ Read [Installation Guide](./getting-started/installation.md)
2. ✅ Complete [First Policy Guide](./getting-started/first-policy.md)
3. ✅ Review [User Manual](./guides/user/user-manual.md)
4. ✅ Explore [API Overview](./api/README.md)

### Intermediate Path (2-4 weeks)
1. ✅ Study [Developer Guide](./guides/developer/README.md)
2. ✅ Learn [Architecture Overview](./architecture/overview.md)
3. ✅ Practice with [Testing Guides](./guides/developer/testing/)
4. ✅ Review [Security Design](./architecture/security.md)

### Advanced Path (1-2 months)
1. ✅ Deep dive into [Feature Documentation](./guides/developer/features/)
2. ✅ Master [Deployment Guides](./guides/developer/deployment/)
3. ✅ Understand [Database Schema](./architecture/database-schema.md)
4. ✅ Contribute via [Contributing Guide](./contributing/README.md)

---

**🚀 Ready to start? Head to [Getting Started](./getting-started/) →**

---

**Documentation Version**: 2.0.0
**Platform Version**: V2 (Active Development)
**Branch**: `develop/v2-new-prd`
