# Warble

A real-time geo-social messaging app. Drop messages at your location, see what people are saying nearby.

**Live demo:** [warble-geosocial-app.vercel.app](https://warble-geosocial-app.vercel.app)

---

## What it does

- Register and log in with a secure account
- Leave a geo-tagged message at your current GPS location
- Browse a live map of nearby messages within 5km
- New posts appear on the map in real time without refreshing

## Tech stack

**Frontend** — React, Vite, Leaflet, Tailwind CSS, SignalR client — deployed on Vercel

**Backend** — .NET 9, ASP.NET Core, Dapper, SignalR — deployed on Railway

**Database** — PostgreSQL with PostGIS spatial extension — hosted on Neon

## Architecture

The frontend and backend are fully decoupled — they communicate only through a REST API and a WebSocket connection. The frontend can be replaced entirely without touching the backend.

```
React (Vercel) ──── HTTP / JSON ────► .NET API (Railway)
               ◄─── WebSocket ──────      │
                                          ▼
                                  PostgreSQL + PostGIS (Neon)
```

Real-time updates are powered by SignalR. When any user posts a message, it is broadcast to all connected clients instantly and appears as a pin on their map.

Location queries use PostGIS `ST_DWithin` with a GIST spatial index, keeping nearby searches fast regardless of how many posts exist in the database.

## Running locally

**Prerequisites:** .NET 9 SDK, Node.js, PostgreSQL with PostGIS

**Backend**
```
cd backend
dotnet run
```

**Frontend**
```
cd frontend
cp .env.example .env
npm install
npm run dev
```
