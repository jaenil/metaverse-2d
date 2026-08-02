import type { User } from "./User.js";
import type { ServerMessage as OutgoingMessage } from "@repo/types";
import { CacheManager } from "./CacheManager.js";
//we have added getinstance because for our entire application we need only one room manager
//no new room manager instances must be allowed 
//so we made the constructor private and are returning the same instance again and again

export class RoomManager {
    private rooms: Map<string, User[]> = new Map();
    private static instance: RoomManager;

    private constructor() {
        this.rooms = new Map();
    }
    public getRoom(spaceId: string): ReadonlyArray<User> {
        return this.rooms.get(spaceId) ?? [];
    }
    public removeUser(user: User, spaceId: string) {
        if (!this.rooms.has(spaceId)) {
            return;
        }
        const remaining = this.rooms.get(spaceId)?.filter((u) => u.id !== user.id) ?? [];
        if (remaining.length === 0) {
            this.rooms.delete(spaceId);
            CacheManager.getInstance().clearSpaceCache(spaceId);
        }
        else {
            this.rooms.set(spaceId, remaining);
        }
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new RoomManager();
        }
        return this.instance;
    }
    public addUser(spaceId: string, user: User) {
        if (!this.rooms.has(spaceId)) {
            this.rooms.set(spaceId, [user]);
            return;
        }
        this.rooms.set(spaceId, [...this.rooms.get(spaceId) ?? [], user]);
    }
    public broadcast(message: OutgoingMessage, user: User, roomId: string) {
        if (!this.rooms.has(roomId)) {
            return;
        }
        this.rooms.get(roomId)?.forEach((u) => {
            if (u.id !== user.id) {
                u.send(message);
            }
        })
    }

}