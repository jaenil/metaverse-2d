const WebSocket = require("ws");
const { axios } = require("./helpers/axios");
const { createAdminAndUser, createMapWithElements, BACKEND_URL } = require("./helpers/setup");

const WS_URL = "ws://localhost:3001";

/**
 * Waits until messageArray is non-empty, then shifts and returns the first message.
 * Polls every 100ms.
 */
function waitForAndPopLatestMessage(messageArray, timeoutMs = 4000) {
    return new Promise((resolve, reject) => {
        if (messageArray.length > 0) {
            resolve(messageArray.shift());
            return;
        }
        const interval = setInterval(() => {
            if (messageArray.length > 0) {
                resolve(messageArray.shift());
                clearInterval(interval);
            }
        }, 100);

        // Reject after timeoutMs so tests fail with a useful message
        // instead of a generic "test timed out" from Jest
        setTimeout(() => {
            clearInterval(interval);
            reject(
                new Error(
                    `No WS message arrived within ${timeoutMs}ms. ` +
                    `Check that the WS server is running on port 3001 and sent a response.`
                )
            );
        }, timeoutMs);
    });
}

describe("Websocket tests", () => {
    let adminToken;
    let adminUserId;
    let userToken;
    let userId;
    let spaceId;
    let globalElementId;
    let globalMapId;
    let ws1;
    let ws2;
    let ws1Messages = [];
    let ws2Messages = [];
    let userX;
    let userY;
    let adminX;
    let adminY;

    async function setupHTTP() {
        const { adminToken: at, adminId, userToken: ut, userId: uid } =
            await createAdminAndUser();
        adminToken = at;
        adminUserId = adminId;
        userToken = ut;
        userId = uid;

        const { mapId, element1Id } = await createMapWithElements(adminToken);
        globalElementId = element1Id;
        globalMapId = mapId;

        const spaceResponse = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            { name: "Test", dimensions: "100x200", mapId },
            { headers: { authorization: `Bearer ${userToken}` } }
        );
        spaceId = spaceResponse.data.spaceId;
    }

    async function setupWs() {
        ws1 = new WebSocket(WS_URL);
        ws1.on("message", (event) => {
            ws1Messages.push(JSON.parse(event.toString()));
        });
        await new Promise((r) => ws1.on("open", r));

        ws2 = new WebSocket(WS_URL);
        ws2.on("message", (event) => {
            ws2Messages.push(JSON.parse(event.toString()));
        });
        await new Promise((r) => ws2.on("open", r));
    }

    // 30s: setupHTTP does ~6–7 HTTP requests before WS connections open
    beforeAll(async () => {
        console.log("[WS beforeAll] Starting HTTP setup...");
        await setupHTTP();
        console.log("[WS beforeAll] HTTP done. spaceId:", spaceId, "— Opening WS connections...");
        await setupWs();
        console.log("[WS beforeAll] Both WS connections open.");
    }, 30000);

    afterAll(() => {
        ws1.close();
        ws2.close();
    });

    test("Get back for joining the space", async () => {
        ws1.send(
            JSON.stringify({ type: "join", payload: { spaceId, token: adminToken } })
        );
        const message1 = await waitForAndPopLatestMessage(ws1Messages);

        ws2.send(
            JSON.stringify({ type: "join", payload: { spaceId, token: userToken } })
        );
        const message2 = await waitForAndPopLatestMessage(ws2Messages);
        const message3 = await waitForAndPopLatestMessage(ws1Messages);

        expect(message1.type).toBe("space-joined");
        expect(message2.type).toBe("space-joined");
        expect(message1.payload.users.length).toBe(0);
        expect(message2.payload.users.length).toBe(1);
        expect(message3.type).toBe("user-join");
        expect(message3.payload.x).toBe(message2.payload.spawn.x);
        expect(message3.payload.y).toBe(message2.payload.spawn.y);
        expect(message3.payload.userId).toBe(userId);

        adminX = message1.payload.spawn.x;
        adminY = message1.payload.spawn.y;
        userX = message2.payload.spawn.x;
        userY = message2.payload.spawn.y;
    });

    test("User should not be able to move across the boundary of the wall", async () => {
        ws1.send(
            JSON.stringify({ type: "move", payload: { x: 1000000, y: 10000 } })
        );
        const message = await waitForAndPopLatestMessage(ws1Messages);
        expect(message.type).toBe("movement-rejected");
        expect(message.payload.x).toBe(adminX);
        expect(message.payload.y).toBe(adminY);
    });

    test("User should not be able to move two blocks at the same time", async () => {
        ws1.send(
            JSON.stringify({ type: "move", payload: { x: adminX + 2, y: adminY } })
        );
        const message = await waitForAndPopLatestMessage(ws1Messages);
        expect(message.type).toBe("movement-rejected");
        expect(message.payload.x).toBe(adminX);
        expect(message.payload.y).toBe(adminY);
    });

    test("User should not be able to move into a static element", async () => {
        // Create a 2x1 space
        const spaceResponse = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            { name: "Tiny Element Space", dimensions: "2x1", mapId: globalMapId },
            { headers: { authorization: `Bearer ${adminToken}` } }
        );
        const tinySpaceId = spaceResponse.data.spaceId;

        // Add a static element at (1,0)
        await axios.post(
            `${BACKEND_URL}/api/v1/space/element`,
            { elementId: globalElementId, x: 1, y: 0, spaceId: tinySpaceId },
            { headers: { authorization: `Bearer ${adminToken}` } }
        );

        const wsC = new WebSocket(WS_URL);
        const wsCMsgs = [];
        wsC.on("message", (event) => wsCMsgs.push(JSON.parse(event.toString())));
        await new Promise((r) => wsC.on("open", r));

        wsC.send(JSON.stringify({ type: "join", payload: { spaceId: tinySpaceId, token: adminToken } }));
        const msgC = await waitForAndPopLatestMessage(wsCMsgs);
        let cx = msgC.payload.spawn.x;

        const wsD = new WebSocket(WS_URL);
        const wsDMsgs = [];
        wsD.on("message", (event) => wsDMsgs.push(JSON.parse(event.toString())));
        await new Promise((r) => wsD.on("open", r));
        wsD.send(JSON.stringify({ type: "join", payload: { spaceId: tinySpaceId, token: userToken } }));
        await waitForAndPopLatestMessage(wsDMsgs); // space-joined
        await waitForAndPopLatestMessage(wsCMsgs); // user-join

        // If it spawned on (1,0)
        if (cx === 1) {
            wsC.send(JSON.stringify({ type: "move", payload: { x: 0, y: 0 } }));
            await waitForAndPopLatestMessage(wsDMsgs); // consume movement
            cx = 0;
        }

        // Now cx is 0. Try to move to (1,0) where the element is!
        wsC.send(JSON.stringify({ type: "move", payload: { x: 1, y: 0 } }));
        const rejectMsg = await waitForAndPopLatestMessage(wsCMsgs);
        expect(rejectMsg.type).toBe("movement-rejected");

        wsC.close();
        wsD.close();
    });

    test("User should not be able to move into another user", async () => {
        // Create a tiny 2x1 space
        const spaceResponse = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            { name: "Tiny User Space", dimensions: "2x1", mapId: globalMapId },
            { headers: { authorization: `Bearer ${adminToken}` } }
        );
        const tinySpaceId = spaceResponse.data.spaceId;

        const wsA = new WebSocket(WS_URL);
        const wsAMsgs = [];
        wsA.on("message", (event) => wsAMsgs.push(JSON.parse(event.toString())));
        await new Promise((r) => wsA.on("open", r));

        wsA.send(JSON.stringify({ type: "join", payload: { spaceId: tinySpaceId, token: adminToken } }));
        const msgA = await waitForAndPopLatestMessage(wsAMsgs);
        let ax = msgA.payload.spawn.x;
        let ay = msgA.payload.spawn.y;

        const wsB = new WebSocket(WS_URL);
        const wsBMsgs = [];
        wsB.on("message", (event) => wsBMsgs.push(JSON.parse(event.toString())));
        await new Promise((r) => wsB.on("open", r));

        wsB.send(JSON.stringify({ type: "join", payload: { spaceId: tinySpaceId, token: userToken } }));
        const msgB = await waitForAndPopLatestMessage(wsBMsgs);
        let bx = msgB.payload.spawn.x;
        let by = msgB.payload.spawn.y;

        // consume the user-join from wsA
        await waitForAndPopLatestMessage(wsAMsgs);

        // If they spawned on the same spot, move one of them
        if (ax === bx) {
            let nextX = ax === 0 ? 1 : 0;
            wsA.send(JSON.stringify({ type: "move", payload: { x: nextX, y: ay } }));
            // wsB receives movement, pop it
            await waitForAndPopLatestMessage(wsBMsgs);
            ax = nextX;
        }

        // They are now adjacent. A tries to move into B.
        wsA.send(JSON.stringify({ type: "move", payload: { x: bx, y: by } }));
        const rejectMsg = await waitForAndPopLatestMessage(wsAMsgs);
        expect(rejectMsg.type).toBe("movement-rejected");

        wsA.close();
        wsB.close();
    });

    test("Correct movement should be broadcasted to the other sockets in the room", async () => {
        ws1.send(
            JSON.stringify({
                type: "move",
                payload: { x: adminX + 1, y: adminY, userId: adminUserId },
            })
        );
        const message = await waitForAndPopLatestMessage(ws2Messages);
        expect(message.type).toBe("movement");
        expect(message.payload.x).toBe(adminX + 1);
        expect(message.payload.y).toBe(adminY);
    });

    test("If a user leaves, the other user receives a leave event", async () => {
        ws1.close();
        const message = await waitForAndPopLatestMessage(ws2Messages);
        expect(message.type).toBe("user-left");
        expect(message.payload.userId).toBe(adminUserId);
    });

    test("Emote Broadcasting: Users in the same space should receive emotes", async () => {
        ws2.send(
            JSON.stringify({ type: "emote", payload: { emote: "👋" } })
        );
        // We reconnect ws1 just to receive it? Wait, ws1 is closed. Let's create ws3.
        const ws3 = new WebSocket(WS_URL);
        const ws3Messages = [];
        ws3.on("message", (event) => ws3Messages.push(JSON.parse(event.toString())));
        await new Promise((r) => ws3.on("open", r));

        ws3.send(
            JSON.stringify({ type: "join", payload: { spaceId, token: adminToken } })
        );
        await waitForAndPopLatestMessage(ws3Messages); // space-joined
        await waitForAndPopLatestMessage(ws2Messages); // user-join

        ws3.send(
            JSON.stringify({ type: "emote", payload: { emote: "👋" } })
        );

        const message = await waitForAndPopLatestMessage(ws2Messages);
        expect(message.type).toBe("emote");
        expect(message.payload.emote).toBe("👋");
        expect(message.payload.userId).toBe(adminUserId);

        ws3.close();
        await waitForAndPopLatestMessage(ws2Messages); // consume user-left
    });

    test("Malformed Messages: Server should send event-rejected and not crash", async () => {
        // Send broken JSON
        ws2.send("{ type: broken json");
        const message = await waitForAndPopLatestMessage(ws2Messages);
        expect(message.type).toBe("event-rejected");
        expect(message.payload).toBeDefined();
        expect(message.payload.message).toBe("Invalid JSON payload format");
    });

    test("Non-Existent Space: Should not receive space-joined", async () => {
        const ws4 = new WebSocket(WS_URL);
        const ws4Messages = [];
        ws4.on("message", (event) => ws4Messages.push(JSON.parse(event.toString())));
        await new Promise((r) => ws4.on("open", r));

        ws4.send(
            JSON.stringify({ type: "join", payload: { spaceId: "invalid-space-id", token: userToken } })
        );

        // We expect it to timeout and not receive space-joined, meaning the promise rejects
        await expect(waitForAndPopLatestMessage(ws4Messages, 1000)).rejects.toThrow();
        ws4.close();
    });

    test("State Consistency: New users joining should not see users who have left", async () => {
        // Currently, ws1 is closed, ws2 is still in the room.
        // Let's create ws5 and check the space-joined users list.
        const ws5 = new WebSocket(WS_URL);
        const ws5Messages = [];
        ws5.on("message", (event) => ws5Messages.push(JSON.parse(event.toString())));
        await new Promise((r) => ws5.on("open", r));

        ws5.send(
            JSON.stringify({ type: "join", payload: { spaceId, token: adminToken } })
        );

        const message = await waitForAndPopLatestMessage(ws5Messages);
        expect(message.type).toBe("space-joined");

        // Users list should only contain ws2 (userId), and NOT ws1 (adminUserId) since ws1 left
        expect(message.payload.users.length).toBe(1);
        expect(message.payload.users[0].userId).toBe(userId);

        ws5.close();
        await waitForAndPopLatestMessage(ws2Messages); // consume user-left from ws5 joining and leaving
    });
});
