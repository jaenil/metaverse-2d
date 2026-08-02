import {WebSocket} from "ws";
import jwt from "jsonwebtoken";
import type {JwtPayload} from "jsonwebtoken";
import { JWT_SECRET } from './config.js';
import {RoomManager} from "./RoomManager.js"
import client from "@repo/db"
import type { ServerMessage } from "@repo/types";
import { IncomingClientMessageSchema } from "@repo/types";

export class User{
    private ws:WebSocket;
    public x:number;
    public y:number;
    public spaceId?:string;
    public spaceWidth?:number;
    public spaceHeight?:number;

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
                payload:{
                    message:"Invalid JSON payload format",
                    code:400
                }
            })
            return ;
        }
        const result = IncomingClientMessageSchema.safeParse(parsedData);
        if (!result.success) {
            console.error("Invalid message format:", result.error);
            this.send({
                type: "event-rejected",
                payload: {
                    message: "Invalid message schema format",
                    code: 400
                }
            });
            return;
        }
        const validatedData = result.data;
        switch(validatedData.type){
            case "join":
                const spaceId=validatedData.payload.spaceId ;
                //verify user from payload.token
                const token = validatedData.payload.token ;
                try{
                    const userId = (jwt.verify(token,JWT_SECRET) as JwtPayload).userId
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
                if(!space){
                    this.send({
                        type:"event-rejected",
                        payload:{
                        message:"Space not found",
                        code:404,
                        }
                    });
                    this.ws.close()
                    return 
                }
                this.spaceId =spaceId ;
                this.spaceWidth = space.width;
                this.spaceHeight = space.height;
                
                this.x = Math.floor(Math.random() * space.width );
                this.y = Math.floor(Math.random() * space.height );
                this.send({
                    type:"space-joined",
                    payload:{
                        spawn:{
                            x: this.x,
                            y: this.y,
                        },
                        users: RoomManager.getInstance().getRoom(spaceId)?.map((usr) =>({
                            userId:usr.id,
                            x:usr.x,
                            y:usr.y 
                        })) ?? [] ,
                        weather: space.weather,
                        timeOfDay: space.timeOfDay
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
                {
                if(!this.spaceId) return ;
                const x = validatedData.payload.x ;
                const y = validatedData.payload.y ;
                
                if (this.spaceWidth !== undefined && this.spaceHeight !== undefined) {
                    if (x < 0 || x >= this.spaceWidth || y < 0 || y >= this.spaceHeight) {
                        this.send({
                            type: "movement-rejected",
                            payload: {
                                x: this.x,
                                y: this.y
                            }
                        });
                        return;
                    }
                }

                //handle movement logic here 
                const disX = Math.abs(this.x - x) ;
                const disY = Math.abs(this.y - y) ;
                if((disX == 1 && disY == 0)||(disX == 0&& disY ==1)){
                    const collision = RoomManager.getInstance().getRoom(this.spaceId!)?.find((u)=>{
                        return u.x===x && u.y===y
                    })
                    const spaceElements = await client.spaceElements.findMany({
                        where:{spaceId:this.spaceId,},
                        include:{element:true}
                    })
                    const elementCollision = spaceElements.find((e) => {
                        return (x >= e.x && x < e.x + e.element.width) &&
                            (y >= e.y && y < e.y + e.element.height)&&(e.element.static);
                    });

                    if(collision||elementCollision){
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
                break;
            case "emote":
                if(!this.spaceId) return;
                RoomManager.getInstance().broadcast({
                    type:"emote",
                    payload:{
                        userId:this.id,
                        emote:validatedData.payload.emote
                    }
                }, this, this.spaceId);
                break;
            case "update-settings":
                {if(!this.spaceId) return;
                const space = await client.space.findUnique({
                    where: { id: this.spaceId }
                });

                if (space?.creatorId !== this.id) {
                    this.send(
                        {
                            type:"event-rejected",
                            payload:{
                                message:"Only space creator can modify room settings.",
                                code:401,
                                event:"update-settings"
                            }
                        }
                    );
                    return;
                }

                await client.space.update({
                    where: { id: this.spaceId },
                    data: {
                        weather: validatedData.payload.weather,
                        timeOfDay: validatedData.payload.timeOfDay
                    }
                });

                const broadcastPayload: ServerMessage = {
                    type: "settings-changed",
                    payload: {
                        weather: validatedData.payload.weather,
                        timeOfDay: validatedData.payload.timeOfDay
                    }
                };
                
                this.send(broadcastPayload);
                RoomManager.getInstance().broadcast(broadcastPayload, this, this.spaceId);
                break;
            }
            case "element-added": {
                if(!this.spaceId) return;
                RoomManager.getInstance().broadcast({
                    type: "element-added",
                    payload: validatedData.payload
                }, this, this.spaceId);
                break;
            }
            case "element-deleted": {
                if(!this.spaceId) return;
                RoomManager.getInstance().broadcast({
                    type: "element-deleted",
                    payload: validatedData.payload
                }, this, this.spaceId);
                break;
            }
        }
    }
    destroy(){
        if(!this.spaceId){
            return;
        }
        RoomManager.getInstance().broadcast({
            type:"user-left",
            payload:{
                userId:this.id
            }
        },this,this.spaceId!)
        RoomManager.getInstance().removeUser(this,this.spaceId!)
    }
    send(payload:ServerMessage){
        this.ws.send(JSON.stringify(payload)) ;
    }
}