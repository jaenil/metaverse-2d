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