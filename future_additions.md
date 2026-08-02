# Future Additions & Tech Debt

This file tracks known optimisation opportunities and deferred improvements. None of these are blocking for the current phase, but they should be revisited before scaling or deploying.

---

## 1. WebSocket — DB Load on Every Player Move

**Location:** `metaverse/apps/ws-service/src/User.ts` — the `"move"` case

**Current Behaviour:**
Every time a player takes a single step, the WebSocket server fires a `client.spaceElements.findMany` query against the database to check for element collisions. If 10 players are moving at once, that's 10 DB queries per step per second.

**Why It's a Problem at Scale:**
Elements in a space only change when someone in Build Mode adds or deletes one. Between those events, the elements are completely static. There is no reason to re-query the database on every movement.

**Recommended Solution — In-Memory Cache in `RoomManager`:**
1. Add a `Map<spaceId, SpaceElement[]>` cache on the `RoomManager` singleton.
2. When the first user joins a space (`"join"` event in `User.ts`), fetch all elements and store them in the cache.
3. In the `"move"` handler, read from the in-memory cache instead of hitting the database.
4. When an element is added or deleted via the HTTP API, emit an internal cache-invalidation event (or have the WS service expose a simple internal REST endpoint to invalidate the cache for a given space).

**Reference:**
- `RoomManager.ts` — where the cache `Map` should live
- `User.ts` — the `"join"` case is where the initial fetch should happen
- `space.ts` (HTTP) — the `POST /element` and `DELETE /element` routes are where cache invalidation should be triggered

---

## 2. Admin Map Creation — No Collision Validation

**Location:** `metaverse/apps/http-service/src/routes/v1/admin.ts` — `POST /admin/map`

**Current Behaviour:**
When an Admin creates a map with `defaultElements`, the `createMany` call inserts all elements without checking if any of them overlap each other.

**Why It's a Problem:**
A map with overlapping elements will cause those overlapping elements to be copied into every Space created from it. The Space would then have pre-existing collision violations that users cannot fix.

**Recommended Solution:**
Apply the same AABB (bounding box) collision check used in `POST /space/element` before inserting the `defaultElements` during map creation.

---

## 3. Frontend — Silent Failure on Element Placement Rejection

**Location:** `metaverse/apps/frontend/src/pages/SpacePage.tsx` — `handleCanvasClick`

**Current Behaviour:**
When the backend rejects an element placement (e.g., collision detected), the `catch` block only calls `console.error`. The user sees no visual feedback — the canvas just does nothing.

**Recommended Solution:**
Add a toast notification or a brief HUD banner that shows the rejection reason (e.g., "Can't place here — collision detected"). This gives the user clear feedback without interrupting their workflow.

---
