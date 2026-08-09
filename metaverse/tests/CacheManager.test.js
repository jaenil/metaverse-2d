const WebSocket = require("ws");
const { axios } = require("./helpers/axios");
const { createTestContext, cleanupTestArtifacts, BACKEND_URL, WS_URL, INTERNAL_CACHE_URL } = require("./helpers/setup");

function waitForAndPopMessage(messageArray, timeoutMs = 4000) {
    return new Promise((resolve, reject) => {
        if (messageArray.length > 0) {
            resolve(messageArray.shift());
            return;
        }

        let timer;
        const interval = setInterval(() => {
            if (messageArray.length > 0) {
                clearTimeout(timer);
                clearInterval(interval);
                resolve(messageArray.shift());
            }
        }, 50);

        timer = setTimeout(() => {
            clearInterval(interval);
            reject(
                new Error(`No WS message arrived within ${timeoutMs}ms.`)
            );
        }, timeoutMs);
    });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe("Cache Manager & Invalidation Tests", () => {
    let adminToken;
    let userToken;
    let spaceId;
    let element1Id;
    let mapId;
    // Loaded once in beforeAll to avoid repeated dynamic imports per test
    let Types;

    beforeAll(async () => {
        ({ adminToken, userToken, element1Id, mapId } = await createTestContext());
        Types = await import("@repo/types");
    }, 30000);

    beforeEach(async () => {
        const spaceResponse = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            { name: `test-cache-${Math.random().toString(36).substring(2)}`, dimensions: "100x200", mapId },
            { headers: { authorization: `Bearer ${adminToken}` } }
        );
        spaceId = spaceResponse.data.spaceId;
    });

    afterAll(async () => {
        await cleanupTestArtifacts();
    });

    test("Test 1: Verifying WS server is active and joining populates cache", async () => {
        const ws = new WebSocket(WS_URL);
        const msgs = [];
        ws.on("message", (data) => msgs.push(JSON.parse(data.toString())));
        await new Promise((resolve) => ws.on("open", resolve));

        ws.send(JSON.stringify({ type: "join", payload: { spaceId, token: adminToken } }));
        const joinMsg = await waitForAndPopMessage(msgs);

        expect(joinMsg.type).toBe("space-joined");
        expect(joinMsg.payload.spawn).toBeDefined();
        expect(joinMsg.payload.weather).toBeDefined();
        expect(joinMsg.payload.timeOfDay).toBeDefined();

        ws.close();
    });

    test("Test 2: Internal cache invalidation endpoint rejects malformed payload schema with 400 Bad Request", async () => {
        const response = await axios.post(`${INTERNAL_CACHE_URL}/internal/invalidate-space-elements`, {
            action: "invalid_action",
            spaceId: "some-id"
        });
        expect(response.status).toBe(400);
        expect(response.data.message).toBe("Invalid payload");
    });

    test("Test 3: Element added via HTTP updates WS collision map in RAM (action: add)", async () => {
        // 1. Connect via WS and join space to get spawn coordinates
        const ws = new WebSocket(WS_URL);
        const msgs = [];
        ws.on("message", (data) => msgs.push(JSON.parse(data.toString())));
        await new Promise((resolve) => ws.on("open", resolve));

        ws.send(JSON.stringify({ type: "join", payload: { spaceId, token: adminToken } }));
        const joinMsg = await waitForAndPopMessage(msgs);

        const spawnX = joinMsg.payload.spawn.x;
        const spawnY = joinMsg.payload.spawn.y;
        const targetX = spawnX < 99 ? spawnX + 1 : spawnX - 1;
        const targetY = spawnY;

        // 2. Add static element at adjacent tile via HTTP API
        const addResponse = await axios.post(
            `${BACKEND_URL}/api/v1/space/element`,
            { elementId: element1Id, spaceId, x: targetX, y: targetY },
            { headers: { authorization: `Bearer ${adminToken}` } }
        );
        expect(addResponse.status).toBe(200);

        // Allow background async notifyWsCache fetch to reach port 3002
        await sleep(100);

        // 3. Step into static element tile -> MUST be rejected by RAM cache!
        ws.send(JSON.stringify({ type: "move", payload: { x: targetX, y: targetY } }));
        const moveReject = await waitForAndPopMessage(msgs);
        expect(moveReject.type).toBe("movement-rejected");

        ws.close();
    });

    test("Test 4: Element deleted via HTTP clears WS collision map (action: remove)", async () => {
        // 1. Connect two users (moving user + observer) to receive movement broadcast on success
        const wsUser = new WebSocket(WS_URL);
        const userMsgs = [];
        wsUser.on("message", (data) => userMsgs.push(JSON.parse(data.toString())));
        await new Promise((resolve) => wsUser.on("open", resolve));

        const wsObserver = new WebSocket(WS_URL);
        const observerMsgs = [];
        wsObserver.on("message", (data) => observerMsgs.push(JSON.parse(data.toString())));
        await new Promise((resolve) => wsObserver.on("open", resolve));

        wsUser.send(JSON.stringify({ type: "join", payload: { spaceId, token: adminToken } }));
        const joinMsg = await waitForAndPopMessage(userMsgs);

        wsObserver.send(JSON.stringify({ type: "join", payload: { spaceId, token: userToken } }));
        await waitForAndPopMessage(observerMsgs);
        await waitForAndPopMessage(userMsgs); // user-join notification

        const spawnX = joinMsg.payload.spawn.x;
        const spawnY = joinMsg.payload.spawn.y;
        const targetX = spawnX < 99 ? spawnX + 1 : spawnX - 1;
        const targetY = spawnY;

        // 2. Add element at adjacent tile
        const addResponse = await axios.post(
            `${BACKEND_URL}/api/v1/space/element`,
            { elementId: element1Id, spaceId, x: targetX, y: targetY },
            { headers: { authorization: `Bearer ${adminToken}` } }
        );
        const createdElementId = addResponse.data.element.id;
        await sleep(100);

        // 3. Delete element via HTTP API
        const deleteResponse = await axios.delete(
            `${BACKEND_URL}/api/v1/space/element`,
            {
                data: { elementId: createdElementId, spaceId },
                headers: { authorization: `Bearer ${adminToken}` }
            }
        );
        expect(deleteResponse.status).toBe(200);
        await sleep(100);

        // 4. Move to adjacent tile where element was deleted -> observer receives movement broadcast!
        wsUser.send(JSON.stringify({ type: "move", payload: { x: targetX, y: targetY } }));
        const moveMsg = await waitForAndPopMessage(observerMsgs);
        expect(moveMsg.type).toBe("movement");
        expect(moveMsg.payload.x).toBe(targetX);
        expect(moveMsg.payload.y).toBe(targetY);

        wsUser.close();
        wsObserver.close();
    });

    test("Test 5: Full space cache invalidation endpoint (action: full)", async () => {
        const fullResponse = await axios.post(
            `${INTERNAL_CACHE_URL}/internal/invalidate-space-elements`,
            { action: "full", spaceId }
        );
        expect(fullResponse.status).toBe(200);
        expect(fullResponse.data.status).toBe("ok");
    });

    test("Test 6: Space settings updated via WS are served from RAM to joining users", async () => {
        const wsAdmin = new WebSocket(WS_URL);
        const adminMsgs = [];
        wsAdmin.on("message", (data) => adminMsgs.push(JSON.parse(data.toString())));
        await new Promise((resolve) => wsAdmin.on("open", resolve));

        wsAdmin.send(JSON.stringify({ type: "join", payload: { spaceId, token: adminToken } }));
        await waitForAndPopMessage(adminMsgs);

        // Admin updates space settings via WS
        wsAdmin.send(JSON.stringify({
            type: "update-settings",
            payload: { weather: "snow", timeOfDay: "night" }
        }));
        const settingsMsg = await waitForAndPopMessage(adminMsgs);
        expect(settingsMsg.type).toBe("settings-changed");
        expect(settingsMsg.payload.weather).toBe("snow");
        expect(settingsMsg.payload.timeOfDay).toBe("night");

        // A new user joins the space -> must receive updated settings from CacheManager RAM
        const wsUser = new WebSocket(WS_URL);
        const userMsgs = [];
        wsUser.on("message", (data) => userMsgs.push(JSON.parse(data.toString())));
        await new Promise((resolve) => wsUser.on("open", resolve));

        wsUser.send(JSON.stringify({ type: "join", payload: { spaceId, token: userToken } }));
        const userJoinMsg = await waitForAndPopMessage(userMsgs);

        expect(userJoinMsg.type).toBe("space-joined");
        expect(userJoinMsg.payload.weather).toBe("snow");
        expect(userJoinMsg.payload.timeOfDay).toBe("night");

        wsAdmin.close();
        wsUser.close();
    });
});