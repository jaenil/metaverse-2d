import { Router } from 'express';
import { userRouter } from './user.js';
import { adminRouter } from './admin.js';
import { spaceRouter } from './space.js';
import { SigninSchema, SignupSchema } from "@repo/types";
import client from "@repo/db";
import { compare, hash } from '../../scrypt.js';
import jwt from "jsonwebtoken"
import { JWT_SECRET } from '../../config.js';
import { userMiddleware } from '../../middleware/user.js';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const router = Router();

//authentication

router.post('/signup', async (req, res) => {
    const parsedData = SignupSchema.safeParse(req.body)
    if (!parsedData.success) {
        return res.status(400).json({ message: "Invalid data" });
    }
    try {
        const hashedPassword = await hash(parsedData.data.password)  // BUG FIX: moved inside try — hash() errors were previously unhandled
        const user = await client.user.create({
            data: {
                username: parsedData.data.username,
                password: hashedPassword,
                email: parsedData.data.email ?? null,
                role: parsedData.data.type == 'admin' ? "Admin" : "User",
            }
        })
        res.status(200).json({ userId: user.id })
    } catch (e) {
        console.error("[SIGNUP ERROR]", e)
        res.status(400).json({ message: "user already exists" })
    }
})


router.post('/signin', async (req, res) => {
    const parsedData = SigninSchema.safeParse(req.body)
    if (!parsedData.success) {
        res.status(403).json({ message: "Validation failed" })
        return
    }

    try {
        // Support both username-based and email-based signin via the union schema
        const whereClause = 'email' in parsedData.data
            ? { email: parsedData.data.email }
            : { username: (parsedData.data as { username: string; password: string }).username };

        const user = await client.user.findUnique({ where: whereClause })
        if (!user) {
            res.status(403).json({ message: "Invalid username" })
            return
        }
        if (!user.password) {
            res.status(403).json({ message: "Account created with Google. Please sign in with Google." })
            return
        }
        const isValid = await compare(parsedData.data.password, user.password)
        if (!isValid) {
            res.status(403).json({ message: "Invalid password" })
            return
        }
        const token = jwt.sign({
            userId: user.id,
            role: user.role
        }, JWT_SECRET,{expiresIn:'15d'});
        res.status(200).json({ token: token })
    }
    catch (e) {
        console.error("[SIGNIN ERROR]", e)
        res.status(400).json({ message: "User doesn't exist" })
    }
})

router.post('/google-signin', async (req, res) => {
    const { credential } = req.body;
    if (!credential) {
        res.status(400).json({ message: "Missing Google credential" });
        return;
    }

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID as string,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            res.status(400).json({ message: "Invalid Google token payload" });
            return;
        }

        const email = payload.email as string;
        const googleId = payload.sub as string;

        // Check if user exists by email or googleId
        let user = await client.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { googleId: googleId }
                ]
            }
        });

        if (!user) {
            // Create a new user. Generate a unique username
            let baseUsername = email.split('@')[0] || 'user';
            let uniqueUsername: string = baseUsername;
            let counter = 1;
            while (await client.user.findUnique({ where: { username: uniqueUsername } })) {
                uniqueUsername = `${baseUsername}_${counter}`;
                counter++;
            }

            user = await client.user.create({
                data: {
                    username: uniqueUsername,
                    email: email,
                    googleId: googleId,
                    role: "User",
                }
            });
        } else if (!user.googleId) {
            // Link google account to existing user if email matched but googleId was empty
            user = await client.user.update({
                where: { id: user.id },
                data: { googleId: googleId }
            });
        }

        const token = jwt.sign({
            userId: user.id,
            role: user.role
        }, JWT_SECRET, { expiresIn: '15d' });

        res.status(200).json({ token: token, userId: user.id });
    } catch (e) {
        console.error("[GOOGLE SIGNIN ERROR]", e);
        res.status(401).json({ message: "Invalid Google token" });
    }
});

router.get('/elements', userMiddleware, async (req, res) => {
    try{
        const elements = await client.element.findMany({
        select: {
            id: true,
            imageUrl: true,
            width: true,
            height: true,
            static: true
        }
    })
    res.status(200).json({ elements: elements });
    }
    catch(e){
        console.error("[ELEMENTS ERROR]", e);
        res.status(500).json({ message: "Internal Server Error" })
    }
    
})

router.get('/avatars', async (req, res) => {
    try {
        const avatars = await client.avatar.findMany({
            select: {
                id: true,
                imageUrl: true,
                name: true
            }
        })
        res.status(200).json({ avatars: avatars });
    } catch (e) {
        console.error("[AVATARS ERROR]", e);
        res.status(500).json({ message: "Internal Server Error" })
    }
})

router.get('/maps', async (req, res) => {
    try {
        const maps = await client.map.findMany({
            select: {
                id: true,
                width: true,
                height: true,
                name: true,
                thumbnail: true,
                creator: {                  // <-- Add this nested select
                    select: {
                        id: true,
                        username: true
                    }
                }
            }
        })
        res.status(200).json({ maps: maps });
    } catch (e) {
        console.error("[MAPS ERROR]", e);
        res.status(500).json({ message: "Internal Server Error" })
    }
})

router.use('/user', userRouter);
router.use('/admin', adminRouter);
router.use('/space', spaceRouter);
