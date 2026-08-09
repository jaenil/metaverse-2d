const path = require("path");
// Load tests/.env before anything else so that DATABASE_URL / DIRECT_URL are
// available when @repo/db initialises its PrismaClient (which reads the env
// var at module-init time, not lazily).
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const { axios } = require("./axios");

// ─── Constants ──────────────────────────────────────────────────────────────
const BACKEND_URL        = "http://localhost:3000";
const WS_URL             = "ws://localhost:3001";
const INTERNAL_CACHE_URL = "http://localhost:3002";

const TEST_ELEMENT_IMAGE_URL = "https://test.placeholder.com/element.png";
const TEST_THUMBNAIL_URL     = "https://test.placeholder.com/thumbnail.png";

// ─── Tier 1: Atomic Primitives ───────────────────────────────────────────────

/**
 * Creates and signs in a single user of a given role.
 * Uses a 'test-' prefix so records can be safely identified during teardown.
 *
 * @param {'admin'|'user'} role
 * @param {string} usernamePrefix - e.g. 'test-admin' or 'test-user'
 * @returns {{ token: string, userId: string, username: string }}
 */
async function createUser(role, usernamePrefix) {
    const username = `${usernamePrefix}-${Math.random().toString(36).substring(2)}`;
    const password = "123456";

    const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
        username,
        password,
        type: role,
    });

    const signinResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
        username,
        password,
    });

    return {
        token:  signinResponse.data.token,
        userId: signupResponse.data.userId,
        username,
    };
}

/**
 * Creates one element using the provided admin token.
 * Always uses TEST_ELEMENT_IMAGE_URL so teardown can identify it.
 *
 * @param {string} adminToken
 * @returns {string} elementId
 */
async function createElement(adminToken) {
    const response = await axios.post(
        `${BACKEND_URL}/api/v1/admin/element`,
        {
            imageUrl: TEST_ELEMENT_IMAGE_URL,
            width:    1,
            height:   1,
            static:   true,
        },
        { headers: { authorization: `Bearer ${adminToken}` } }
    );
    return response.data.id;
}

/**
 * Creates a map with two elements as default placements.
 * Name is prefixed with 'test-map' for teardown identification.
 *
 * @param {string} adminToken
 * @param {string} element1Id
 * @param {string} element2Id
 * @returns {string} mapId
 */
async function createMap(adminToken, element1Id, element2Id) {
    const response = await axios.post(
        `${BACKEND_URL}/api/v1/admin/map`,
        {
            thumbnail: TEST_THUMBNAIL_URL,
            dimensions: "100x200",
            name: `test-map-${Math.random().toString(36).substring(2)}`,
            defaultElements: [
                { elementId: element1Id, x: 20, y: 20 },
                { elementId: element1Id, x: 18, y: 20 },
                { elementId: element2Id, x: 19, y: 20 },
            ],
        },
        { headers: { authorization: `Bearer ${adminToken}` } }
    );
    return response.data.id;
}

/**
 * Creates a space from a map, owned by the given user token.
 *
 * @param {string} token - Token of the user creating the space
 * @param {string} mapId
 * @param {string} [dimensions="100x200"]
 * @returns {string} spaceId
 */
async function createSpace(token, mapId, dimensions = "100x200") {
    const response = await axios.post(
        `${BACKEND_URL}/api/v1/space`,
        {
            name: `test-space-${Math.random().toString(36).substring(2)}`,
            dimensions,
            mapId,
        },
        { headers: { authorization: `Bearer ${token}` } }
    );
    return response.data.spaceId;
}

// ─── Tier 2: Composed Helpers (Backward-Compatible) ──────────────────────────

/**
 * Creates and signs in a single admin user.
 * Thin wrapper over createUser for backward compatibility.
 *
 * @returns {{ token: string, userId: string }}
 */
async function createAdmin() {
    const { token, userId } = await createUser("admin", "test-admin");
    return { token, userId };
}

/**
 * Creates and signs in one admin and one regular user in parallel.
 *
 * @returns {{ adminToken, adminId, userToken, userId }}
 */
async function createAdminAndUser() {
    const [admin, user] = await Promise.all([
        createUser("admin", "test-admin"),
        createUser("user",  "test-user"),
    ]);
    return {
        adminToken: admin.token,
        adminId:    admin.userId,
        userToken:  user.token,
        userId:     user.userId,
    };
}

