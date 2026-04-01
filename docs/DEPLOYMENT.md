# Deployment Guide

## Local Development
1. Copy `backend/.env.example` to `backend/.env` and configure values.
2. Copy `frontend/.env.example` to `frontend/.env`.
3. Install dependencies from repo root: `npm install`.
4. Run backend + frontend: `npm run dev`.
5. Seed demo data: `npm run seed`.

## Docker
1. Configure `backend/.env`.
2. Run: `docker compose up --build`.
3. Frontend: `http://localhost:5173`, Backend: `http://localhost:5000/api`.

## Vercel + Railway/Render
1. Deploy frontend (`frontend`) to Vercel.
2. Deploy backend (`backend`) to Railway or Render.
3. Add backend env values from `backend/.env.example`.
4. Set `VITE_API_URL` and `VITE_SOCKET_URL` in Vercel to backend URLs.
5. Configure backend `CLIENT_URL` to Vercel domain.
