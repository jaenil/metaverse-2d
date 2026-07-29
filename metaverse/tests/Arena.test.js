const { axios } = require("./helpers/axios");
const { createAdminAndUser, createMapWithElements, BACKEND_URL } = require("./helpers/setup");

describe("Arena endpoints", () => {
    let element1Id;
    let element2Id;
    let adminToken;
    let userToken;
    let spaceId;

    beforeAll(async () => {
        ({ adminToken, userToken } = await createAdminAndUser());
        ({ element1Id, element2Id, mapId } = await createMapWithElements(adminToken));

        const spaceResponse = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            { name: "Test", dimensions: "100x200", mapId },
            { headers: { authorization: `Bearer ${userToken}` } }
        );
        spaceId = spaceResponse.data.spaceId;
    });

    test("Incorrect spaceId returns a 404", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/123kasdk01`, {
            headers: { authorization: `Bearer ${userToken}` },
        });
        expect(response.status).toBe(404);
    });

    test("Correct spaceId returns all the elements", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: { authorization: `Bearer ${userToken}` },
        });
        expect(response.data.space.width).toBe(100);
        expect(response.data.space.height).toBe(200);
        expect(response.data.elements.length).toBe(3);
    });

    test("Delete endpoint is able to delete an element", async () => {
        const spaceData = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: { authorization: `Bearer ${userToken}` },
        });

        await axios.delete(`${BACKEND_URL}/api/v1/space/element`, {
            data: {
                elementId: spaceData.data.elements[0].id,
                spaceId,
            },
            headers: { authorization: `Bearer ${userToken}` },
        });

        const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: { authorization: `Bearer ${userToken}` },
        });
        expect(newResponse.data.elements.length).toBe(2);
    });

    test("Adding an element fails if the element lies outside the dimensions", async () => {
        const response = await axios.post(
            `${BACKEND_URL}/api/v1/space/element`,
            { elementId: element1Id, spaceId, x: 10000, y: 210000 },
            { headers: { authorization: `Bearer ${userToken}` } }
        );
        expect(response.status).toBe(400);
    });

    test("Adding an element works as expected", async () => {
        await axios.post(
            `${BACKEND_URL}/api/v1/space/element`,
            { elementId: element1Id, spaceId, x: 50, y: 20 },
            { headers: { authorization: `Bearer ${userToken}` } }
        );

        const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: { authorization: `Bearer ${userToken}` },
        });
        expect(newResponse.data.elements.length).toBe(3);
    });
});
