import {Router} from 'express' ;
import { CreateSpaceSchema } from '../../types/index.js';
import client from "@repo/db" ;
import { adminMiddleware } from '../../middleware/admin.js';
import { userMiddleware } from '../../middleware/user.js';
export const spaceRouter = Router() ;

spaceRouter.post('/',userMiddleware,async (req,res)=> {
    const parsedData=CreateSpaceSchema.safeParse(req.body) ;
    if(!parsedData.success){
        return res.status(400).json({message:"Invalid input"}) ;
    }
    if(!parsedData.data.mapId){
        try{
            const space = await client.space.create({
                data:{
                    name:parsedData.data.name,
                    width:parsedData.data.dimensions.width,
                    height:parsedData.data.dimensions.height,
                    creatorId : req.userId as string 
                }
            })
            return res.status(200).json({spaceId:space.id})
        }
        catch(e){
            res.status(500).json({message:"Internal server error"}) ;
        }
    }
    else{
        try{
            const map = await client.map.findUnique({
                where:{
                    id:parsedData.data.mapId
                },select:{
                    mapElements:true ,
                    width:true,
                    height:true,
                }
            })
            if(!map){
                return res.status(400).json({message:"Map not found"}) ;
            }
            let space = await client.$transaction(async ()=>{
                const curr_space = await client.space.create({
                    data:{
                        name:parsedData.data.name,
                        width:map.width, //if map is present we will use maps dimension only
                        height:map.height,
                        creatorId:req.userId as string,
                    }
                });
                await client.spaceElements.createMany({
                    data:map.mapElements.map(e=>({
                        spaceId:curr_space.id,
                        elementId:e.elementId,
                        x:e.x!,
                        y:e.y !
                    }))
                })
                return curr_space ;
            })
            res.json({spaceId:space.id})
        }
        catch(e){
            res.status(500).json({message:"Internal server error"}) ;
        }
    }
    
})

spaceRouter.get('/all',(req,res)=>{
   
})

spaceRouter.get('/element',(req,res)=>{
   
})
spaceRouter.delete('/all',(req,res)=>{
   
})

spaceRouter.delete('/:spaceId',adminMiddleware,async (req,res)=>{
    const spaceId = req.params.spaceId as string;
    try{
        await client.space.delete({
        where:{
            id:spaceId
        }
    })
    return res.status(200).json({message:"Space deleted successfully"})
    }
    catch(e){
        res.status(500).json({message:"Internal server error"}) ;
    }
})

spaceRouter.get('/:spaceId',(req,res)=>{
    const spaceId = req.params.spaceId as string;
    
})