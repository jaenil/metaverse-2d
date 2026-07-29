const { axios } = require("./axios");

const BACKEND_URL = "http://localhost:3000";

/**
 * Signs up and signs in a single admin user.
 * Returns { token, userId }
 */
async function createAdmin() {
    const username = `admin-${Math.random()}`;
    const password = "123456";

    const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
        username,
        password,
        type: "admin",
    });

    const signinResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
        username,
        password,
    });

    return {
        token: signinResponse.data.token,
        userId: signupResponse.data.userId,
    };
}

/**
 * Creates an admin + a regular user and returns tokens/ids for both.
 * Returns { adminToken, adminId, userToken, userId }
 */
async function createAdminAndUser() {
    const username = `admin-${Math.random()}`;
    const password = "123456";

    const adminSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
        username,
        password,
        type: "admin",
    });

    const adminSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
        username,
        password,
    });

    const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
        username: `${username}-user`,
        password,
        type: "user",
    });

    const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
        username: `${username}-user`,
        password,
    });

    return {
        adminToken: adminSigninResponse.data.token,
        adminId: adminSignupResponse.data.userId,
        userToken: userSigninResponse.data.token,
        userId: userSignupResponse.data.userId,
    };
}

/**
 * Creates two elements + a map using the given admin token.
 * Returns { element1Id, element2Id, mapId }
 */
async function createMapWithElements(adminToken) {
    const element1Response = await axios.post(
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

    const element2Response = await axios.post(
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

    const element1Id = element1Response.data.id;
    const element2Id = element2Response.data.id;

    const mapResponse = await axios.post(
        `${BACKEND_URL}/api/v1/admin/map`,
        {
            thumbnail: "https://thumbnail.com/a.png",
            dimensions: "100x200",
            name: "Test space",
            defaultElements: [
                { elementId: element1Id, x: 20, y: 20 },
                { elementId: element1Id, x: 18, y: 20 },
                { elementId: element2Id, x: 19, y: 20 },
            ],
        },
        { headers: { authorization: `Bearer ${adminToken}` } }
    );

    return {
        element1Id,
        element2Id,
        mapId: mapResponse.data.id,
    };
}

module.exports = { createAdmin, createAdminAndUser, createMapWithElements, BACKEND_URL };
