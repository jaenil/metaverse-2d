import express from 'express';
import { CacheInvalidationPayloadSchema } from '@repo/types';
import { CacheManager } from './managers/CacheManager.js';

const app = express();
app.use(express.json());

app.post('/internal/invalidate-space-elements', (req, res) => {
    const result = CacheInvalidationPayloadSchema.safeParse(req.body);
    if (!result.success) {
        console.error("[CacheInvalidation] Invalid payload schema:", result.error);
        return res.status(400).json({ message: "Invalid payload" });
    }
    try {
        const payload = result.data;
        if (payload.action === "add") {
            CacheManager.getInstance().addElementToCache(payload.spaceId, payload.element);
        } else if (payload.action === "remove") {
            CacheManager.getInstance().removeElementFromCache(payload.spaceId, payload.elementId);
        } else if (payload.action === "full") {
            CacheManager.getInstance().invalidateElementCache(payload.spaceId);
        }

        return res.status(200).json({ status: "ok" });
    } catch (error) {
        console.error("[CacheInvalidation] Error in cache invalidation:", error);
        return res.status(500).json({ message: "Error in cache invalidation" });
    }
});

export function startCacheInvalidationServer(port = 3002) {
    try {
        const server = app.listen(port, "127.0.0.1", () => {
            console.log(`[WS-Service] Internal cache invalidation listener running on 127.0.0.1:${port}`);
        });
        server.on("error", (err) => {
            console.error(`[WS-Service] Cache invalidation server failed to start on port ${port}:`, err.message);
            console.warn(`[WS-Service] Fallback mode active: WS will fallback to DB re-fetching on cache misses if internal port is unavailable.`);
        });
    } catch (err) {
        console.error("[WS-Service] Failed to initialize cache invalidation server:", err);
    }
}