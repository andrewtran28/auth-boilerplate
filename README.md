# auth-boilerplate
A practical user authentication boilerplate that is intended to be minimalistic and re-usable for other full-stack projects. Styling of the boilerplate is kept to a minimum to emphasize its scalability and pure functional purpose.

## Authentication Strategy
This project implements a robust full-stack JWT-based authentication system using HTTP-only cookies for secure session management. It is designed for use in full-stack applications and prioritizes security, user experience, and flexibility across both development and production environments.

#### 1. Login Flow
- Users log in with their credentials to the Express back-end. If valid, a JWT acces token is generated contianing the user's ID and username. This token is set in a secure, HTTP-only cookie which prevents access by JavaScript and automatically attaches to requests (i.e., cookie-based auth).
#### 2. Protected Routes
- Back-end routes use a custom authenticationToken middleware that reads the JWT from the HTTP-only cookie (i.e., Access Token), verifies and decodes it using jsonwebtoken, and attaches the authenticated user to req.user for downstream handlers. Protected routes such as the "User Page" are only displayed if the user is logged in and will only see their information.
#### 3. Token Refresh Flow
- The auth boilerplate utilizes a dual-cookie strategy: A short-lived (30min) Access Token, and a long-lived (7 days) Refresh Token. The Access Token is attached to all HTTP requests as an HTTP-only cookie, while the Refresh Token is used to obtain new Access Tokens without requiring to log in again.
- When the Access Token expires, the front-end can silently call the "refresh" route to obtain a new Access Token --only if the Refresh Token is still valid. If the Refresh Token is missing or expired, the user muust log in again.
- Refresh Tokens are never exposed to JavaScript as they are not stored in localStorage or sessionStorage, but rather HTTP-only cookies.
#### 4. Additional Features
- Brute-force Login Protection: Locks accounts after a certain number of failed attempts for 15 minutes. Automatically resets on successful login.
- Password Reset With Email: Users can request a password reset via username or email. Secure time-limited token (UUIDv4) is emailed using Resend that is only valid for 24 hours.
  - Anti-user enumeration response hides existence of accounts ("If the user exists, an email has been sent").

## Technology Used
- React + Vite
- TypeScript
- HTML + CSS
- Node.js + Express
- PostgreSQL
- Prisma ORM
- Resend (Email API)
  - AWS SES (Email API; Later replaced with Resend as a free alternative)
- Netlify (Client-side deployment)
- Render (Back-end web service)
- Neon (Database hosting)
