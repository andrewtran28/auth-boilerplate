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
- Frontend pages like the "User Page" are protected using a `ProtectedRoute` component, which ensures only authenticated users can access them.

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

## Technology Used
- **Frontend:** React + Vite, TypeScript, HTML, CSS
- **Backend:** Node.js + Express, Prisma ORM, PostgreSQL
- **Authentication:** JWT (access + refresh tokens), HTTP-only cookies
- **Email API:** Resend (formerly AWS SES)
- **Hosting:** Netlify (frontend), Render (backend), Neon (PostgreSQL database)
