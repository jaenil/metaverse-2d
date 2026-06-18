import { Router } from 'express';
import { userRouter } from './user.js';
import { adminRouter } from './admin.js';
import { spaceRouter } from './space.js';
import { SigninSchema, SignupSchema } from "../../types/index.js";
import client from "@repo/db";
import { compare, hash } from '../../scrypt.js';

import jwt from "jsonwebtoken"
import { JWT_PASSWORD } from '../../config.js';
import { userMiddleware } from '../../middleware/user.js';

export const router = Router();

//authentication

router.post('/signup', async (req, res) => {
    const parsedData = SignupSchema.safeParse(req.body)
    if (!parsedData.success) {
        return res.status(400).json({ message: "Invalid data" });
    }
    const hashedPassword = await hash(parsedData.data.password)
    try {
        const user = await client.user.create({
            data: {
                username: parsedData.data.username,
                password: hashedPassword,
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
        const user = await client.user.findUnique({
            where: {
                username: parsedData.data.username,
            }
        })
        if (!user) {
            res.status(403).json({ message: "Invalid username" })
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
        }, JWT_PASSWORD);
        res.status(200).json({ token: token })
    }
    catch (e) {
        console.error("[SIGNIN ERROR]", e)
        res.status(400).json({ message: "User doesn't exist" })
    }
})

router.get('/elements', userMiddleware, async (req, res) => {
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
})

router.get('/avatars', async (req, res) => {
    const avatars = await client.avatar.findMany({
        select: {
            id: true,
            imageUrl: true,
            name: true
        }
    })
    res.status(200).json({ avatars: avatars });
})

router.get('/maps', async (req, res) => {
    const maps = await client.map.findMany({
        select: {
            id: true,
            width: true,
            height: true,
            name: true,
            thumbnail: true
        }
    })
    res.status(200).json({ maps: maps });
})

router.use('/user', userRouter);
router.use('/admin', adminRouter);
router.use('/space', spaceRouter);
