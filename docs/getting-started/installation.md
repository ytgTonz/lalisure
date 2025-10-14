---
title: Installation Guide
description: Complete setup instructions for Lalisure development environment
status: active
last_updated: 2025-10-14
---

# Installation Guide

Complete guide to setting up your Lalisure development environment from scratch.

---

## 📋 Prerequisites

### Required Software

- **Node.js**: v18.x or higher ([Download](https://nodejs.org/))
- **npm**: Package manager
- **Git**: Version control ([Download](https://git-scm.com/))
- **MongoDB**: v6.0+ ([Download](https://www.mongodb.com/try/download/community))
- **Docker** (optional): For containerized development

### System Requirements

- **OS**: Windows 10+, macOS 10.15+, or Linux
- **RAM**: Minimum 8GB (16GB recommended)
- **Disk Space**: 5GB free space
- **Internet**: For installing dependencies

### Recommended Tools

- **VS Code**: Code editor ([Download](https://code.visualstudio.com/))
- **MongoDB Compass**: Database GUI ([Download](https://www.mongodb.com/products/compass))
- **Bruno** or **Postman**: API testing
- **Git Bash** (Windows): Better terminal experience

---

## 🚀 Quick Setup (5 minutes)

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-org/lalisure-nextjs-fix.git
cd lalisure-nextjs-fix

# Checkout development branch
git checkout develop/v2-new-prd
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Using npm
npm install
```

### 3. Set Up Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
# See "Environment Variables" section below
```

### 4. Start Services

```bash
# Option A: Using Docker (easiest)
docker-compose up -d

# Option B: Local MongoDB
# Start MongoDB manually, then:
npm run db:generate
npm run db:push
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔧 Detailed Setup

### Database Setup

#### Option A: Docker (Recommended)

```bash
# Start MongoDB and Redis containers
docker-compose up -d

# Verify containers are running
docker-compose ps

# View logs
docker-compose logs -f mongodb
```

**Docker Compose includes**:

- MongoDB v6.0
- Redis (optional, for caching)
- MongoDB Express (database UI at http://localhost:8081)

#### Option B: Local MongoDB Installation

**Windows**:

1. Download MongoDB Community Server
2. Run installer, select "Complete" setup
3. Install as Windows Service
4. Start MongoDB service

**macOS**:

```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community@6.0
brew services start mongodb-community@6.0
```

**Linux (Ubuntu/Debian)**:

```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
```

### Database Migration

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed development data (optional)
npm run db:seed
```

---

## ⚙️ Environment Variables

### Required Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="mongodb://localhost:27017/lalisure"

# Clerk Authentication (Customer Portal)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# Paystack (Payment Processing)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_..."
PAYSTACK_SECRET_KEY="sk_test_..."

# JWT for Mobile Sessions
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-long"

# Twilio SMS (OTP)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+27..."

# Email (Resend)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# File Upload
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="..."

# What3Words (Rural Addressing)
WHAT3WORDS_API_KEY="..."

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### Optional Variables

```env
# Redis (Caching)
REDIS_URL="redis://localhost:6379"

# Analytics
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# Error Tracking
SENTRY_DSN="..."
```

### Getting API Keys

**Clerk** (Authentication):

1. Sign up at [clerk.com](https://clerk.com)
2. Create new application
3. Copy API keys from Dashboard → API Keys

**Paystack** (Payments):

1. Sign up at [paystack.com](https://paystack.com)
2. Go to Settings → API Keys & Webhooks
3. Use test keys for development

**Twilio** (SMS):

1. Sign up at [twilio.com](https://www.twilio.com/try-twilio)
2. Get free trial phone number
3. Copy Account SID and Auth Token

**Resend** (Email):

1. Sign up at [resend.com](https://resend.com)
2. Create API key
3. Verify sending domain

**What3Words**:

1. Sign up at [developer.what3words.com](https://developer.what3words.com)
2. Create API key
3. Free tier: 25,000 requests/month

---

## 🧪 Verify Installation

### Run Tests

```bash
# Unit tests
npm test

# E2E tests (requires dev server running)
npm run test:e2e

# Type checking
npm run build
```

### Check Database Connection

```bash
# Open Prisma Studio
npm run db:studio
```

Access at [http://localhost:5555](http://localhost:5555)

### Test API Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# tRPC batch endpoint
curl -X POST http://localhost:3000/api/trpc/batch
```

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

**Error: MongoServerError: Authentication failed**

```bash
# Solution: Check DATABASE_URL in .env
# Ensure MongoDB is running: docker-compose ps
```

**Error: connect ECONNREFUSED 127.0.0.1:27017**

```bash
# Solution: Start MongoDB
docker-compose up -d mongodb
# OR
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

### Prisma Issues

**Error: Prisma Client not found**

```bash
# Solution: Regenerate Prisma client
npm run db:generate
```

**Error: Migration is required**

```bash
# Solution: Push schema changes
npm run db:push
```

### Build Errors

**Error: Module not found**

```bash
# Solution: Clear cache and reinstall
rm -rf node_modules .next
npm install
```

**Error: Port 3000 already in use**

```bash
# Solution: Kill process or use different port
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Environment Variable Issues

**Error: Missing environment variables**

```bash
# Solution: Verify .env file exists and has all required vars
cat .env | grep -E "(DATABASE_URL|JWT_SECRET|CLERK_SECRET_KEY)"
```

---

## 📦 Project Structure After Setup

```
lalisure-nextjs-fix/
├── .env                    # Your environment variables
├── .next/                  # Next.js build output
├── node_modules/           # Dependencies
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Migration history
├── src/
│   ├── app/               # Next.js pages
│   ├── components/        # React components
│   ├── lib/               # Utilities and services
│   └── server/            # tRPC API
└── docs/                  # Documentation
```

---

## 🎯 Next Steps

Now that your environment is set up:

1. **Create your first policy**: Follow the [First Policy Guide](./first-policy.md)
2. **Test OTP authentication**: See [OTP Quick Start](./otp-quick-start.md)
3. **Explore the codebase**: Review [Developer Guide](../guides/developer/README.md)
4. **Understand architecture**: Read [Architecture Overview](../architecture/overview.md)

---

## 🆘 Getting Help

- **Issues**: Check [GitHub Issues](https://github.com/your-org/lalisure-nextjs-fix/issues)
- **Documentation**: See [docs/README.md](../README.md)
- **Developer Guide**: [guides/developer/README.md](../guides/developer/README.md)

---

**Installation complete!** 🎉 Start coding with `npm run dev`
