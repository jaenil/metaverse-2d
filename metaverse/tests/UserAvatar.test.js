const { axios } = require("./helpers/axios");
const { createAdmin, BACKEND_URL } = require("./helpers/setup");

describe("User avatar information", () => {
    let avatarId;
    let token;
    let userId;

    beforeAll(async () => {
        const admin = await createAdmin();
        token = admin.token;
        userId = admin.userId;

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

        // Set the avatar on this user so the bulk endpoint returns it
        await axios.post(
            `${BACKEND_URL}/api/v1/user/metadata`,
            { avatarId },
            { headers: { authorization: `Bearer ${token}` } }
        );
    });

    test("Get back avatar information for a user", async () => {
        const response = await axios.get(
            `${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`
        );
        expect(response.data.avatars.length).toBe(1);
        expect(response.data.avatars[0].userId).toBe(userId);
    });

    test("Available avatars lists the recently created avatar", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`);
        expect(response.data.avatars.length).not.toBe(0);
        const currentAvatar = response.data.avatars.find((x) => x.id === avatarId);
        expect(currentAvatar).toBeDefined();
    });
});
