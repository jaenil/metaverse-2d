const { axios } = require("./helpers/axios");
const { createAdmin, BACKEND_URL } = require("./helpers/setup");

describe("User metadata endpoint", () => {
    let token;
    let avatarId;

    beforeAll(async () => {
        const admin = await createAdmin();
        token = admin.token;

        const avatarResponse = await axios.post(
            `${BACKEND_URL}/api/v1/admin/avatar`,
            {
                imageUrl:
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
                name: "Timmy",
            },
            { headers: { authorization: `Bearer ${token}` } }
        );

        avatarId = avatarResponse.data.avatarId;
    });

    test("User cant update their metadata with a wrong avatar id", async () => {
        const response = await axios.post(
            `${BACKEND_URL}/api/v1/user/metadata`,
            { avatarId: "123123123" },
            { headers: { authorization: `Bearer ${token}` } }
        );
        expect(response.status).toBe(400);
    });

    test("User can update their metadata with the right avatar id", async () => {
        const response = await axios.post(
            `${BACKEND_URL}/api/v1/user/metadata`,
            { avatarId },
            { headers: { authorization: `Bearer ${token}` } }
        );
        expect(response.status).toBe(200);
    });

    test("User is not able to update their metadata if the auth header is not present", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId,
        });
        expect(response.status).toBe(403);
    });
});
