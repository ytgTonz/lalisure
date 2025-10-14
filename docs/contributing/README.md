---
title: Contributing to Lalisure
description: Guidelines for contributing to the Lalisure Insurance Platform
status: active
last_updated: 2025-10-14
---

# Contributing to Lalisure

Thank you for your interest in contributing to Lalisure! This guide will help you get started.

---

## 🎯 Ways to Contribute

### 🐛 Report Bugs
Found a bug? Help us fix it:
1. Check [existing issues](https://github.com/your-org/lalisure/issues)
2. Create new issue with `bug` label
3. Include: steps to reproduce, expected vs actual behavior, environment details

### ✨ Suggest Features
Have an idea? We'd love to hear it:
1. Review [V2 PRD](../reference/PRD_V2.md) for planned features
2. Create issue with `enhancement` label
3. Describe use case, proposed solution, and benefits

### 📝 Improve Documentation
Documentation is always improvable:
1. Fix typos, clarify explanations
2. Add examples and diagrams
3. Update outdated content
4. Follow [Documentation Guide](./documentation-guide.md)

### 💻 Contribute Code
Ready to code? Follow the workflow below.

---

## 🚀 Getting Started

### Prerequisites
1. Complete [Installation Guide](../getting-started/installation.md)
2. Read [Developer Guide](../guides/developer/README.md)
3. Review [Code Style Guide](./code-style.md)
4. Understand [Architecture](../architecture/overview.md)

### Set Up Your Fork
```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/lalisure.git
cd lalisure

# Add upstream remote
git remote add upstream https://github.com/your-org/lalisure.git

# Create development branch
git checkout develop/v2-new-prd
```

---

## 🔄 Development Workflow

### 1. Create Feature Branch
```bash
# Update from upstream
git fetch upstream
git checkout develop/v2-new-prd
git merge upstream/develop/v2-new-prd

# Create feature branch
git checkout -b feature/your-feature-name
# OR
git checkout -b fix/bug-description
```

### Branch Naming Conventions
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/topic` - Documentation updates
- `refactor/component-name` - Code refactoring
- `test/feature-name` - Test additions
- `chore/task-description` - Maintenance tasks

### 2. Make Changes
```bash
# Make your changes
# Follow code style guide
# Add tests
# Update documentation
```

### 3. Test Your Changes
```bash
# Run linter
npm run lint

# Run type checker
npm run build

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Test locally
npm run dev
```

### 4. Commit Changes
```bash
# Stage changes
git add .

# Commit with conventional commits
git commit -m "feat: add mobile OTP authentication"
# OR
git commit -m "fix: resolve policy calculation error"
```

### Commit Message Format
Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Maintenance tasks

**Examples**:
```bash
feat(auth): implement mobile OTP authentication

Add OTP generation and verification for mobile users
using Twilio SMS service. Includes 30-day JWT sessions
and security logging.

Closes #123
```

```bash
fix(policy): correct premium calculation for R100k tier

Premium calculator was using wrong rate for R100k tier.
Updated calculation logic and added tests.

Fixes #456
```

### 5. Push and Create PR
```bash
# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
# Fill out PR template
# Link related issues
```

---

## 📋 Pull Request Guidelines

### PR Title Format
```
<type>: <description>
```

Example: `feat: add mobile OTP authentication`

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Added X functionality
- Fixed Y bug
- Updated Z documentation

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots here]

## Related Issues
Closes #123
Relates to #456

## Checklist
- [ ] Code follows style guide
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Tests pass
- [ ] Build succeeds
```

### PR Review Process
1. **Automated Checks**: CI/CD runs tests and linting
2. **Code Review**: Maintainers review code
3. **Feedback**: Address review comments
4. **Approval**: Get approval from maintainer
5. **Merge**: Maintainer merges PR

---

## 🎨 Code Style Guidelines

### TypeScript/JavaScript
- **Use TypeScript**: All new code must be TypeScript
- **Strict Mode**: Enable strict type checking
- **No `any`**: Use proper types or `unknown`
- **Naming**: camelCase for variables, PascalCase for components

### React Components
```typescript
// ✅ Good: Functional component with TypeScript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  );
}

// ❌ Bad: Missing types, default export
export default function Button(props) {
  return <button {...props} />;
}
```

### API Endpoints (tRPC)
```typescript
// ✅ Good: Type-safe with input validation
export const policyRouter = createTRPCRouter({
  create: protectedProcedure
    .input(policyCreationSchema)
    .mutation(async ({ ctx, input }) => {
      const premium = await calculatePremium(input);
      return ctx.db.policy.create({
        data: { ...input, premium },
      });
    }),
});

// ❌ Bad: Missing validation, unclear types
export const policyRouter = createTRPCRouter({
  create: publicProcedure
    .mutation(async ({ ctx, input }: any) => {
      return ctx.db.policy.create({ data: input });
    }),
});
```

See [Code Style Guide](./code-style.md) for complete guidelines.

---

## ✅ Testing Requirements

### Unit Tests
- **Coverage**: Aim for 80%+ coverage
- **Location**: Colocate with source files (`*.test.ts`)
- **Framework**: Vitest

```typescript
// src/lib/services/premium-calculator.test.ts
import { describe, it, expect } from 'vitest';
import { calculatePremium } from './premium-calculator';

describe('PremiumCalculator', () => {
  it('should calculate correct premium for R30k tier', () => {
    const result = calculatePremium({ coverAmount: 30000 });
    expect(result).toBe(150); // R150/month
  });
});
```

### Integration Tests
- Test API endpoints
- Test database operations
- Test external service integrations

### E2E Tests
- Test critical user journeys
- Use Playwright
- Run in CI/CD

---

## 📝 Documentation Requirements

All code changes should include documentation updates:

- **Code Comments**: Explain complex logic
- **JSDoc**: Document public APIs
- **README Updates**: Update affected docs
- **API Docs**: Update API reference
- **Architecture Docs**: Update if architecture changes

---

## 🔍 Code Review Checklist

### Before Submitting
- [ ] Code follows style guide
- [ ] All tests pass
- [ ] No linting errors
- [ ] Build succeeds
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] PR description is complete

### During Review
- [ ] Address all comments
- [ ] Update tests as needed
- [ ] Rebase if needed
- [ ] Request re-review

---

## 🏆 Recognition

Contributors are recognized in:
- GitHub contributors page
- Release notes
- Project README

Significant contributions may earn you:
- Core contributor status
- Maintainer privileges
- Shout-outs in announcements

---

## 🆘 Getting Help

### Questions?
- **Slack/Discord**: Join our community channel
- **Issues**: Create issue with `question` label
- **Email**: dev-team@lalisure.com

### Resources
- [Developer Guide](../guides/developer/README.md)
- [Architecture Overview](../architecture/overview.md)
- [Code Style Guide](./code-style.md)
- [V2 PRD](../reference/PRD_V2.md)

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

## 🙏 Thank You!

Every contribution, no matter how small, helps make Lalisure better for everyone. Thank you for taking the time to contribute!

---

**Questions?** Open an issue or reach out to the maintainers.
