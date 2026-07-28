import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../config.js', () => ({
    JWT_SECRET: 'test-secret'
}));

// vi.hoisted() runs before vi.mock factories, so the spy is available when the mock factory executes
const { mockVerifyIdToken } = vi.hoisted(() => ({
    mockVerifyIdToken: vi.fn()
}));

vi.mock('google-auth-library', () => ({
    OAuth2Client: class {
        verifyIdToken = mockVerifyIdToken;
    }
}));

import request from 'supertest';
import express from 'express';
import { router } from '../routes/v1/index.js';
import client from '@repo/db';

// Mock dependencies
vi.mock('@repo/db', () => ({
    default: {
        user: {
            findFirst: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn()
        }
    }
}));

const app = express();
app.use(express.json());
app.use('/api/v1', router);

describe('Google Authentication Routes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return 400 if google credential is missing', async () => {
        const res = await request(app).post('/api/v1/google-signin').send({});
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Missing Google credential');
    });

    it('should return 401 if Google token is invalid or rejected by Google', async () => {
        mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));
        const res = await request(app)
            .post('/api/v1/google-signin')
            .send({ credential: 'bad-token' });
            
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Invalid Google token');
    });

    it('should return 400 if Google token payload is missing email (Edge Case 1)', async () => {
        mockVerifyIdToken.mockResolvedValue({
            getPayload: () => ({ sub: '123' }) // No email
        });

        const res = await request(app)
            .post('/api/v1/google-signin')
            .send({ credential: 'valid-token-no-email' });
            
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Invalid Google token payload');
    });

    it('should create a new user and return JWT for a valid Google token (New User)', async () => {
        mockVerifyIdToken.mockResolvedValue({
            getPayload: () => ({ email: 'test@gmail.com', sub: 'google-123' })
        });
        
        (client.user.findFirst as any).mockResolvedValue(null);
        (client.user.findUnique as any).mockResolvedValue(null);
        (client.user.create as any).mockResolvedValue({
            id: 'new-user-id',
            role: 'User'
        });

        const res = await request(app)
            .post('/api/v1/google-signin')
            .send({ credential: 'good-token' });
            
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('userId');
        expect(res.body.userId).toBe('new-user-id');
        expect(client.user.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ email: 'test@gmail.com', googleId: 'google-123' })
        }));
    });

    it('should login an existing user and return JWT (Existing User)', async () => {
        mockVerifyIdToken.mockResolvedValue({
            getPayload: () => ({ email: 'test@gmail.com', sub: 'google-123' })
        });
        
        (client.user.findFirst as any).mockResolvedValue({
            id: 'existing-id',
            googleId: 'google-123',
            role: 'User'
        });

        const res = await request(app)
            .post('/api/v1/google-signin')
            .send({ credential: 'good-token' });
            
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('userId');
        expect(res.body.userId).toBe('existing-id');
        expect(client.user.create).not.toHaveBeenCalled();
        expect(client.user.update).not.toHaveBeenCalled();
    });

    it('should handle username conflicts gracefully when creating a new user (Edge Case 3)', async () => {
        mockVerifyIdToken.mockResolvedValue({
            getPayload: () => ({ email: 'test@gmail.com', sub: 'google-123' })
        });
        
        (client.user.findFirst as any).mockResolvedValue(null);
        
        (client.user.findUnique as any)
            .mockResolvedValueOnce({ id: 'some-id' }) // test taken
            .mockResolvedValueOnce({ id: 'some-id' }) // test_1 taken
            .mockResolvedValueOnce(null);             // test_2 free
            
        (client.user.create as any).mockResolvedValue({
            id: 'new-user-id',
            role: 'User'
        });

        const res = await request(app)
            .post('/api/v1/google-signin')
            .send({ credential: 'good-token' });
            
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('userId');
        expect(client.user.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ username: 'test_2' })
        }));
    });
});
