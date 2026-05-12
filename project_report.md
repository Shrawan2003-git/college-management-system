# College Event Management System
### Project Report

---

## Table of Contents

1. [Abstract](#abstract)
2. [Introduction](#introduction)
3. [Objectives](#objectives)
4. [System Architecture](#system-architecture)
5. [Technology Stack](#technology-stack)
6. [Module Descriptions](#module-descriptions)
7. [Database Design](#database-design)
8. [API Endpoints](#api-endpoints)
9. [Role-Based Access Control](#role-based-access-control)
10. [Payment Integration](#payment-integration)
11. [Security Features](#security-features)
12. [Frontend Pages & Routes](#frontend-pages--routes)
13. [Project Structure](#project-structure)
14. [Conclusion](#conclusion)

---

## Abstract

The **College Event Management System** is a full-stack web application designed to streamline the planning, promotion, registration, and management of college events. The platform serves four distinct user roles — **Students**, **Event Incharges**, **Placement Officers**, and **Administrators** — each with a dedicated interface and access level. The system integrates **Razorpay** for real-time payment processing, supports secure JWT-based authentication, and provides a role-aware admin panel for holistic event oversight. A dedicated **Placement Drive** module enables companies to post campus recruitment drives, and students can directly apply through the portal.

---

## Introduction

Managing college events manually through paper forms and spreadsheets is error-prone, time-consuming, and opaque. This system replaces those outdated processes with a centralized, digital solution. Faculty members (incharges) can submit events for admin approval, students can browse and register for events (with online payment for paid events), and the admin can monitor the entire ecosystem through a statistics dashboard.

The project was developed as a MERN-based (MongoDB, Express, React, Node.js) full-stack application with a Vite-powered React frontend and a secure Node.js/Express backend API.

---

## Objectives

- Provide a unified platform for college event discovery and registration.
- Enable event incharges to create and manage events independently.
- Implement an approval workflow so that events go live only after admin review.
- Integrate **Razorpay** for handling paid event registrations securely.
- Provide a **Placement Drive** portal where placement officers post company visits and students can apply.
- Enforce **Role-Based Access Control (RBAC)** so that each user sees only relevant features.
- Give administrators full visibility into users, events, payments, and companies.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React + Vite)                 │
│  Pages: Home | Events | Placement | Auth | Dashboards        │
│  Context: AuthContext  |  Routing: React Router v7           │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP (Axios)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   SERVER (Node.js + Express)                 │
│  Routes → Controllers → Models                               │
│  Middleware: authMiddleware | roleMiddleware                  │
│  Utils: sendEmail (Nodemailer)                               │
└──────────────────────────────┬──────────────────────────────┘
                               │ Mongoose ODM
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               DATABASE (MongoDB Atlas)                       │
│  Collections: Users | Events | Registrations                 │
│               Payments | Companies                           │
└─────────────────────────────────────────────────────────────┘
                               │
                         ┌─────┴─────┐
                         │ Razorpay  │  (Payment Gateway)
                         └───────────┘
```

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19.x | UI library |
| Vite | 8.x | Build tool & dev server |
| React Router DOM | 7.x | Client-side routing |
| Axios | 1.x | HTTP client for API calls |
| Chart.js + react-chartjs-2 | 4.x / 5.x | Dashboard analytics charts |
| Lucide React | 1.x | Icon library |
| React Hot Toast | 2.x | Notification toasts |
| Vanilla CSS | — | Styling (custom design system) |

### Backend

| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JSON Web Tokens (JWT) | Authentication |
| bcryptjs | Password hashing |
| Razorpay SDK | Payment gateway integration |
| Nodemailer | Email confirmation |
| Helmet | HTTP security headers |
| Morgan | Request logging |
| CORS | Cross-Origin resource sharing |
| dotenv | Environment variable management |

---

## Module Descriptions

### 1. Authentication Module
- User **registration** with fields: name, email, password, role, department, year, registration number, phone.
- **Login** with JWT token generation (configurable expiry via `JWT_EXPIRE`).
- **Profile view & update** for authenticated users.
- Passwords are hashed using `bcrypt` with a salt factor of 12 before storage.
- Suspended users (`isActive: false`) are blocked from logging in with a clear error message.

### 2. Event Management Module
- **Incharges** create events with: title, description, category, venue, dates, registration deadline, fee, max participants, tags, highlights, and contact info.
- Events start with `status: 'pending'` and require **admin approval** before becoming visible to students.
- Supports 7 event categories: `technical`, `cultural`, `sports`, `workshop`, `seminar`, `hackathon`, `other`.
- Incharges can view and manage their own events; admins can manage all events.
- Full **pagination and filtering** by category, fee type (free/paid), and keyword search.

### 3. Registration Module
- Students register for approved events within the registration deadline.
- Free events: direct registration; Paid events: Razorpay payment workflow.
- Prevents duplicate registrations via unique constraint on `{event, participant}`.
- Auto-increments `currentParticipants` upon successful registration.
- **Incharges** can view the list of registered participants for their events.

### 4. Payment Module (Razorpay)
- Creates a Razorpay order linked to the event fee.
- **HMAC-SHA256 signature verification** ensures payment authenticity.
- On success: registration record is created, `currentParticipants` is incremented, and a **confirmation email** is sent to the student.
- Payment history is accessible by the student under their dashboard.

### 5. Placement Drive Module
- **Placement Officers** post company drives with: name, description, visit date, application deadline, job roles, salary package, eligibility criteria (CGPA, backlogs, branches, years), drive stages, and registration link.
- Students can browse drives filtered by status, branch, or year.
- One-click **Apply** tracks applicants directly in the Company document.
- Placement officers have a **Placement Dashboard** for full CRUD management.

### 6. Admin Panel Module
- **Dashboard statistics**: total users, approved events, upcoming events, total registrations, pending approvals, total revenue, total companies.
- **Event approval/rejection workflow** with optional rejection reason.
- **User management**: view all users by role, activate/suspend accounts.
- **Payment records**: view all successful payments with user and event details.

---

## Database Design

### Users Collection

| Field | Type | Description |
|---|---|---|
| `name` | String | Full name |
| `email` | String | Unique email (login) |
| `password` | String | Hashed (bcrypt, select: false) |
| `role` | Enum | `student`, `incharge`, `placement_officer`, `admin` |
| `department` | String | Academic department |
| `year` | Number | Study year (1–4) |
| `registrationNo` | String | College registration number |
| `phone` | String | Contact number |
| `avatar` | String | Profile image URL |
| `isActive` | Boolean | Account active status |
| `timestamps` | — | `createdAt`, `updatedAt` |

### Events Collection

| Field | Type | Description |
|---|---|---|
| `title` | String | Event name |
| `description` | String | Full description |
| `shortDescription` | String | Max 200 chars teaser |
| `category` | Enum | Event category |
| `banner` | String | Banner image URL |
| `venue` | String | Location |
| `date` / `endDate` | Date | Event schedule |
| `registrationDeadline` | Date | Cut-off for registration |
| `fee` | Number | 0 for free, >0 for paid |
| `maxParticipants` | Number | Seat cap |
| `currentParticipants` | Number | Live count |
| `createdBy` | ObjectId → User | Incharge reference |
| `status` | Enum | `pending`, `approved`, `rejected`, `completed` |
| `rejectionReason` | String | Set by admin on rejection |
| `tags` / `highlights` | [String] | Metadata tags |
| `contactEmail` / `contactPhone` | String | Organiser contact |

### Payments Collection

| Field | Type | Description |
|---|---|---|
| `registration` | ObjectId → Registration | Linked registration |
| `user` | ObjectId → User | Paying student |
| `event` | ObjectId → Event | Target event |
| `razorpayOrderId` | String | Razorpay order ID |
| `razorpayPaymentId` | String | Razorpay payment ID |
| `razorpaySignature` | String | HMAC signature |
| `amount` | Number | Amount in INR |
| `currency` | String | Default `INR` |
| `status` | Enum | `created`, `paid`, `failed` |

### Companies Collection

| Field | Type | Description |
|---|---|---|
| `name` | String | Company name |
| `logo` | String | Logo URL |
| `description` | String | About the company |
| `visitDate` | Date | Campus visit date |
| `applicationDeadline` | Date | Application cutoff |
| `jobRoles` | [String] | Open positions |
| `package` | String | Salary range (e.g. "6–12 LPA") |
| `eligibility` | Object | `minCGPA`, `maxBacklogs`, `branches`, `years` |
| `driveStages` | [String] | Rounds of selection |
| `registrationLink` | String | External apply URL |
| `postedBy` | ObjectId → User | Placement officer |
| `status` | Enum | `upcoming`, `ongoing`, `completed` |
| `applicants` | [ObjectId → User] | Applied students |

---

## API Endpoints

### Auth Routes — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login & get JWT token |
| GET | `/profile` | Protected | Get own profile |
| PUT | `/profile` | Protected | Update own profile |

### Event Routes — `/api/events`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | Get all approved events (filter, paginate) |
| GET | `/:id` | Public | Get single event detail |
| POST | `/` | Incharge/Admin | Create new event |
| PUT | `/:id` | Incharge/Admin | Update event |
| DELETE | `/:id` | Incharge/Admin | Delete event |
| GET | `/my` | Incharge | Get own events |

### Registration Routes — `/api/registrations`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Student | Register for an event |
| GET | `/my` | Student | View own registrations |
| GET | `/event/:id` | Incharge/Admin | View event registrations |

### Payment Routes — `/api/payment`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/create-order` | Student | Create Razorpay order |
| POST | `/verify` | Student | Verify payment & confirm registration |
| GET | `/history` | Student | View payment history |

### Placement Routes — `/api/placement`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/companies` | Public | List company drives (with filters) |
| GET | `/companies/:id` | Public | Get company drive detail |
| POST | `/companies` | Placement Officer | Create company drive |
| PUT | `/companies/:id` | Placement Officer | Update drive |
| DELETE | `/companies/:id` | Placement Officer | Delete drive |
| POST | `/companies/:id/apply` | Student | Apply for drive |

### Admin Routes — `/api/admin`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/dashboard` | Admin | Get dashboard statistics |
| GET | `/events` | Admin | Get all events (any status) |
| PUT | `/events/:id/approve` | Admin | Approve an event |
| PUT | `/events/:id/reject` | Admin | Reject an event with reason |
| GET | `/users` | Admin | Get all users (filter by role) |
| PUT | `/users/:id/toggle` | Admin | Toggle user active status |
| GET | `/payments` | Admin | Get all successful payments |

---

## Role-Based Access Control

The system enforces RBAC at two levels:

**Backend** — `authMiddleware.js` verifies the JWT token and attaches `req.user`. `roleMiddleware.js` (`authorize(...roles)`) restricts route access to specified roles and returns `403 Forbidden` for unauthorized attempts.

**Frontend** — `ProtectedRoute` in `App.jsx` checks `user.role` against allowed roles. Unauthenticated users are redirected to `/login`; unauthorized roles are redirected to home `/`.

| Role | Accessible Areas |
|---|---|
| `student` | Home, Events, Placement, Student Dashboard |
| `incharge` | Home, Events, Incharge Dashboard, Create Event, Event Registrations |
| `placement_officer` | Home, Events, Placement, Placement Dashboard |
| `admin` | All areas + Admin Panel |

After login, users are automatically redirected to their role-specific dashboard via `PublicRoute`.

---

## Payment Integration

The payment workflow uses **Razorpay** and follows a two-step process:

```
Student clicks "Pay & Register"
        │
        ▼
POST /api/payment/create-order
  └─ Validates event, deadline, seat availability, duplicate check
  └─ Creates Razorpay order (amount in paise)
  └─ Saves pending Payment record
  └─ Returns { orderId, key, amount }
        │
        ▼
Frontend opens Razorpay Checkout modal
        │
        ▼
POST /api/payment/verify
  └─ Verifies HMAC-SHA256 signature
  └─ Creates Registration record (paymentStatus: 'paid')
  └─ Updates Payment record (status: 'paid')
  └─ Increments event.currentParticipants
  └─ Sends email confirmation via Nodemailer
        │
        ▼
Student receives ticket ID & confirmation email
```

---

## Security Features

| Feature | Implementation |
|---|---|
| Password Hashing | bcrypt with salt factor 12 |
| Authentication | JWT (JSON Web Tokens) with configurable expiry |
| Authorization | Role-based middleware on every protected route |
| Payment Verification | HMAC-SHA256 signature validation (Razorpay) |
| HTTP Security Headers | Helmet.js middleware |
| CORS Policy | Restricted to configured `CLIENT_URL` origin |
| Account Suspension | `isActive` flag blocks login for suspended accounts |
| Admin Protection | Admin accounts cannot be suspended via the toggle API |
| Input Validation | Mongoose schema validators with required/min/max/enum constraints |

---

## Frontend Pages & Routes

| Route | Component | Access | Description |
|---|---|---|---|
| `/` | Home | Public | Landing page |
| `/events` | Events | Public | Browse & filter events |
| `/events/:id` | EventDetail | Public | Event detail + registration |
| `/placement` | Placement | Public | Browse company drives |
| `/placement/:id` | CompanyDetail | Public | Drive details + apply |
| `/login` | Login | Guest only | Login form |
| `/register` | Register | Guest only | Registration form |
| `/dashboard` | StudentDashboard | Student | My registrations & payments |
| `/incharge` | InchargeDashboard | Incharge/Admin | My events overview |
| `/incharge/create` | CreateEvent | Incharge/Admin | Event creation form |
| `/incharge/events/:id/registrations` | EventRegistrations | Incharge/Admin | View participant list |
| `/admin` | AdminPanel | Admin | Full system management panel |
| `/placement/manage` | PlacementDashboard | Placement Officer/Admin | Manage company drives |

---

## Project Structure

```
College Event Management System/
├── client/                         # Frontend (React + Vite)
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx                # App entry point
│       ├── App.jsx                 # Routes & Auth wrappers
│       ├── App.css / index.css     # Global styles
│       ├── context/
│       │   └── AuthContext.jsx     # Global auth state
│       ├── components/
│       │   ├── Navbar/
│       │   └── Loader/
│       ├── pages/
│       │   ├── Home/
│       │   ├── Auth/               # Login, Register
│       │   ├── Events/             # Events list + detail
│       │   ├── Dashboard/          # Student dashboard
│       │   ├── Incharge/           # Dashboard, CreateEvent, Registrations
│       │   ├── Admin/              # Admin panel
│       │   └── Placement/          # Placement listing, detail, dashboard
│       └── utils/                  # Axios instance, helpers
│
└── server/                         # Backend (Node.js + Express)
    ├── server.js                   # App entry point
    ├── package.json
    ├── .env                        # Environment variables
    ├── controllers/
    │   ├── authController.js
    │   ├── eventController.js
    │   ├── registrationController.js
    │   ├── paymentController.js
    │   ├── placementController.js
    │   └── adminController.js
    ├── models/
    │   ├── User.js
    │   ├── Event.js
    │   ├── Registration.js
    │   ├── Payment.js
    │   └── Company.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── eventRoutes.js
    │   ├── registrationRoutes.js
    │   ├── paymentRoutes.js
    │   ├── placementRoutes.js
    │   └── adminRoutes.js
    ├── middleware/
    │   ├── authMiddleware.js
    │   └── roleMiddleware.js
    └── utils/
        └── sendEmail.js            # Nodemailer email utility
```

---

## Conclusion

The **College Event Management System** is a complete, production-ready full-stack application that addresses the real-world need for digital event management in academic institutions. Key highlights:

- ✅ **Secure Authentication** with JWT and bcrypt password hashing
- ✅ **Multi-Role System** with four distinct user types and access levels
- ✅ **Event Approval Workflow** ensuring quality control by admins
- ✅ **Razorpay Payment Integration** with cryptographic signature verification
- ✅ **Email Notifications** for registration confirmations
- ✅ **Placement Drive Portal** bridging students and recruiters
- ✅ **Admin Analytics Dashboard** with revenue tracking and user management
- ✅ **Modern React Frontend** with role-aware routing and real-time feedback via toasts

The system is scalable, modular, and extensible — additional modules such as event certificates, QR-based attendance, or push notifications can be integrated with minimal architectural changes.

---

*Report generated for: College Event Management System | Stack: MERN (MongoDB, Express, React, Node.js) | Payment: Razorpay*
