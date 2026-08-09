const { WebSocket } = require("ws");
const { BACKEND_URL, WS_URL, createTestContext, createAdminAndUser, createMapWithElements, cleanupTestArtifacts } = require("./helpers/setup");
const { axios } = require("./helpers/axios");

// Polls every 50ms. Rejects after 4s to avoid hanging test suite.
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
            reject(new Error(`No WS message arrived within ${timeoutMs}ms.`));
        }, timeoutMs);
    });
}

describe("Chat feature tests", () => {
    let adminToken, adminId, userToken, userId, spaceId;
    let wsAdmin, wsUser;
    const adminMessages = [];
    const userMessages = [];

    async function setupHTTP() {
        const ctx = await createTestContext({ withSpace: true, dimensions: "10x10" });
        adminToken = ctx.adminToken;
        adminId    = ctx.adminId;
        userToken  = ctx.userToken;
        userId     = ctx.userId;
        spaceId    = ctx.spaceId;
    }

    async function setupWs() {
        wsAdmin = new WebSocket(WS_URL);
        wsAdmin.on("message", data => adminMessages.push(JSON.parse(data.toString())));
        await new Promise((resolve, reject) => {
            wsAdmin.on("open", resolve);
            wsAdmin.on("error", reject);
        });

        wsUser = new WebSocket(WS_URL);
        wsUser.on("message", data => userMessages.push(JSON.parse(data.toString())));
        await new Promise((resolve, reject) => {
            wsUser.on("open", resolve);
            wsUser.on("error", reject);
        });
    }

    beforeAll(async () => {
        await setupHTTP();
        await setupWs();
    }, 30000);

    afterAll(async () => {
        wsAdmin?.close();
        wsUser?.close();
        await cleanupTestArtifacts();
    });

    // ─── FUNCTIONALITY TESTS 

    test("Test 1: Join space and Happy Path Broadcast", async () => {
        // 1. Join space sequentially
        wsAdmin.send(JSON.stringify({ type: "join", payload: { spaceId, token: adminToken } }));
        await waitForAndPopMessage(adminMessages); // admin space-joined

        wsUser.send(JSON.stringify({ type: "join", payload: { spaceId, token: userToken } }));
        await waitForAndPopMessage(userMessages);  // user space-joined
        await waitForAndPopMessage(adminMessages); // user-join notification to admin

        // 2. Happy Path Broadcast
        wsAdmin.send(JSON.stringify({ type: "chat-message", payload: { text: "Hello User!" } }));
        const msg = await waitForAndPopMessage(userMessages);
        expect(msg.type).toBe("chat-message");
        expect(msg.payload.senderId).toBe(adminId);
        expect(msg.payload.text).toBe("Hello User!");
        expect(msg.payload.id).toBeDefined();
        expect(msg.payload.timestamp).toBeDefined();
    });

    test("Test 2: Self-Echo Broadcast", async () => {
        // Admin also receives their own message via broadcastAll (not filtered)
        const msg = await waitForAndPopMessage(adminMessages);
        expect(msg.type).toBe("chat-message");
        expect(msg.payload.text).toBe("Hello User!");
        expect(msg.payload.senderId).toBe(adminId);
    });

    test("Test 3: Chat History on Join", async () => {
        const { userToken: token3 } = await createAdminAndUser();
        const ws3 = new WebSocket(WS_URL);
        const ws3Messages = [];
        ws3.on("message", data => ws3Messages.push(JSON.parse(data.toString())));
        await new Promise(r => ws3.on("open", r));

        ws3.send(JSON.stringify({ type: "join", payload: { spaceId, token: token3 } }));
        const ws3Joined = await waitForAndPopMessage(ws3Messages);

        expect(ws3Joined.payload.chatHistory.length).toBeGreaterThanOrEqual(1);
        expect(ws3Joined.payload.chatHistory[0].text).toBe("Hello User!");

        ws3.close();
        
        // Drain user-join and user-left events from other clients
        await waitForAndPopMessage(adminMessages); // user-join
        await waitForAndPopMessage(userMessages);  // user-join
        await waitForAndPopMessage(adminMessages); // user-left
        await waitForAndPopMessage(userMessages);  // user-left
    });

    // ─── SECURITY & ABUSE PREVENTION TESTS ───────────────────────────────────

    test("Test 4: Rate Limiting", async () => {
        // wsUser sends 6 messages in rapid succession (limit is 5 per 3000ms)
        for (let i = 0; i < 6; i++) {
            wsUser.send(JSON.stringify({ type: "chat-message", payload: { text: `spam-${i}` } }));
        }

        let rejections = 0;
        for (let i = 0; i < 6; i++) {
            const msg = await waitForAndPopMessage(userMessages);
            if (msg.type === "event-rejected" && msg.payload.code === 429) rejections++;
        }
        expect(rejections).toBeGreaterThanOrEqual(1);

        // broadcastAll sends the 5 successful spams to adminMessages too — drain them
        // so they don't leak into Tests 5-7.
        adminMessages.length = 0;
    });

    test("Test 5: XSS Sanitization", async () => {
        // Wait for the 3s rate-limit window to reset before sending from wsAdmin
        await new Promise(r => setTimeout(r, 3000));

        wsAdmin.send(JSON.stringify({ type: "chat-message", payload: { text: "<script>alert(1)</script>" } }));
        const userMsg = await waitForAndPopMessage(userMessages);
        expect(userMsg.payload.text).toBe("&lt;script&gt;alert(1)&lt;/script&gt;");
        await waitForAndPopMessage(adminMessages); // drain self-echo
    });

    test("Test 6: Zero-Width Characters", async () => {
        wsAdmin.send(JSON.stringify({ type: "chat-message", payload: { text: "Hello\u200BWorld" } }));
        const userMsg = await waitForAndPopMessage(userMessages);
        expect(userMsg.payload.text).toBe("HelloWorld");
        await waitForAndPopMessage(adminMessages); // drain self-echo
    });

    test("Test 7: Wall-of-Text Prevention", async () => {
        // 4 newlines → must collapse to exactly 2
        wsAdmin.send(JSON.stringify({ type: "chat-message", payload: { text: "Line1\n\n\n\nLine2" } }));
        const userMsg = await waitForAndPopMessage(userMessages);
        expect(userMsg.payload.text).toBe("Line1\n\nLine2");
        await waitForAndPopMessage(adminMessages); // drain self-echo
    });

    // ─── LOGICAL & BOUNDARY CONDITION TESTS ──────────────────────────────────

    test("Test 8: Room Isolation", async () => {
        // Create a completely separate space
        const mapData2 = await createMapWithElements(adminToken);
        const spaceRes2 = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            { name: "Chat Space 2", dimensions: "10x10", mapId: mapData2.mapId },
            { headers: { authorization: `Bearer ${adminToken}` } }
        );
        const space2Id = spaceRes2.data.spaceId;

        const ws4 = new WebSocket(WS_URL);
        const ws4Messages = [];
        ws4.on("message", data => ws4Messages.push(JSON.parse(data.toString())));
        await new Promise(r => ws4.on("open", r));
        ws4.send(JSON.stringify({ type: "join", payload: { spaceId: space2Id, token: adminToken } }));
        await waitForAndPopMessage(ws4Messages); // space-joined for ws4

        // Send from wsUser in Space 1
        wsUser.send(JSON.stringify({ type: "chat-message", payload: { text: "Space 1 Only" } }));
        await waitForAndPopMessage(adminMessages); // admin in Space 1 receives it
        await waitForAndPopMessage(userMessages);  // drain user's own broadcastAll echo

        // ws4 is in Space 2 — it must NOT have received anything
        await new Promise(r => setTimeout(r, 150));
        expect(ws4Messages.length).toBe(0);
        ws4.close();
    });

    test("Test 9: Whitespace Only Message", async () => {
        // Zod min(1) passes "   " (length=3). sanitizeText trims to "". Server returns 422.
        // event-rejected is only sent to the sender — wsAdmin — not broadcasted
        wsAdmin.send(JSON.stringify({ type: "chat-message", payload: { text: "   " } }));
        const adminMsg = await waitForAndPopMessage(adminMessages);
        expect(adminMsg.type).toBe("event-rejected");
        expect(adminMsg.payload.code).toBe(422);
    });

    test("Test 10: State Cleanup on Empty Room", async () => {
        // Isolated space — no shared state with main space
        const mapData3 = await createMapWithElements(adminToken);
        const spaceRes3 = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            { name: "Cleanup Space", dimensions: "10x10", mapId: mapData3.mapId },
            { headers: { authorization: `Bearer ${adminToken}` } }
        );
        const testSpaceId = spaceRes3.data.spaceId;

        // User A joins and sends a message
        const wsA = new WebSocket(WS_URL);
        const wsAMsgs = [];
        wsA.on("message", data => wsAMsgs.push(JSON.parse(data.toString())));
        await new Promise(r => wsA.on("open", r));
        wsA.send(JSON.stringify({ type: "join", payload: { spaceId: testSpaceId, token: adminToken } }));
        await waitForAndPopMessage(wsAMsgs); // space-joined

        wsA.send(JSON.stringify({ type: "chat-message", payload: { text: "To be cleared" } }));
        await waitForAndPopMessage(wsAMsgs); // wait for echo so message is stored

        // User A leaves — room is now empty → ChatManager.clearRoom fires
        wsA.close();
        await new Promise(r => setTimeout(r, 150));

        // User B joins the now-empty room
        const wsB = new WebSocket(WS_URL);
        const wsBMsgs = [];
        wsB.on("message", data => wsBMsgs.push(JSON.parse(data.toString())));
        await new Promise(r => wsB.on("open", r));
        wsB.send(JSON.stringify({ type: "join", payload: { spaceId: testSpaceId, token: userToken } }));

        const joinMsg = await waitForAndPopMessage(wsBMsgs);
        expect(joinMsg.type).toBe("space-joined");
        expect(joinMsg.payload.chatHistory).toEqual([]);
        wsB.close();
    });

    test("Test 11: Unauthorized / No Space", async () => {
        // Ghost socket: connects but never sends `join`
        const wsGhost = new WebSocket(WS_URL);
        const ghostMessages = [];
        wsGhost.on("message", data => ghostMessages.push(JSON.parse(data.toString())));
        await new Promise(r => wsGhost.on("open", r));

        wsGhost.send(JSON.stringify({ type: "chat-message", payload: { text: "Ghost message" } }));

        // Server checks `if (!this.spaceId) return;` — no response, no broadcast
        await new Promise(r => setTimeout(r, 150));
        expect(ghostMessages.length).toBe(0);
        wsGhost.close();
    });
});