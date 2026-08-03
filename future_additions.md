# Future Additions & Tech Debt

This file tracks known optimisation opportunities, deferred technical improvements, and planned features. None of these are blocking for the current phase, but they should be revisited before scaling or deploying.

---

## 1. Admin Map Creation — No Collision Validation

**Location:** `metaverse/apps/http-service/src/routes/v1/admin.ts` — `POST /admin/map`

**Current Behaviour:**
When an Admin creates a map with `defaultElements`, the `createMany` call inserts all elements without checking if any of them overlap each other.

**Why It's a Problem:**
A map with overlapping elements will cause those overlapping elements to be copied into every Space created from it. The Space would then have pre-existing collision violations that users cannot fix.

**Recommended Solution:**
Apply the same AABB (bounding box) collision check used in `POST /space/element` before inserting the `defaultElements` during map creation.

---

## 2. Real-Time Group Text Chat System

**Overview & Objective:**
Implement a dual-mode real-time text chat system allowing users in a 2D space to communicatand **Space-Wide Global Chat** (messages broadcast to all users in the space), alongside floating speech bubbles above player avatars.

---

### Technical Specification & Architecture

#### A. Schema & Type Definitions (`@repo/types`)

1. **Incoming Client Message Schema:**
```ts
z.object({
  type: z.literal("chat-message"),
  payload: z.object({
    text: z.string().min(1).max(300),
    scope: z.enum(["proximity", "space"]),
  })
})
```

2. **Outgoing Server Broadcast Message:**
```ts
{
  type: "chat-message",
  payload: {
    id: string;             // Unique message identifier
    senderId: string;       // User ID of the sender
    senderUsername: string; // Display name
    text: string;           // Sanitized message content
    scope: "proximity" | "space";
    timestamp: number;      // Epoch timestamp in ms
    senderPos?: { x: number; y: number }; // Coordinates for canvas speech bubble rendering
  }
}
```

---

#### B. WebSocket Service (`apps/ws-service`)

1. **Message Handler (`User.ts`):**
   - Add a `case "chat-message"` block in `User.ts`.
   - **Sanitization & Security:** Escape HTML tags to prevent XSS. Strip zero-width spaces and excessive line breaks.
   - **Rate Limiting:** Implement a token-bucket or sliding window rate limiter per socket connection (e.g., max 5 messages per 3 seconds). Send an `"event-rejected"` frame if rate limit is exceeded.

2. **Broadcasting Logic (`RoomManager.ts`):**
   - **Space-Wide (`scope: "space"`):** Broadcast to all connected sockets in `rooms.get(spaceId)` via `RoomManager.broadcast()`.

3. **Message Persistence (Optional DB Logging):**
   - Add an asynchronous write queue to persist space chat logs to PostgreSQL (`ChatMessage` table in Prisma: `id`, `spaceId`, `senderId`, `content`, `scope`, `createdAt`) if chat history retention across user reconnects is desired.

---

#### C. Frontend Implementation (`apps/frontend`)

1. **UI Components:**
   - **Docked Chat Panel (`ChatPanel.tsx`):** A collapsible bottom-left overlay with tab switches (`Proximity` vs `Global`). Displays scrollable message history with timestamped sender tags and auto-scroll to bottom.
   - **Canvas Speech Bubbles (`ArenaCanvas.tsx` / `SpeechBubble.tsx`):** Render dynamic floating text bubbles directly above player avatars on the 2D canvas for proximity messages. Auto-fade bubbles after 4–5 seconds using CSS animations or requestAnimationFrame timers.

2. **Keyboard Focus & Controls Handling:**
   - Pressing `Enter` opens and focuses the chat input field.
   - When chat input is focused (`isChatFocused: true`), temporarily disable avatar movement listeners (`WASD` / arrow key events) in `SpacePage.tsx` so typing doesn't move the player avatar.
   - Pressing `Escape` or `Enter` (on submit) blurs input and restores avatar movement controls.

3. **Client-Side Throttling & UX:**
   - Visual error toast if message send fails or gets rate limited by backend.
   - Per-user client-side mute toggle to hide messages from specific disruptive users.


---
