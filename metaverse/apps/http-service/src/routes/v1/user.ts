import { Router } from 'express' ;
import { userMiddleware } from '../../middleware/user.js';
import { UpdateMetadataSchema } from '../../types/index.js';
import client from "@repo/db" ;
export const userRouter = Router() ;

userRouter.post('/metadata',userMiddleware, async (req,res)=>{
    const parsedData = UpdateMetadataSchema.safeParse(req.body) 
    if(!parsedData.success){
        return res.status(400).json({message:"Invalid input"}) ;
    }
    if(!req.userId){
        return res.status(403).json({message:"Unauthorized"}) ;
    }
    // Validate that the avatar actually exists before linking it to the user
    const avatarExists = await client.avatar.findUnique({
        where: { id: parsedData.data.avatarId }
    })
    if(!avatarExists){
        return res.status(400).json({message:"Avatar not found"}) ;
    }
    await client.user.update({
        where:{
            id:req.userId
        },
        data:{
            avatarId:parsedData.data.avatarId
        }
    })
    return res.status(200).json({message:"metadata updated"}) ;
})

userRouter.get('/metadata/bulk',async (req,res)=>{
    const userIdString = (req.query.ids ??"[]") as string ;
    const userIds = (userIdString).slice(1,userIdString?.length-2).split(",") ;

    const metadata = await client.user.findMany({
        where:{
            id:{
                in:userIds
            }
        },select:{
            avatar:true,
            id:true
        }
    })
    res.json({
        avatars:metadata.map(m=>({
            userId:m.id,
            avatarId:m.avatar?.imageUrl 
        }))
    })
})

