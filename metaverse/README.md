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
```

**Frontend (`apps/frontend/.env`):**
```env
VITE_BACKEND_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3001
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 3. Database Migration
```bash
npx prisma db push --schema=packages/db/prisma/schema.prisma
```

### 4. Running the Project

Run all services concurrently using Turborepo:
```bash
npm run dev
```
- **Frontend**: `http://localhost:5173`
- **HTTP API**: `http://localhost:3000`
- **WS Service**: `ws://localhost:3001`

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
