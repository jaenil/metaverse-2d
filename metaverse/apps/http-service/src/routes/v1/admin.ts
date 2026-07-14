import {Router} from 'express' ;
import { adminMiddleware } from '../../middleware/admin.js';
import { CreateAvatarSchema, CreateElementSchema, CreateMapSchema, UpdateElementSchema } from '../../types/index.js';
import client from "@repo/db" ;

export const adminRouter = Router() ;

adminRouter.post('/element', adminMiddleware, async (req, res) => {
    const parsedData = CreateElementSchema.safeParse(req.body)
    if (!parsedData.success) {
        return res.status(400).json({ message: "Invalid data" })
    }
    const element = await client.element.create({
        data: {
            imageUrl: parsedData.data.imageUrl,
            width: parsedData.data.width,
            height: parsedData.data.height,
            static: parsedData.data.static,
        }
    })
    return res.json({ id: element.id })
})

adminRouter.put('/element/:elementId', adminMiddleware, async (req, res) => {
    const parsedData = UpdateElementSchema.safeParse(req.body)
    if (!parsedData.success) {
        return res.status(400).json({ message: "Invalid data" })
    }
    if(typeof req.params.elementId !== "string"){
        return res.status(400).json({ message: "Invalid element id" })
    }
    await client.element.update({
        where: { id: req.params.elementId },
        data: { imageUrl: parsedData.data.imageUrl }
    })
    return res.json({ message: "Element updated" })
})

adminRouter.delete('/element/:elementId', adminMiddleware, async (req, res) => {
    try {
        const elementId = req.params.elementId as string;
        
        // 1. Remove element from all spaces and maps first
        await client.mapElements.deleteMany({
            where: { elementId }
        });
        await client.spaceElements.deleteMany({
            where: { elementId }
        });

        // 2. Delete the element itself
        await client.element.delete({
            where: { id: elementId }
        });

        res.status(200).json({ message: "Element deleted" });
    } catch (e) {
        console.error("Element delete error", e);
        res.status(500).json({ message: "Failed to delete element" });
    }
})

adminRouter.post('/avatar', adminMiddleware, async (req, res) => {
    const parsedData = CreateAvatarSchema.safeParse(req.body)
    if (!parsedData.success) {
        return res.status(400).json({ message: "Invalid data" })
    }
    const avatar = await client.avatar.create({
        data: {
            imageUrl: parsedData.data.imageUrl,
            name: parsedData.data.name,
        }
    })
    return res.json({ avatarId: avatar.id })
})

adminRouter.post('/map', adminMiddleware, async (req, res) => {
    const parsedData = CreateMapSchema.safeParse(req.body)
    if (!parsedData.success) {
        return res.status(400).json({ message: "Invalid data" })
    }
    const map = await client.map.create({
        data: {
            name: parsedData.data.name ?? "Untitled",
            width: parsedData.data.dimensions.width,
            height: parsedData.data.dimensions.height,
            thumbnail: parsedData.data.thumbnail,
            creatorId: req.userId as string,
            mapElements:{
                create: parsedData.data.defaultElements.map((el) => ({
                    elementId:el.elementId,
                    x:el.x,
                    y:el.y
                }))
            }
        }
    })
    return res.json({ id: map.id })
})

adminRouter.delete('/avatar/:avatarId', adminMiddleware, async (req, res) => {
    try {
        const avatarId = req.params.avatarId as string;
        
        // 1. Remove this avatar from any users currently using it
        await client.user.updateMany({
            where: { avatarId },
            data: { avatarId: null }
        });

        // 2. Delete the avatar
        await client.avatar.delete({
            where: { id: avatarId }
        });

        res.status(200).json({ message: "Avatar deleted" });
    } catch (e) {
        console.error("Avatar delete error", e);
        res.status(500).json({ message: "Failed to delete avatar" });
    }
})

adminRouter.delete('/map/:mapId', adminMiddleware, async (req, res) => {
    try {
        const mapId = req.params.mapId as string;

        // 1. Delete all map elements associated with this map
        await client.mapElements.deleteMany({
            where: { mapId }
        });

        // 2. Delete the map itself
        await client.map.delete({
            where: { id: mapId }
        });

        res.status(200).json({ message: "Map deleted" });
    } catch (e) {
        console.error("Map delete error", e);
        res.status(500).json({ message: "Failed to delete map" });
    }
})