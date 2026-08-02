const { axios } = require("./helpers/axios");
const { BACKEND_URL, createUserWithEmail } = require("./helpers/setup");

describe("Authentication", () => {
    test("User is able to sign up only once", async () => {
        const username = `kirat-${Math.random()}`;
        const password = "123456";

        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin",
        });
        expect(response.status).toBe(200);

        const updatedResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin",
        });
        expect(updatedResponse.status).toBe(400);
    });

    test("Signup request fails if the username is empty", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            password: "123456",
        });
        expect(response.status).toBe(400);
    });

    test("Signin succeeds if the username and password are correct", async () => {
        const username = `kirat-${Math.random()}`;
        const password = "123456";

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin",
        });

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password,
        });

        expect(response.status).toBe(200);
        expect(response.data.token).toBeDefined();
    });

    test("Signin fails if the username and password are incorrect", async () => {
        const username = `kirat-${Math.random()}`;
        const password = "123456";

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin",
        });

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: "WrongUsername",
            password,
        });
        expect(response.status).toBe(403);
    });

    test("User can signup with an optional email", async () => {
        const { signupResponse, signinResponse, token, userId, email } = await createUserWithEmail("user");
        expect(signupResponse.status).toBe(200);
        expect(signinResponse.status).toBe(200);
        expect(token).toBeDefined();
        expect(userId).toBeDefined();
        expect(email).toBeDefined();
    });

    test("Signup fails when using a duplicate email address", async () => {
        const uniqueEmail = `dup-${Math.random().toString(36).substring(7)}@example.com`;
        
        // Create 1st user with email
        const user1 = await createUserWithEmail("user", uniqueEmail);
        expect(user1.signupResponse.status).toBe(200);

        // Attempt 2nd signup with same email
        const user2 = await createUserWithEmail("user", uniqueEmail);
        expect(user2.signupResponse.status).toBe(400);
        expect(user2.signupResponse.data.message).toBe("user already exists");
    });

    test("Signup fails when using a invalid email address",async() =>{
        const username = `user-${Math.random().toString(36).substring(7)}`;
        const password = "123456";
        const email = "invalid-email";
        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            email:email,
            type: "user",
        });
        expect(signupResponse.status).toBe(400);
        expect(signupResponse.data.message).toBe("Invalid data");
    });

    test("User can sign in using email and password", async () => {
        const { email, password } = await createUserWithEmail("user");
        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            email,
            password,
        });
        expect(response.status).toBe(200);
        expect(response.data.token).toBeDefined();
        expect(response.data.userId).toBeDefined();
        expect(response.data.role).toBe("user");
    });

    test("Signin with email fails with an incorrect password", async () => {
        const { email } = await createUserWithEmail("user");
        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            email,
            password: "wrongpassword",
        });
        expect(response.status).toBe(403);
    });

});

describe("Google Authentication", () => {
    test("Google signin fails when credential field is missing", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/google-signin`, {});

        expect(response.status).toBe(400);
        expect(response.data.message).toBe("Missing Google credential");
    });

    test("Google signin fails when an invalid/garbage token is provided", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/google-signin`, {
            credential: "fake-invalid-google-token-12345",
        });

        expect(response.status).toBe(401);
        expect(response.data.message).toBe("Invalid Google token");
    });

    // TODO: Google auth token ko mock karna zaroori hai is test ke liye
    // Abhi ke liye isko skip (xtest) kar rahe hain
    xtest("Password-based signin fails on Google-only account with 403", async () => {
        // 1. Ek Google account DB me insert karenge (ya google-signin se mock karke banayenge)
        // 2. Uske email se normal /signin API call karenge password daal ke
        // 3. Expected: response.status === 403, response.data.message === "Account created with Google. Please use Google Sign-In."
    });
});
