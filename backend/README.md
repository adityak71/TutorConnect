# TutorConnect — Backend API

## Member 1: Authentication & User Management
This module covers everything assigned to Member 1 of the TutorConnect project:
JWT authentication, registration/login/logout, password reset, role-based authorization, and profile management for Students, Tutors, and Admins.

## Member 2: Session Booking & Scheduling
This module covers everything assigned to Member 2 of the TutorConnect project:
Tutor availability, session booking, double-booking prevention, and calendar history.

## Tech Stack
- **Node.js + Express** — REST API
- **MongoDB + Mongoose** — database (Users, TutorProfiles, StudentProfiles)
- **JWT (jsonwebtoken)** — authentication
- **bcryptjs** — password hashing
- **multer** — profile picture / document uploads
- **nodemailer** — email verification & password reset emails (optional feature)
- **swagger-ui-express / swagger-jsdoc** — auto-generated interactive API documentation
## Project Structure
```
tutorconnect-auth/
├── src/
│   ├── app.js                 # app entry point
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── auth/
│   │   ├── authController.js  # register, login, logout, password reset, verify email
│   │   └── authRoutes.js
│   ├── users/
│   │   ├── userController.js  # profile get/update, picture/doc upload, admin controls
│   │   ├── userRoutes.js
│   │   ├── User.js            # core auth collection (email, password, role)
│   │   └── StudentProfile.js  # grade level, interests, learning goals
│   ├── tutors/
│   │   ├── tutorController.js # public tutor discovery
│   │   ├── tutorRoutes.js
│   │   └── TutorProfile.js    # bio, subjects, qualifications, rate, docs
│   ├── availability/
│   │   ├── availabilityController.js # manage recurring schedules
│   │   ├── availabilityRoutes.js
│   │   └── Availability.js    # dayOfWeek, startTime, endTime
│   ├── sessions/
│   │   ├── sessionController.js # booking, rescheduling, cancel, history
│   │   ├── sessionRoutes.js
│   │   └── Session.js         # timestamps, status, notes
│   ├── middleware/
│   │   ├── auth.js            # protect (JWT check) + authorize (role check)
│   │   └── upload.js          # multer config for images/documents
│   └── utils/
│       ├── generateToken.js   # JWT signing + cookie response
│       └── sendEmail.js       # nodemailer wrapper
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```
   At minimum set `MONGO_URI` and `JWT_SECRET`. SMTP values are only needed
   if you want verification/reset emails to actually send — the app still
   works without them (registration/login won't fail, it just logs a warning).

3. Start MongoDB locally (or use MongoDB Atlas and paste the connection
   string into `MONGO_URI`).

4. Run the server:
   ```bash
   npm run dev     # with nodemon, auto-restart
   # or
   npm start
   ```

Server runs on `http://localhost:5000` by default.

## API Endpoints

### Member 1 Endpoints

#### Auth (`/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register as Student or Tutor. Body: `{ name, email, password, role, hourlyRate? }` |
| POST | `/auth/login` | Public | Login. Body: `{ email, password }`. Returns JWT + sets cookie. |
| POST | `/auth/logout` | Private | Clears auth cookie. |
| GET | `/auth/verify-email/:token` | Public | Confirms email using the token sent by email. |
| POST | `/auth/forgot-password` | Public | Body: `{ email }`. Sends reset link. |
| PUT | `/auth/reset-password/:token` | Public | Body: `{ password }`. Sets new password. |

#### Users (`/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/users/profile` | Private | Get logged-in user's profile (User + role-specific profile). |
| PUT | `/users/profile` | Private | Update name + role-specific fields (bio, subjects, rate, etc.). |
| POST | `/users/profile/picture` | Private | Upload profile picture. Form field: `picture`. |
| POST | `/users/profile/documents` | Private (Tutor) | Upload qualification/ID document. Form field: `document`. |
| GET | `/users/:id` | Private (Admin) | Fetch any user by ID. |
| PUT | `/users/:id/status` | Private (Admin) | Activate/deactivate a user. Body: `{ isActive }`. |

#### Tutors (`/tutors`) — public discovery, used by other members' modules too
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/tutors` | Public | List verified tutors. Query: `subject, minRate, maxRate, search, page, limit`. |
| GET | `/tutors/:id` | Public | Get a single tutor's public profile. |

### Member 2 Endpoints

#### Availability (`/availability`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/availability` | Private (Tutor) | Add a recurring availability block. Body: `{ dayOfWeek, startTime, endTime }`. |
| GET | `/availability/:tutorId` | Public | Get all availability slots for a specific tutor. |

#### Sessions (`/sessions`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/sessions/book` | Private (Student) | Book a tutoring session. Checks availability & overlap. Body: `{ tutorId, startTime, endTime, notes }`. |
| PUT | `/sessions/:id/reschedule` | Private | Reschedule an existing session. Checks availability & overlap. Body: `{ startTime, endTime }`. |
| DELETE | `/sessions/:id` | Private | Cancel a session (sets status to 'Cancelled'). |
| GET | `/sessions/student/:id` | Private | Get all sessions for a specific student (Learning History). |
| GET | `/sessions/tutor/:id` | Private | Get all sessions for a specific tutor. |

## Interactive API Docs (Swagger)
When the server is running, visit **`http://localhost:5000/api-docs`** to view and interact with the Swagger documentation for the Availability and Sessions modules.

## Authentication Flow
1. `POST /auth/register` creates a `User` plus a matching `TutorProfile` or
   `StudentProfile`, and returns a JWT (also set as an httpOnly cookie).
2. Protected routes send the JWT via `Authorization: Bearer <token>` header
   (or rely on the cookie).
3. `src/middleware/auth.js`'s `protect` verifies the token and loads `req.user`.
4. `authorize('Admin')` / `authorize('Tutor')` etc. restricts routes by role.

## Notes for Integrating with Other Members
- Other modules (scheduling, payments, progress tracking) should call
  `protect` from `src/middleware/auth.js` to identify the logged-in user and
  `req.user.role` / `req.user._id` to scope data.
- Tutor and Student IDs referenced elsewhere should point to `User._id`
  (not the profile document ID), except where a tutor's public listing page
  needs `TutorProfile._id` (used in `GET /tutors/:id`).
