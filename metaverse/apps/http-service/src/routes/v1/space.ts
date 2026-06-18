import { Router } from 'express';
import { CreateSpaceSchema, AddElementSchema, DeleteElementSchema } from '../../types/index.js';
import client from "@repo/db";
import { adminMiddleware } from '../../middleware/admin.js';
import { userMiddleware } from '../../middleware/user.js';
import { parse } from 'dotenv';
export const spaceRouter = Router();

spaceRouter.post('/', userMiddleware, async (req, res) => {
    const parsedData = CreateSpaceSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({ message: "Invalid input" });
    }
    if (!parsedData.data.mapId) {
        try {
            const space = await client.space.create({
                data: {
                    name: parsedData.data.name,
                    width: parsedData.data.dimensions.width,
                    height: parsedData.data.dimensions.height,
                    creatorId: req.userId as string
                }
            })
            return res.status(200).json({ spaceId: space.id })
        }
        catch (e) {
            res.status(500).json({ message: "Internal server error" });
        }
    }
    else {
        try {
            const map = await client.map.findUnique({
                where: {
                    id: parsedData.data.mapId
                }, select: {
                    mapElements: true,
                    width: true,
                    height: true,
                }
            })
            if (!map) {
                return res.status(400).json({ message: "Map not found" });
            }
            let space = await client.$transaction(async () => {
                const curr_space = await client.space.create({
                    data: {
                        name: parsedData.data.name,
                        width: map.width, //if map is present we will use maps dimension only
                        height: map.height,
                        creatorId: req.userId as string,
                    }
                });
                await client.spaceElements.createMany({
                    data: map.mapElements.map(e => ({
                        spaceId: curr_space.id,
                        elementId: e.elementId,
                        x: e.x!,
                        y: e.y!
                    }))
                })
                return curr_space;
            })
            res.json({ spaceId: space.id })
        }
        catch (e) {
            res.status(500).json({ message: "Internal server error" });
        }
    }

})

spaceRouter.get('/all', userMiddleware, async (req, res) => {
    try {
        const spaces = await client.space.findMany({
            where: {
                creatorId: req.userId as string,
            }, select: {
                id: true,
                name: true,
                width: true,
                height: true,
                thumbnail: true,
            }
        })
        res.status(200).json({ spaces: spaces })
    }
    catch (e) {
        res.status(500).json({ message: "Internal server error", error: e });
    }
})

spaceRouter.post('/element', userMiddleware, async (req, res) => {
    const parsedData = AddElementSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({ message: "Invalid input" });
    }
    const space = await client.space.findUnique({
        where: {
            id: parsedData.data.spaceId,
            creatorId: req.userId!
        }, select: {
            width: true,
            height: true
        }
    })
    if (!space) return res.status(404).json({ message: "Space not found" })
    if (parsedData.data.x < 0 || parsedData.data.y < 0 || parsedData.data.x > space.width || parsedData.data.y > space.height) {
        return res.status(400).json({ message: "Element out of bounds" })
    }
    //do not allow element to b3e added if there already exists an element in the same x and y
    const existingElement = await client.spaceElements.findFirst({
        where: {
            x: parsedData.data.x,
            y: parsedData.data.y,
            spaceId:parsedData.data.spaceId
        }
    })
    if (existingElement) {
        return res.status(400).json({ message: "there already exists an element at that particular position" }); //this needs to be discussed.
    }
    const element = await client.spaceElements.create({
        data: {
            spaceId: parsedData.data.spaceId,
            elementId: parsedData.data.elementId,
            x: parsedData.data.x,
            y: parsedData.data.y,
        }
    })
    res.status(200).json({ element })
})

spaceRouter.delete('/element', userMiddleware, async (req, res) => {
    const parsedData = DeleteElementSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({ message: "Invalid input" });
    }
    const space = await client.space.findUnique({
        where: {
            id: parsedData.data.spaceId
        }, select: {
            creatorId: true,
        }
    })
    if (!space) return res.status(404).json({ message: "space not found" });
    if (space.creatorId != req.userId) return res.status(403).json({ message: "Unauthorised" });
    try {
        const element = await client.spaceElements.delete({
            where: {
                id: parsedData.data.elementId,
                spaceId: parsedData.data.spaceId
            }
        })
        if (!element) {
            return res.status(404).json({ message: "Element not found" })
        }
        return res.status(200).json({ message: "Element deleted successfully" })
    }
    catch (e) {
        res.status(500).json({ message: "Internal server error", error: e });
    }
})

spaceRouter.delete('/:spaceId', userMiddleware, async (req, res) => {
    const spaceId = req.params.spaceId as string;
    try {
        const space = await client.space.findUnique({
            where: {
                id: spaceId
            }, select: {
                creatorId: true,
            }
        })
        if (!space) return res.status(404).json({ message: "Space not found" })
        if (space?.creatorId != req.userId) {
            return res.status(403).json({ message: "Unauthorised" })
        }
        await client.space.delete({
            where: {
                id: spaceId
            }
        })
        return res.status(200).json({ message: "Space deleted successfully" })
    }
    catch (e) {
        res.status(500).json({ message: "Internal server error" });
    }
})

spaceRouter.get('/:spaceId', userMiddleware, async (req, res) => {
    const spaceId = req.params.spaceId as string;
    const space = await client.space.findUnique({
        where: {
            id: spaceId,
        }, select: {
            id: true,
            name: true,
            width: true,
            height: true,
            thumbnail: true,
        }
    })
    if (!space) {
        return res.status(404).json({ message: "Space not found" })
    }
    const space_elements = await client.spaceElements.findMany({
        where: {
            spaceId: spaceId,
        }, select: {
            id: true,
            element: true,
            x: true,
            y: true,
        }
    })
    return res.status(200).json({ space, elements: space_elements })
})
