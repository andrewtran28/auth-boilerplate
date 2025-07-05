# auth-boilerplate
A practical user authentication boilerplate that is intended to be minimalistic and re-usable for other full-stack projects. Styling of the boilerplate is kept to a minimum to emphasize its scalability and pure functional purpose.

![image](https://github.com/user-attachments/assets/9ee1daaa-d760-4c64-b6d7-0f42d66bbb83)

## Authentication Strategy
This project implements a robust full-stack JWT-based authentication system using HTTP-only cookies for secure session management. It is designed for use in full-stack applications and prioritizes security, user experience, and flexibility across both development and production environments.

### 1. Login Flow
- Users submit their credentials to the Express backend.
- Upon successful login, a short-lived Access Token (30 minutes) and a long-lived Refresh Token (7 days) are issued as secure, HTTP-only cookies.
- These tokens are not accessible via JavaScript (`httpOnly: true`) and are automatically included in future HTTP requests by the browser.

### 2. Protected Routes
- Backend routes use a custom `authenticateToken` middleware that reads the Access Token from the cookie, verifies it using `jsonwebtoken`, and attaches the authenticated user to `req.user`.
- On the frontend, protected pages are wrapped in a `ProtectedRoute` component that uses the `useAuth` hook (from `AuthContext`) to check if a user is authenticated and access user info such as roles or permissions. If unauthenticated, users are redirected to the login page.

### 3. Token Refresh Flow
- When the Access Token expires, the frontend can make a silent request to a `/api/auth/refresh` route to obtain a new Access Token, as long as the Refresh Token is still valid.
- If the Refresh Token is missing or expired, the user must log in again.
- Neither token is stored in `localStorage` or `sessionStorage`; both are managed via secure HTTP-only cookies.

### 4. Additional Features
- **Brute-force Protection:** After a configurable number of failed login attempts, the account is temporarily locked (e.g., 15 minutes). Lock resets on successful login.
- **Secure Password Reset:**
  - Users can request a password reset by submitting their username or email.
  - If an account is found, a 24-hour time-limited reset link is emailed using [Resend](https://resend.com/). Previously used AWS SES, however Resend is a free-alternative.
  - Anti-enumeration measures: The frontend always shows a generic success message (e.g., “If the user exists, an email has been sent.”).

## Prisma Schema (User Model)
This boilerplate uses [Prisma ORM](https://www.prisma.io/) to interact with a PostgreSQL database. The User model is intentionally minimal, providing just enough structure for authentication, role-based access control, password reset, and security features such as brute-force protection.

```prisma
model User {
  id                String     @id @default(uuid()) @db.Uuid
  username          String     @unique @db.VarChar(30)
  firstName         String     @db.VarChar(30)
  lastName          String     @db.VarChar(30)
  password          String     @db.VarChar(100)
  email             String     @unique @db.VarChar(254)
  isAdmin           Boolean    @default(false)
  createdAt         DateTime   @default(now())
  loginAttempts     Int        @default(0)
  lockOutUntil      DateTime?
  resetToken        String?    @db.VarChar(255)
  resetTokenExpiry  DateTime?

  @@map("users")
}
```

## Technology Used
- **Frontend:** React + Vite, TypeScript, HTML, CSS
- **Backend:** Node.js + Express, Prisma ORM, PostgreSQL
- **Authentication:** JWT (access + refresh tokens), HTTP-only cookies
- **Email API:** Resend (formerly AWS SES)
- **Hosting:** Netlify (frontend), Render (backend), Neon (PostgreSQL database)
