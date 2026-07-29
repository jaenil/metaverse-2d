const { axios } = require("./helpers/axios");
const { createAdminAndUser, BACKEND_URL } = require("./helpers/setup");

describe("Admin Endpoints", () => {
    let adminToken;
    let userToken;

    beforeAll(async () => {
        ({ adminToken, userToken } = await createAdminAndUser());
    });

    test("User is not able to hit admin endpoints", async () => {
        const elementResponse = await axios.post(
            `${BACKEND_URL}/api/v1/admin/element`,
            {
                imageUrl:
                    "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
                width: 1,
                height: 1,
                static: true,
            },
            { headers: { authorization: `Bearer ${userToken}` } }
        );

        const mapResponse = await axios.post(
            `${BACKEND_URL}/api/v1/admin/map`,
            {
                thumbnail: "https://thumbnail.com/a.png",
                dimensions: "100x200",
                name: "test space",
                defaultElements: [],
            },
            { headers: { authorization: `Bearer ${userToken}` } }
        );

        const avatarResponse = await axios.post(
            `${BACKEND_URL}/api/v1/admin/avatar`,
            {
                imageUrl:
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
                name: "Timmy",
            },
            { headers: { authorization: `Bearer ${userToken}` } }
        );

        const updateElementResponse = await axios.put(
            `${BACKEND_URL}/api/v1/admin/element/123`,
            {
                imageUrl:
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            },
            { headers: { authorization: `Bearer ${userToken}` } }
        );

        expect(elementResponse.status).toBe(403);
        expect(mapResponse.status).toBe(403);
        expect(avatarResponse.status).toBe(403);
        expect(updateElementResponse.status).toBe(403);
    });

    test("Admin is able to hit admin endpoints", async () => {
        const elementResponse = await axios.post(
            `${BACKEND_URL}/api/v1/admin/element`,
            {
                imageUrl:
                    "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
                width: 1,
                height: 1,
                static: true,
            },
            { headers: { authorization: `Bearer ${adminToken}` } }
        );

        const mapResponse = await axios.post(
            `${BACKEND_URL}/api/v1/admin/map`,
            {
                thumbnail: "https://thumbnail.com/a.png",
                name: "Space",
                dimensions: "100x200",
                defaultElements: [],
            },
            { headers: { authorization: `Bearer ${adminToken}` } }
        );

        const avatarResponse = await axios.post(
            `${BACKEND_URL}/api/v1/admin/avatar`,
            {
                imageUrl:
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
                name: "Timmy",
            },
            { headers: { authorization: `Bearer ${adminToken}` } }
        );

        expect(elementResponse.status).toBe(200);
        expect(mapResponse.status).toBe(200);
        expect(avatarResponse.status).toBe(200);
    });

    test("Admin is able to update the imageUrl for an element", async () => {
        const elementResponse = await axios.post(
            `${BACKEND_URL}/api/v1/admin/element`,
            {
                imageUrl:
                    "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
                width: 1,
                height: 1,
                static: true,
            },
            { headers: { authorization: `Bearer ${adminToken}` } }
        );

        const updateElementResponse = await axios.put(
            `${BACKEND_URL}/api/v1/admin/element/${elementResponse.data.id}`,
            {
                imageUrl:
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            },
            { headers: { authorization: `Bearer ${adminToken}` } }
        );

        expect(updateElementResponse.status).toBe(200);
    });
});
