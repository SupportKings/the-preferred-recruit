# 📋 Project Documentation Guidelines

> 🎯 **Mission**: Maintain `PROJECT_OVERVIEW.md` as a **business/management overview**

## 🔍 Overview

Keep `PROJECT_OVERVIEW.md` as a **stakeholder report** - what business capabilities exist, what users can do, project status, and investment areas. Think "executive briefing" for management, not technical documentation.

## 📊 When to Update PROJECT_OVERVIEW.md

> 🎯 **Rule**: Update when **business capabilities** change or new **user features** are added

### ✅ Update For:
- 🚀 **New user feature** (users can now do X)
- 💰 **Business capability** (payments, subscriptions, reporting)
- 👥 **User management** changes (new roles, permissions)
- 📊 **Major business milestone** (first revenue feature, user onboarding, etc.)

### ❌ Don't Update For:
- 🐛 Bug fixes or technical improvements
- 💄 UI/UX improvements
- 🔧 Backend optimizations
- 📝 Developer tooling changes

## 🛠️ How to Update PROJECT_OVERVIEW.md

### 🎯 Management Report Focus

Think of it as a **quarterly business report** for stakeholders:

1. **What can users do now?** (user capabilities)
2. **What business value does this provide?** (revenue, efficiency, etc.)
3. **What's the project status?** (development stage, readiness)
4. **What major investments were made?** (new systems, integrations)

### 📝 Key Sections to Update

**Project Purpose**
```markdown
This application enables [user type] to [main business value].
Current capabilities: [list user-facing features]
```

**Business Features**
```markdown
## User Management
Users can register, log in, and manage their accounts.

## Payment Processing  
Customers can purchase products using credit cards.
```

**Project Status**
```markdown
**Development Stage**: Production Ready
**User Base**: 0 users (pre-launch)
**Revenue Features**: Payment processing active
```

## 💡 Keep It Simple

### 🎯 Good Example
```markdown
#### Payment Processing
Users can purchase premium features using Stripe. Supports one-time payments and subscriptions.
```

### ❌ Bad Example (Too Detailed)  
```markdown
#### Payment Processing
- Location: /features/payments/
- Purpose: Process payments via Stripe API
- API Endpoints: POST /api/trpc/payments.create, GET /api/trpc/payments.list
- External Services: Stripe webhooks, Stripe Connect, Stripe Elements
- Database Tables: payments, payment_methods, subscriptions
- Business Logic: Validate payment amounts, handle failed payments
- [... 20 more lines of technical details ...]
```

## 🎯 Writing Guidelines

### ✅ High-Level Focus
- **What** the project does for users
- **Major** systems and integrations  
- **Key** business concepts
- **Current** capabilities and status

### ❌ Avoid Technical Details
- Specific API endpoints
- Database table structures
- Implementation specifics
- Step-by-step processes

### 🎯 Target Audience
Write for **business stakeholders** who need to understand:
- "What business value does this provide?"
- "What can our users do with this?"
- "What's our current capability maturity?"
- "What major business systems are integrated?"

## 🌟 Real Example

### ✅ Good Business Overview Style
```markdown
## User Authentication & Access Control
Users can securely register and log in to access their personal dashboard. 
The system supports both email-based login and biometric authentication for convenience.

**Current Users**: 0 (pre-launch)
**Access Levels**: Standard users and administrators
**Business Value**: Secure user data protection and personalized experience
```

### ❌ Too Technical (Belongs in Developer Docs)
```markdown
#### User Authentication Technical Implementation
- Technology: Better Auth with PostgreSQL backend
- API Endpoints: POST /api/auth/signin, GET /api/auth/session  
- Session management: Cookie-based with 5min cache
- OTP delivery: Resend email service integration
- Database schema: user, session, passkey tables
- [... more technical implementation details ...]
```

## ✅ Quick Checklist

When completing a major feature, ask:

- [ ] 💼 **Does this enable new user capabilities?**
- [ ] 💰 **Does this create business value (revenue, efficiency)?**
- [ ] 👥 **Does this change who can use the system or how?**
- [ ] 📊 **Would management need to know about this capability?**

If **yes** to any → Update `PROJECT_OVERVIEW.md` with **business-focused description**.

> 💡 **Goal**: A business stakeholder should understand what users can do and project status in under 3 minutes.