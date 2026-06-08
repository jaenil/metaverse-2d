import { Router } from 'express' ;
import { userRouter } from './user.js';
import { adminRouter } from './admin.js';
import { spaceRouter } from './space.js';

export const router = Router() ;

//authentication

router.post('/signup',(req,res)=>{
    const username = req.body.username ;
    const password = req.body.password ;
    const type = req.body.type ;
    
    if(!username || !password || !type){
        res.status(400).json({message : "Please provide all the required fields"}) ;
    }
    //db logic to create user
    const userId = "12345" ; //dummy user id
    return res.status(200).json({message : "User created successfully", userId}) ;
})

router.post('/signin',(req,res)=>{
    // const username = req.body.username ;
    // const password = req.body.password ;


    // //db logic to authenticate user

    // //dummy authentication logic
    // if(username !== "testuser" || password !== "testpassword"){
    //     return res.status(401).json({message : "Invalid credentials"}) ;
    // }
    const token= "dummy_token" ; //dummy token
    return res.status(200).json({message : "User authenticated successfully", token}) ;
})

router.get('/elements',(req,res)=>{

})

router.get('/avatars',(req,res)=>{

})

router.use('/user',userRouter) ;
router.use('/admin',adminRouter) ;
router.use('/space',spaceRouter) ;
