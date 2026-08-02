//middleware for getting user id from json web token 
import type { NextFunction, Request, Response } from "express"
import { JWT_SECRET } from "../config.js"
import jwt from "jsonwebtoken"
 
export const userMiddleware = async (req:Request, res:Response, next:NextFunction) => {
    const header = req.headers["authorization"]
    const token = header?.split(" ")[1]
    if(!token) {
        res.status(403).json({message:"Unauthorized access"})
        return 
    }
    try{
        const verifiedUser = jwt.verify(token,JWT_SECRET) as {userId:string,role:string}
        req.userId = verifiedUser.userId 
        next()
    }
    catch(e){
        res.status(401).json({message:"Unauthorized "})
        return 
    }
}
    
    