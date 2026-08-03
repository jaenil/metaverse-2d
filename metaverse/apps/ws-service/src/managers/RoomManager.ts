import type { User } from "../models/User.js";
import type { ServerMessage as OutgoingMessage } from "@repo/types";
import { CacheManager } from "../managers/CacheManager.js";
//we have added getinstance because for our entire application we need only one room manager
//no new room manager instances must be allowed 
//so we made the constructor private and are returning the same instance again and again

export class RoomManager {
    private static instance: RoomManager;

    private rooms: Map<string, User[]> = new Map();
    private playerGrid: Map<string, Map<CoordinateKey, User>> = new Map();

    private constructor() {
        this.rooms = new Map();
    }

    private addToGrid(spaceId: string, user: User) {
        if (!this.playerGrid.has(spaceId)) {
            this.playerGrid.set(spaceId, new Map());
        }
        const grid = this.playerGrid.get(spaceId)!;
        const key = toCoordinateKey(user.x, user.y);
        grid.set(key, user);
    }

    private removeFromGrid(spaceId: string, user: User) {
        const grid = this.playerGrid.get(spaceId);
        if (grid) {
            grid.delete(toCoordinateKey(user.x, user.y));
        }
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
            this.playerGrid.delete(spaceId);
            CacheManager.getInstance().clearSpaceCache(spaceId);
        }
        else {
            this.rooms.set(spaceId, remaining);
            this.removeFromGrid(spaceId, user);
        }
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new RoomManager();
        }
        return this.instance;
    }

    public addUser(spaceId: string, user: User) {
        const currentUsers = this.rooms.get(spaceId) ?? [];
        this.rooms.set(spaceId, [...currentUsers, user]);
        this.addToGrid(spaceId, user);
    }


    public isTileOccupiedByPlayer(spaceId: string, x: number, y: number) {
        const grid = this.playerGrid.get(spaceId);
        if (grid) {
            return grid.has(toCoordinateKey(x, y));
        }
        return false;
    }

    public updatePlayerGridPosition(spaceId: string, user: User, oldX: number, oldY: number, newX: number, newY: number) {
        const grid = this.playerGrid.get(spaceId);
        if (grid) {
            this.removeFromGrid(spaceId, user);
            user.x = newX;
            user.y = newY;
            this.addToGrid(spaceId, user);
        }
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