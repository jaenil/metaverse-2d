# Metaverse 2D

A real-time 2D pixel-art metaverse application featuring customizable spaces, live WebSocket character movement, and user authentication with optional Google Sign-In.

---

## 📁 Abstract Folder Structure

```text
metaverse/
├── apps/
│   ├── frontend/         # React + Vite frontend UI (Pages, Game Canvas, Zustand state)
│   ├── http-service/     # Express HTTP REST API (Auth, Spaces, Admin, User Metadata)
│   └── ws-service/       # WebSocket Server for real-time movement and space synchronization
├── packages/
│   ├── db/               # Prisma ORM schema & database client
│   ├── types/            # Shared TypeScript types & Zod validation schemas
│   ├── ui/               # Shared UI component primitives
│   └── typescript-config/# Shared tsconfig configurations
└── tests/                # Integration and end-to-end test suites
```

---

## ⚡ Installation & Setup Guide

### 1. Prerequisites
- **Node.js**: `v18+` or `v20+`
- **npm** / **turbo**
- **PostgreSQL Database** (e.g., Supabase or local PostgreSQL)

### 2. Installation & Environment Setup

Clone the repository and install dependencies:
```bash
cd metaverse
npm install
```

Configure environment files:

**Backend (`apps/http-service/.env`):**
```env
PORT=3000
DATABASE_URL="your-postgresql-connection-string"
DIRECT_URL="your-direct-postgresql-connection-string"
JWT_SECRET="your-jwt-secret"
ALLOWED_ORIGINS="*"
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
WS_INTERNAL_URL="http://127.0.0.1:3002"
```

**WebSocket Service (`apps/ws-service/.env`):**
```env
PORT=3001
JWT_SECRET="your-jwt-secret"
WS_INTERNAL_URL="http://127.0.0.1:3002"
```

**Frontend (`apps/frontend/.env`):**
```env
VITE_BACKEND_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3001
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## 🚀 Performance & Architecture

### In-Memory Caching & Server-Authoritative Physics
- **Zero-DB Movement**: Player tile movements are validated against a high-performance in-memory cache (`CacheManager` in `ws-service/src/caching.ts`), eliminating database queries during active player movement.
- **Shared Space Cache**: Elements and space metadata are loaded into memory once per active space and shared across all connected players in that space.
- **Service-to-Service Cache Invalidation**: When elements are added or removed via the HTTP API, `http-service` sends a non-blocking notification to `ws-service` via `WS_INTERNAL_URL` (`http://127.0.0.1:3002/internal/invalidate-space-elements`), instantly updating the WebSocket server's collision map in real time.
- **Automatic Garbage Collection**: When a space becomes empty (0 connected players), `clearSpaceCache` evicts space data from RAM to maintain a minimal memory footprint.

---

## 🌐 Running using ngrok

To expose your local development environment to external devices or collaborators via **ngrok**:

### 1. Expose standard services
In separate terminal tabs, start ngrok tunnels for frontend, HTTP backend, and WS backend:

```bash
# Tunnel Frontend
ngrok http 5173

# Tunnel Backend HTTP API
ngrok http 3000

# Tunnel WebSocket Service
ngrok http 3001
```

### 2. Update Frontend Environment
Update your `apps/frontend/.env` with the generated ngrok URLs:

```env
VITE_BACKEND_URL=https://<your-http-ngrok-id>.ngrok-free.app
VITE_WS_URL=wss://<your-ws-ngrok-id>.ngrok-free.app
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 3. Google OAuth Configuration (Important)
If using Google Sign-In over ngrok:
1. Go to **Google Cloud Console → APIs & Services → Credentials**.
2. Select your OAuth 2.0 Client ID.
3. Add your frontend ngrok origin to **Authorized JavaScript origins**:
   `https://<your-frontend-ngrok-id>.ngrok-free.app`
4. Save the configuration.

