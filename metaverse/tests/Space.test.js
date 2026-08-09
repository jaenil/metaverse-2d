const { axios } = require("./helpers/axios");
const { createTestContext, cleanupTestArtifacts, BACKEND_URL } = require("./helpers/setup");

describe("Space information", () => {
    let mapId;
    let element1Id;
    let element2Id;
    let adminToken;
    let adminId;
    let userToken;
    let userId;

    beforeAll(async () => {
        ({ adminToken, adminId, userToken, userId, element1Id, element2Id, mapId }
            = await createTestContext());
    });

    afterAll(async () => {
        await cleanupTestArtifacts();
    });

    test("User is able to create a space", async () => {
        const response = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            { name: "Test", dimensions: "100x200", mapId },
            { headers: { authorization: `Bearer ${userToken}` } }
        );
        expect(response.status).toBe(200);
        expect(response.data.spaceId).toBeDefined();
    });

    test("User is able to create a space without mapId (empty space)", async () => {
        const response = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            { name: "Test", dimensions: "100x200" },
            { headers: { authorization: `Bearer ${userToken}` } }
        );
        expect(response.data.spaceId).toBeDefined();
    });

    test("User is not able to create a space without mapId and dimensions", async () => {
        const response = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            { name: "Test" },
            { headers: { authorization: `Bearer ${userToken}` } }
        );
        expect(response.status).toBe(400);
    });

    test("User is not able to delete a space that doesnt exist", async () => {
        const response = await axios.delete(
            `${BACKEND_URL}/api/v1/space/randomIdDoesntExist`,
            { headers: { authorization: `Bearer ${userToken}` } }
        );
        expect(response.status).toBe(404);
    });

    test("User is able to delete a space that does exist", async () => {
        const createResponse = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            { name: "Test", dimensions: "100x200" },
            { headers: { authorization: `Bearer ${userToken}` } }
        );

        const deleteResponse = await axios.delete(
            `${BACKEND_URL}/api/v1/space/${createResponse.data.spaceId}`,
            { headers: { authorization: `Bearer ${userToken}` } }
        );
        expect(deleteResponse.status).toBe(200);
    });

    test("User should not be able to delete a space created by another user", async () => {
        const createResponse = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            { name: "Test", dimensions: "100x200" },
            { headers: { authorization: `Bearer ${userToken}` } }
        );

        const deleteResponse = await axios.delete(
            `${BACKEND_URL}/api/v1/space/${createResponse.data.spaceId}`,
            { headers: { authorization: `Bearer ${adminToken}` } }
        );
        expect(deleteResponse.status).toBe(403);
    });

    test("Admin has no spaces initially", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
            headers: { authorization: `Bearer ${adminToken}` },
        });
        expect(response.data.spaces.length).toBe(0);
    });

    test("Admin gets one space after creating one", async () => {
        const spaceCreateResponse = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            { name: "Test", dimensions: "100x200" },
            { headers: { authorization: `Bearer ${adminToken}` } }
        );

        const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`, {
            headers: { authorization: `Bearer ${adminToken}` },
        });

        const filteredSpace = response.data.spaces.find(
            (x) => x.id === spaceCreateResponse.data.spaceId
        );
        expect(response.data.spaces.length).toBe(1);
        expect(filteredSpace).toBeDefined();
    });

    test("GET space by non-existent ID returns 404", async () => {
        const response = await axios.get(
            `${BACKEND_URL}/api/v1/space/nonExistentId123`,
            { headers: { authorization: `Bearer ${userToken}` } }
        );

        expect(response.status).toBe(404);
        expect(response.data.message).toBe("Space not found");
    });

    test("GET space by ID returns space details and elements", async () => {
        const createResponse = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            { name: "Test", dimensions: "100x200", mapId },
            { headers: { authorization: `Bearer ${userToken}` } }
        );
        const spaceId = createResponse.data.spaceId;

        const response = await axios.get(
            `${BACKEND_URL}/api/v1/space/${spaceId}`,
            { headers: { authorization: `Bearer ${userToken}` } }
        );

        expect(response.status).toBe(200);
        expect(response.data.space.width).toBe(100);
        expect(response.data.space.height).toBe(200);
        expect(response.data.space.creatorId).toBeDefined();
        expect(response.data.space.timeOfDay).toBeDefined();
        expect(response.data.space.weather).toBeDefined();
        expect(Array.isArray(response.data.elements)).toBe(true);
        expect(response.data.elements.length).toBe(3);
    });
});
