# Video Library MVP


A small video-library MVP with a Node.js/TypeScript backend and a React Native (Expo) mobile app frontend.


## Requirements covered
- Browse all episodes (scroll)
- Filter: show only **unwatched**
- Sorting by multiple parameters
- Hard-coded data (in-memory)
- Production-minded code quality (TypeScript, validation, pagination, CORS, error handling)


## Quick Start


### 1) Backend
```bash
cd backend
npm i
npm run dev # starts on http://localhost:4000
```
API:

GET /health – liveness check

GET /episodes?sortBy=airDate|title|seriesTitle|season|episode&order=asc|desc&watched=all|true|false&page=1&pageSize=20&search=

PATCH /episodes/:id/watched body: { "watched": boolean }

### 2) Frontend (Expo)
```bash
cd ../frontend
npm i
npm run start # launches Expo dev tools
```
otes

Data is in-memory only (resets on server restart).

The mobile app caches watched state locally and syncs best-effort with the server.