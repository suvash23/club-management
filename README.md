# Club Management System

A web application designed for club administrators and members to manage membership plans, payments, member profiles, and club activities from a unified, modern interface.

---

## 🛠 Technology Stack

### Backend
- **Framework:** **NestJS** (TypeScript)
- **Database:** **PostgreSQL**
- **ORM:** **Prisma ORM** (Type-safe models, automated migrations, seeders)
- **Authentication:** **Passport.js + JWT + bcrypt**
- **Authorization:** Role-Based Access Control (`Admin` vs. `Member`)
- **API Documentation:** **Swagger / OpenAPI** at `http://localhost:5000/api/docs`

### Frontend
- **Framework:** **React (Vite) + TypeScript**
- **Styling:** **Tailwind CSS**
- **Icons:** **Lucide React**
- **Routing:** **React Router v7**
- **HTTP Client:** **Axios** with JWT bearer interceptors

---

## 🚀 Quick Start Guide

### 1. Database Setup (PostgreSQL)
Ensure PostgreSQL is running locally on port 5432:
```bash
# Database: club_management
# Connection string: postgresql://postgres:postgres@127.0.0.1:5432/club_management?schema=public
```

### 2. Backend Setup & Startup
```bash
cd backend
npm install
npx prisma db push      # Sync schema to PostgreSQL
npx ts-node prisma/seed.ts  # Seed initial admin, plans, members, and events
npm run start:dev       # Or: npm run build && npm run start:prod
```
The NestJS API will be available at: `http://localhost:5000/api`
Interactive Swagger API documentation: `http://localhost:5000/api/docs`

### 3. Frontend Setup & Startup
```bash
cd frontend
npm install
npm run dev
```
The application will be running at: `http://localhost:5173/`

---

## 👥 Default Demo Credentials

| Role | Email | Password | Access Details |
|---|---|---|---|
| **Administrator** | `admin@club.com` | `admin123` | Full Admin Console (Members, Plans, Invoicing, Events, Analytics) |
| **Club Member** | `member@club.com` | `member123` | Member Portal (Digital Pass, Plan Status, Payment History, RSVP) |

*(Quick-fill demo buttons are provided directly on the Login page for 1-click testing).*

---

## 📦 Main Modules & Features

### 1. Authentication & Role-Based Access Control
- JWT token-based authentication with expiration handling.
- Role-based route protection on both backend controllers and frontend navigation.
- Forgot Password request workflow with token generation.

### 2. Administrator Dashboard
- Real-time KPIs: **Total Members**, **Active Members**, **Expired Members**, **Total Membership Plans**, **Total Payments Collected**, and **Upcoming Events**.
- Recent Members table and Recent Transactions log.
- Upcoming events feed with registration counters.

### 3. Member Management
- Full CRUD for members with personal information, avatar, and contact info.
- Membership status management (`ACTIVE`, `EXPIRED`, `INACTIVE`).
- Filter members by status and search by name, email, or unique Member Code (`CLB-1001`).
- Subscription and payment history for each member.

### 4. Membership Plans
- Configurable membership tiers (e.g. Standard Monthly, Quarterly Executive, VIP Platinum Annual, Student Pass).
- Set pricing, validity duration (in days), and included perks/features.
- One-click active/archived status toggle.

### 5. Payments & Invoicing
- Transaction logging with unique invoice numbering (`INV-YYYYMM-XXXX`).
- Support for multiple payment methods: `CASH`, `CARD`, `BANK_TRANSFER`, `ONLINE`.
- Record manual offline payments.
- Printable, official payment receipt and invoice dialog.

### 6. Events & Activities
- Create and organize club tournaments, social galas, and workshops.
- Manage maximum attendee limits, event dates, venues, and fees.
- Attendee roster view with 1-click **Check-In / Attended** attendance marking.

### 7. Reports & Analytics
- Total revenue and transaction volume.
- Revenue breakdown by payment method.
- Membership status distribution and retention metrics.
- One-click **Export to CSV** for Members and Payment records.

### 8. Member Self-Service Portal
- Digital Club Pass with Member ID and status badge.
- Current active plan summary and renewal countdown.
- Personal payment receipts with print capability.
- Browse club events with 1-click **RSVP / Cancel RSVP**.
