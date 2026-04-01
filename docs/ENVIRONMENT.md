# Environment Setup

This project separates environment configuration by service:
- Backend: `backend/.env`
- Frontend: `frontend/.env`

## Backend (MongoDB Local)
Use local MongoDB:
```
MONGO_LOCAL_URI=mongodb://127.0.0.1:27017/startup_portal
```

## Backend (MongoDB Atlas)
Replace placeholders with your Atlas credentials and cluster info:
```
MONGO_ATLAS_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/startup_portal?retryWrites=true&w=majority&appName=<appName>
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/startup_portal?retryWrites=true&w=majority&appName=<appName>
```

## Frontend
Point the frontend to the backend API:
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Data Migration (Local -> Atlas)
Run the migration script from the backend workspace:
```
npm run migrate:atlas -w backend
```

Set `DROP_TARGET=true` before running if you want Atlas collections to be cleared first.

## Notes
- After changing `.env`, restart the backend server.
- Never commit real secrets to git.