/**
 * Creates two elements in parallel, then creates a map linking them.
 * Backward-compatible: accepts adminToken as a parameter.
 *
 * @param {string} adminToken
 * @returns {{ element1Id, element2Id, mapId }}
 */
async function createMapWithElements(adminToken) {
    const [element1Id, element2Id] = await Promise.all([
        createElement(adminToken),
        createElement(adminToken),
    ]);
    const mapId = await createMap(adminToken, element1Id, element2Id);
    return { element1Id, element2Id, mapId };
}

/**
 * Creates a user with email+password sign-in support.
 * Unchanged from original — email-based login tests need this exact shape.
 *
 * @param {'admin'|'user'} role
 * @param {string|null} customEmail
 * @returns {{ signupResponse, signinResponse, token, userId, email, username, password }}
 */
async function createUserWithEmail(role = "user", customEmail = null) {
    const username = `test-user-${Math.random().toString(36).substring(7)}`;
    const password = "123456";
    const email    = customEmail || `${username}@test.com`;

    const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
        username,
        password,
        email,
        type: role,
    });

    const signinResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
        email,
        password,
    });

    return {
        signupResponse,
        signinResponse,
        token:    signinResponse.data.token,
        userId:   signupResponse.data.userId,
        email,
        username,
        password,
    };
}

// ─── Tier 3: Context Factory ──────────────────────────────────────────────────

/**
 * Creates a full test context: admin + user + 2 elements + map + optional space.
 * This is the single function that replaces repetitive beforeAll boilerplate.
 *
 * @param {{ withSpace?: boolean, dimensions?: string }} [options]
 * @returns {{ adminToken, adminId, userToken, userId, element1Id, element2Id, mapId, spaceId }}
 */
async function createTestContext({ withSpace = false, dimensions = "100x200" } = {}) {
    const { adminToken, adminId, userToken, userId } = await createAdminAndUser();
    const { element1Id, element2Id, mapId }          = await createMapWithElements(adminToken);

    let spaceId = null;
    if (withSpace) {
        // Space is created by the regular user (not admin) — matches real app logic
        spaceId = await createSpace(userToken, mapId, dimensions);
    }

    return { adminToken, adminId, userToken, userId, element1Id, element2Id, mapId, spaceId };
}

// ─── Teardown ─────────────────────────────────────────────────────────────────

/**
 * Safety via Filtering:
 *   - Users:   filtered by username prefix 'test-'.  Real users untouched.
 *   - Elements: filtered by TEST_ELEMENT_IMAGE_URL sentinel. Real elements untouched.
 *   - Avatars: filtered by name prefix 'test-'. Real avatars untouched.

 */
async function cleanupTestArtifacts() {
    const db     = await import("@repo/db");
    const client = db.default || db;

    // 1. Delete test users.
    //    CASCADE via DB FK: User → Space → SpaceElements (automatic)
    //    CASCADE via DB FK: User → Map  → MapElements  (automatic)
    await client.user.deleteMany({
        where: { username: { startsWith: "test-" } },
    });

    // 2. Delete test elements (not user-owned, not cascade-deleted).
    //    Safe: real elements never use TEST_ELEMENT_IMAGE_URL.
    await client.element.deleteMany({
        where: { imageUrl: TEST_ELEMENT_IMAGE_URL },
    });

    // 3. Delete test avatars (not user-owned, not cascade-deleted).
    //    Safe: user FK references are already gone after step 1.
    await client.avatar.deleteMany({
        where: { name: { startsWith: "test-" } },
    });
    
}

module.exports = {
    // Tier 1 — Atomic
    createUser,
    createElement,
    createMap,
    createSpace,
    // Tier 2 — Composed (backward-compatible)
    createAdmin,
    createAdminAndUser,
    createMapWithElements,
    createUserWithEmail,
    // Tier 3 — Factory
    createTestContext,
    // Teardown
    cleanupTestArtifacts,
    // Constants
    BACKEND_URL,
    WS_URL,
    INTERNAL_CACHE_URL,
    TEST_ELEMENT_IMAGE_URL,
};
