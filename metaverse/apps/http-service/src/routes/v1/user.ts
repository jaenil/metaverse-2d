import { Router } from 'express' ;
export const userRouter = Router() ;

userRouter.post('/metadata',async (req,res)=>{
    const avatarId = req.body.avatarId ;
    const token = req.body.authorization ;
    if(!avatarId){
        res.status(400).json({error:'avatarId not provided by user'}) ;
        return ;
    }  
    if(!token){
        res.status(400).json({error:'authorization token not provided by user'}) ;
        return ;
    }
    
})

userRouter.get('/metadata/bulk',(req,res)=>{
    
})

