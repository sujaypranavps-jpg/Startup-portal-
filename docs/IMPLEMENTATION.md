# Implementation Overview

This document maps the required features to the current codebase, including API routes, database models, frontend components, auth flow, Postman testing, and security controls.

## Backend API Route Structure

Base path: `/api`

Auth (`/api/auth`)
- `POST /register` Create user account (role: admin|startup|mentor|investor)
- `POST /login` Authenticate and return access + refresh tokens
- `POST /refresh` Rotate refresh token and return new tokens
- `POST /logout` Revoke refresh token
- `POST /forgot-password` Send a placeholder reset email
- `GET /me` Return current user profile (protected)

Ideas (`/api/ideas`)
- `GET /` List ideas (investor sees only approved, others can filter)
- `POST /` Submit idea (startup only, supports `pitchDeck` upload)
- `GET /my` List current startup user's ideas
- `PATCH /my/:id` Update idea (startup only, blocked if approved)
- `DELETE /my/:id` Delete idea (startup only)
- `POST /:id/review` Review and approve/reject idea (mentor/admin)
- `GET /dashboard/startup` Startup dashboard metrics
- `GET /dashboard/mentor` Mentor review queue
- `GET /dashboard/admin` Admin analytics

Investments (`/api/investments`)
- `POST /idea/:ideaId` Create investment request (investor only)
- `GET /my` List investor's requests
- `GET /startup` List requests for startup's ideas
- `PATCH /:id/status` Accept or reject investment request (startup only)

Notifications (`/api/notifications`)
- `GET /` List notifications
- `PATCH /:id/read` Mark notification read
- `PATCH /read-all` Mark all notifications read

Admin (`/api/admin`)
- `GET /users` List users
- `PATCH /users/:id/role` Update user role
- `GET /export/ideas` Download idea export (CSV)

## MongoDB Schema Models

User (`backend/src/models/User.js`)
- `name`, `email`, `password` (hashed), `role`, `profilePic`

Idea (`backend/src/models/Idea.js`)
- `title`, `description`, `industry`, `stage`, `teamSize`, `fundingNeeded`, `pitchDeck`, `status`, `rating`, `feedback`, `userId`

InvestmentRequest (`backend/src/models/InvestmentRequest.js`)
- `ideaId`, `investorId`, `amount`, `partnershipType`, `note`, `status`

Additional models used in workflows
- `Review` (idea review + rating)
- `Notification` (in-app + email)
- `RefreshToken` (JWT rotation)

## React Frontend Components

App bootstrap and routing
- `frontend/src/main.jsx` mounts the app
- `frontend/src/app/providers.jsx` sets QueryClient + AuthContext + Router
- `frontend/src/app/router.jsx` defines public + protected routes by role

Auth
- `frontend/src/pages/auth/LoginPage.jsx`
- `frontend/src/pages/auth/RegisterPage.jsx`
- `frontend/src/pages/auth/ForgotPasswordPage.jsx`

Startup user
- `frontend/src/pages/startup/SubmitIdeaPage.jsx`
- `frontend/src/pages/startup/MyIdeasPage.jsx`
- `frontend/src/pages/startup/StartupInvestorRequestsPage.jsx`

Mentor / Admin
- `frontend/src/pages/mentor/MentorIdeasPage.jsx`
- `frontend/src/pages/admin/AdminUsersPage.jsx`
- `frontend/src/pages/admin/AdminSettingsPage.jsx`

Investor
- `frontend/src/pages/investor/InvestorInterestsPage.jsx`

Shared
- `frontend/src/pages/dashboard/RoleDashboardPage.jsx`
- `frontend/src/pages/landing/LandingPage.jsx`
- `frontend/src/pages/profile/NotificationsPage.jsx`

API layer
- `frontend/src/api/client.js` axios instance + JWT refresh
- `frontend/src/api/endpoints.js` typed endpoint helpers

## Authentication Flow (JWT)

1. Register or login via `POST /api/auth/register` or `POST /api/auth/login`
2. API returns `accessToken` and `refreshToken`
3. Frontend stores tokens in local storage via `AuthContext`
4. Axios interceptor attaches `Authorization: Bearer <accessToken>`
5. On 401, interceptor calls `POST /api/auth/refresh` and retries original request
6. Logout revokes refresh token via `POST /api/auth/logout`

## Postman Testing

A Postman collection is provided:
- `docs/postman/Startup-Idea-Portal.postman_collection.json`

Variables
- `baseUrl` -> `http://localhost:5000/api`
- `accessToken` -> set after login
- `ideaId` -> set from an existing idea

Example usage
1. Run "Auth Login" to get access token
2. Set `accessToken` variable
3. Run "List Ideas"
4. Run "Create Investment" with a valid `ideaId`

## Security and Error Handling

Security
- `helmet` for secure HTTP headers
- `express-rate-limit` for basic abuse protection
- JWT access tokens + refresh tokens
- Role-based access control via `allowRoles`
- Input validation via `express-validator`

Error handling
- Central error middleware with typed HTTP status codes
- Consistent error responses for not found and validation errors
- Basic logging via `morgan`

Notes
- Production deployment should enforce HTTPS and replace secrets in `.env`
- Configure CORS `CLIENT_URL` to match frontend domain
