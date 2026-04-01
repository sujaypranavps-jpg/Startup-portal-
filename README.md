# Startup Idea Management Portal (MERN)

Production-style full-stack portal for startup idea submission, review, approval, and investment workflows.

## Stack
- MongoDB + Mongoose
- Express.js + Node.js
- React.js + Vite + Tailwind CSS
- JWT auth (access + refresh)
- Socket.io real-time notifications
- Nodemailer email notifications
- Multer + Cloudinary pitch deck upload

## Roles
- Admin: user management, analytics, full review control
- Startup User: submit/edit/delete ideas, dashboard, investor request handling
- Mentor: review queue, approve/reject, ratings and feedback
- Investor: browse approved ideas, submit and track investment interests

## Project Structure
```text
.
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middlewares
│   │   ├── models
│   │   ├── routes
│   │   ├── seed
│   │   ├── services
│   │   ├── sockets
│   │   ├── utils
│   │   ├── validators
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── Dockerfile
├── frontend
│   ├── public
│   ├── src
│   │   ├── api
│   │   ├── app
│   │   ├── components
│   │   ├── context
│   │   ├── hooks
│   │   └── pages
│   ├── .env.example
│   └── Dockerfile
├── docs
│   ├── DEPLOYMENT.md
│   └── postman
└── docker-compose.yml
```

## Quick Start
1. Create env files:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
2. Install dependencies (root):
```bash
npm install
```
3. Run frontend + backend (root):
```bash
npm run dev
```
4. Seed sample data:
```bash
npm run seed
```

## Run Separately
Backend:
```bash
cd backend
npm install
npm run dev
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

## Demo Seed Users
- Admin: `admin@portal.com` / `Password123!`
- Startup: `startup1@portal.com` / `Password123!`
- Mentor: `mentor@portal.com` / `Password123!`
- Investor: `investor1@portal.com` / `Password123!`

## API Entry Points
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/ideas`
- `POST /api/ideas` (startup)
- `POST /api/ideas/:id/review` (mentor/admin)
- `POST /api/investments/idea/:ideaId` (investor)
- `PATCH /api/investments/:id/status` (startup)
- `GET /api/notifications`
- `GET /api/admin/users` (admin)

Swagger UI: `GET /api/docs`

Postman collection: `docs/postman/Startup-Idea-Portal.postman_collection.json`

## UI/UX Highlights
- Professional landing page with login and signup CTAs
- Responsive role-based dashboard layout
- Form validation + upload progress
- Toast and real-time notification updates
- Consistent primary color theme `#6366F1`

## Docker
```bash
docker compose up --build
```

## Environment Setup
See: `docs/ENVIRONMENT.md` for MongoDB Atlas and local configuration.

## Deployment
See: `docs/DEPLOYMENT.md`
- Frontend: Vercel
- Backend: Railway or Render
- Database: MongoDB Atlas

## Implementation Notes
See: `docs/IMPLEMENTATION.md` for routes, models, frontend components, auth flow, Postman usage, and security notes.

## Notes
- For production, replace all JWT secrets, enforce HTTPS, and configure SMTP + Cloudinary.
- Configure CORS `CLIENT_URL` for deployed frontend domain.
- Add CI (lint/test/build) before production rollout.
