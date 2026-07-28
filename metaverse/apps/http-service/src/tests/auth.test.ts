import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../config.js', () => ({
    JWT_SECRET: 'test-secret'
}));

import request from 'supertest';
import express from 'express';
import { router } from '../routes/v1/index.js';
import client from '@repo/db';

// Mock the database client
vi.mock('@repo/db', () => ({
    default: {
        user: {
            findFirst: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        avatar: {
            findUnique: vi.fn(),
        }
    }
}));

// Stub google-auth-library so the /google-signin route import doesn't fail
vi.mock('google-auth-library', () => ({
    OAuth2Client: class {
        verifyIdToken = vi.fn();
    }
}));

const app = express();
app.use(express.json());
app.use('/api/v1', router);

// ─── /signup ──────────────────────────────────────────────────────────────────

describe('POST /signup', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should register a user with username + password only', async () => {
        (client.user.create as any).mockResolvedValue({ id: 'user-1', role: 'User' });

        const res = await request(app).post('/api/v1/signup').send({
            username: 'alice',
            password: 'secret123',
            type: 'user',
        });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('userId', 'user-1');
        expect(client.user.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    username: 'alice',
                    role: 'User',
                })
            })
        );
    });

    it('should register a user with username + password + email', async () => {
        (client.user.create as any).mockResolvedValue({ id: 'user-2', role: 'User' });

        const res = await request(app).post('/api/v1/signup').send({
            username: 'bob',
            password: 'secret123',
            email: 'bob@example.com',
            type: 'user',
        });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('userId', 'user-2');
        expect(client.user.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ email: 'bob@example.com' })
            })
        );
    });

    it('should return 400 for an invalid email format during signup', async () => {
        const res = await request(app).post('/api/v1/signup').send({
            username: 'charlie',
            password: 'secret123',
            email: 'not-an-email',
            type: 'user',
        });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Invalid data');
    });

    it('should return 400 when username already exists (duplicate signup)', async () => {
        (client.user.create as any).mockRejectedValue(new Error('Unique constraint on username'));

        const res = await request(app).post('/api/v1/signup').send({
            username: 'existing',
            password: 'pass',
            type: 'user',
        });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('user already exists');
    });

    it('should return 400 when email is already taken (duplicate email)', async () => {
        (client.user.create as any).mockRejectedValue(new Error('Unique constraint on email'));

        const res = await request(app).post('/api/v1/signup').send({
            username: 'newuser',
            password: 'pass',
            email: 'taken@example.com',
            type: 'user',
        });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('user already exists');
    });

    it('should return 400 when required fields are missing (no username)', async () => {
        const res = await request(app).post('/api/v1/signup').send({
            password: 'secret123',
            type: 'user',
        });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Invalid data');
    });
});

// ─── /signin ──────────────────────────────────────────────────────────────────

describe('POST /signin', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 403 for an unknown username', async () => {
        (client.user.findUnique as any).mockResolvedValue(null);

        const res = await request(app).post('/api/v1/signin').send({
            username: 'unknown-user',
            password: 'pass',
        });

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Invalid username');
    });

    it('should return 403 when signing in with an unknown email', async () => {
        (client.user.findUnique as any).mockResolvedValue(null);

        const res = await request(app).post('/api/v1/signin').send({
            email: 'nobody@example.com',
            password: 'pass',
        });

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Invalid username');
    });

    it('should return 403 when account was created with Google (no password — username lookup)', async () => {
        (client.user.findUnique as any).mockResolvedValue({
            id: 'google-user',
            username: 'googleuser',
            email: 'guser@gmail.com',
            password: null,
            role: 'User',
        });

        const res = await request(app).post('/api/v1/signin').send({
            username: 'googleuser',
            password: 'anything',
        });

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Account created with Google. Please sign in with Google.');
    });

    it('should return 403 when signing in by email on a Google-only account', async () => {
        (client.user.findUnique as any).mockResolvedValue({
            id: 'google-user-2',
            email: 'guser2@gmail.com',
            password: null,
            role: 'User',
        });

        const res = await request(app).post('/api/v1/signin').send({
            email: 'guser2@gmail.com',
            password: 'anything',
        });

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Account created with Google. Please sign in with Google.');
    });

    it('should return 403 for a wrong password', async () => {
        // Valid salt.hash format but the derivedKey won't match 'wrong-password'
        (client.user.findUnique as any).mockResolvedValue({
            id: 'user-3',
            username: 'dave',
            password: 'aabbccddeeff00112233445566778899.aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899',
            role: 'User',
        });

        const res = await request(app).post('/api/v1/signin').send({
            username: 'dave',
            password: 'wrong-password',
        });

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Invalid password');
    });

    it('should return 403 when body has neither username nor email', async () => {
        const res = await request(app).post('/api/v1/signin').send({
            password: 'pass',
        });

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('Validation failed');
    });

    it('should query DB with email field when email is provided', async () => {
        (client.user.findUnique as any).mockResolvedValue(null);

        await request(app).post('/api/v1/signin').send({
            email: 'lookup@example.com',
            password: 'pass',
        });

        expect(client.user.findUnique).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { email: 'lookup@example.com' }
            })
        );
    });

    it('should query DB with username field when username is provided', async () => {
        (client.user.findUnique as any).mockResolvedValue(null);

        await request(app).post('/api/v1/signin').send({
            username: 'lookup-user',
            password: 'pass',
        });

        expect(client.user.findUnique).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { username: 'lookup-user' }
            })
        );
    });
});
