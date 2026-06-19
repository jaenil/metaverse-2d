import type { User } from "./User.js" ;
import type { OutgoingMessage } from "./types.js";
//we have added getinstance because for our entire application we need only one room manager
//no new room manager instances must be allowed 
//so we made the constructor private and are returning the same instance again and again

export class RoomManager{
    rooms:Map<string,User[]> = new Map() ;
    static instance:RoomManager ;
    private constructor(){
        this.rooms = new Map() ;
    }
    public removeUser(user:User,spaceId:string){
        if(!this.rooms.has(spaceId)){
            return ;
        }   
        this.rooms.set(spaceId,(this.rooms.get(spaceId)?.filter((u)=>u.id !==user.id))??[]) ;

    }
    static getInstance(){
        if(!this.instance){
            this.instance = new RoomManager();
        }
        return this.instance ;
    }
    public addUser(spaceId:string,user:User){
        if(!this.rooms.has(spaceId)) {
            this.rooms.set(spaceId,[user]) ;
            return;
        }
        this.rooms.set(spaceId,[...this.rooms.get(spaceId)??[],user]) ;
    }
    public broadcast(message:OutgoingMessage,user:User,roomId:string){
        if(!this.rooms.has(roomId)){
            return;
        }
        this.rooms.get(roomId)?.forEach((u) =>{
            if(u.id!==user.id){
                u.send(message) ;
            }
        })
    }
}