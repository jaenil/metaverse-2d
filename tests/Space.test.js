const { axios } = require("./helpers/axios");
const { createAdminAndUser, createMapWithElements, BACKEND_URL } = require("./helpers/setup");

describe("Space information", () => {
    let mapId;
    let element1Id;
    let element2Id;
    let adminToken;
    let adminId;
    let userToken;
    let userId;

    beforeAll(async () => {
        ({ adminToken, adminId, userToken, userId } = await createAdminAndUser());
        ({ element1Id, element2Id, mapId } = await createMapWithElements(adminToken));
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
});
