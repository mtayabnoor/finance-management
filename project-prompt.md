Full Production-Grade Prompt (Next.js Finance App)
🧩 Project Overview

Build a production-grade personal finance web application where users can:

Track income and expenses
Manage subscriptions
View analytics and insights
Use a clean, fast, modern dashboard

The app must be scalable, secure, maintainable, and optimized for daily use.

🏗️ Tech Stack (MANDATORY)
Frontend
Next.js (App Router)
Tailwind CSS
shadcn/ui (component library)
Authentication
better-auth (session-based auth)
Backend
Next.js Server Actions + Route Handlers
Database
PostgreSQL
Prisma ORM
Charts
Recharts (or similar lightweight charting library)
🧱 Architecture Requirements
🔹 1. Folder Structure (Production-Ready)
/app
/(auth)
/signin
/signup

/(dashboard)
/dashboard
/transactions
/subscriptions
/insights

/api (only if needed)

/components
/ui # shadcn components
/shared # reusable business components
/charts # chart components
/forms # form components

/lib
/auth # better-auth config
/db # prisma client
/services # business logic
/validators # zod schemas
/utils

/prisma
schema.prisma

/styles
globals.css
🔹 2. Design System (Centralized Styling)
Use Tailwind + CSS variables
Define global tokens in globals.css
:root {
--primary: 220 90% 56%;
--background: 0 0% 100%;
--text: 222 47% 11%;
}

.dark {
--background: 222 47% 11%;
--text: 210 40% 98%;
}
Rules:
❌ No inline styles
❌ No per-component hardcoded colors
✅ Use theme tokens everywhere
✅ Support light/dark mode
🔹 3. Authentication (better-auth)
Implement:
Email/password login
Session management
Store session securely (HTTP-only cookies)
Protect all dashboard routes
Middleware to redirect unauthenticated users
🔹 4. Database Design (Prisma)
Models:
model User {
id String @id @default(cuid())
email String @unique
createdAt DateTime @default(now())

transactions Transaction[]
subscriptions Subscription[]
}

model Transaction {
id String @id @default(cuid())
userId String
amount Float
category String
date DateTime
note String?

user User @relation(fields: [userId], references: [id])
}

model Subscription {
id String @id @default(cuid())
userId String
name String
amount Float
billingCycle String
nextBillingDate DateTime

user User @relation(fields: [userId], references: [id])
}
🔹 5. Backend Logic
Use:
Server Actions for mutations (create/update/delete)
Route Handlers for APIs if needed
Rules:
Validate all inputs using Zod
Never trust frontend data
Always check user session before DB operations
🔹 6. Core Features
✅ Dashboard
Monthly income & expense summary
Recent transactions
Subscription reminders
Quick stats cards
✅ Transactions
Add / edit / delete expenses
Categorization
Fast input (optimized UX)
✅ Subscriptions
Add recurring expenses
Track next billing date
Show monthly subscription total
✅ Insights
Spending by category (pie chart)
Monthly trend (bar chart)
Key insights (e.g. top category)
🔹 7. UI/UX Principles
Fast interactions (< 300ms)
Minimal design (no clutter)
Mobile responsive
Accessible (ARIA + keyboard navigation)
Use shadcn components:
Card
Button
Input
Dialog
Table
🔹 8. Charts (Recharts)
Wrap charts inside reusable components
Use consistent styling
Avoid heavy libraries
🔹 9. Security (VERY IMPORTANT)
Protect all routes (auth middleware)
Validate all inputs (Zod)
Prevent unauthorized DB access
Sanitize user input
Use environment variables properly
Rate limit sensitive endpoints (optional)
🔹 10. Performance
Use Server Components where possible
Avoid unnecessary client-side state
Optimize queries (Prisma)
Use caching if needed
🔹 11. Error Handling
Graceful UI errors
Backend error logging
User-friendly messages
🔹 12. Code Quality
Use TypeScript strictly
Modular architecture
Reusable components
Clean naming conventions
🔹 13. Scalability
Separate business logic into /lib/services
Keep UI and logic separate
Prepare for future features:
budgets
AI insights
multi-currency
🔹 14. Deployment
Use Vercel for hosting
PostgreSQL (Neon / Supabase / Railway)
Environment variables:
DATABASE_URL
AUTH_SECRET
🎯 Final Goal

Build a clean, fast, scalable, production-ready finance dashboard that:

Users can use daily
Is easy to maintain
Has centralized styling
Has secure backend enforcement
