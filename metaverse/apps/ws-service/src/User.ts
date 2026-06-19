import {WebSocket} from "ws";
import jwt from "jsonwebtoken";
import type {JwtPayload} from "jsonwebtoken";
import { JWT_PASSWORD } from './config.js';
import {RoomManager} from "./RoomManager.js"
import client from "@repo/db"
import type { OutgoingMessage } from "./types.js";

export class User{
    private ws:WebSocket;
    public x:number;
    public y:number;
    public spaceId?:string;

    public id:string;
    constructor(ws:WebSocket){
        this.id = '';
        this.x = 0 ;
        this.y = 0;
        this.ws = ws ;
    }

    async handleMessage (data:WebSocket.RawData){
        let parsedData;
        try{
            parsedData = JSON.parse(data.toString()) ;
        }
        catch{
            this.send({
                type:"event-rejected",
            })
            return ;
        }
        switch(parsedData.type){
            case "join":
                const spaceId=parsedData.payload.spaceId ;
                //verify user from payload.token
                const token = parsedData.payload.token ;
                try{
                    const userId = (jwt.verify(token,JWT_PASSWORD) as JwtPayload).userId
                    this.id = userId ;
                }   
                catch(e){
                        this.ws.close() 
                        return
                }
                
                const space = await client.space.findFirst({
                    where:{
                        id:spaceId
                    }
                })
                if(!space) return ;
                this.spaceId =spaceId 
                
                this.x = Math.floor(Math.random() * space?.width! );
                this.y = Math.floor(Math.random() * space?.height! );
                this.send({
                    type:"space-joined",
                    payload:{
                        spawn:{
                            x: this.x,
                            y: this.y,
                        },
                        users: RoomManager.getInstance().rooms.get(spaceId)?.map((usr) =>({
                            id:usr.id,
                            x:usr.x,
                            y:usr.y 
                        })) ?? []
                    }
                })
                RoomManager.getInstance().addUser(spaceId,this) ;
                RoomManager.getInstance().broadcast({
                    type:"user-join",
                    payload:{
                        x:this.x,
                        y:this.y ,
                        userId:this.id
                    }
                },this,this.spaceId!)
                break
            case "move":
                if(!this.spaceId) return ;
                const x = parsedData.payload.x ;
                const y = parsedData.payload.y ;
                //handle movement logic here 
                const disX = Math.abs(this.x - x) ;
                const disY = Math.abs(this.y - y) ;
                if((disX == 1 && disY == 0)||(disX == 0&& disY ==1)){
                    //TODO:ou cannot break out of an outer function from inside a .forEach(). You should either:
                    //Use a standard for...of loop so you can use break or continue.
                    //Use an array method like .some() or .find() to check if a collision exists, and wrap the movement logic in an if (!collisionFound) block.

                    const collision = RoomManager.getInstance().rooms.get(this.spaceId!)?.find((u)=>{
                        return u.x===x && u.y===y
                    })
                    if(collision){
                        this.send({
                            type:"movement-rejected",
                            payload:{
                                x:this.x ,
                                y:this.y 
                            }
                        })
                        return;
                    }
                    this.x = x;
                    this.y = y;
                    RoomManager.getInstance().broadcast({
                        type:"movement",
                        payload:{
                            x:this.x ,
                            y:this.y ,
                            userId:this.id
                        }
                    },this,this.spaceId!)
                }
                else{
                    this.send({
                        type:"movement-rejected",
                        payload:{
                            x:this.x ,
                            y:this.y 
                        }
                    })
                }
        }
    }
    destroy(){
        RoomManager.getInstance().broadcast({
            type:"user-left",
            payload:{
                userId:this.id
            }
        },this,this.spaceId!)
        RoomManager.getInstance().removeUser(this,this.spaceId!)
    }
    send(payload:OutgoingMessage){
        this.ws.send(JSON.stringify(payload)) ;
    }
}