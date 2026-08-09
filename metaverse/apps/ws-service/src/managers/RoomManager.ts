import type { User } from "../models/User.js";
import type { ServerMessage as OutgoingMessage, CoordinateKey } from "@repo/types";
import { toCoordinateKey } from "@repo/types";

import { CacheManager } from "../managers/CacheManager.js";
import { ChatManager } from "./ChatManager.js";

// We use getInstance because our entire application needs only one room manager.
export class RoomManager {
    private rooms: Map<string, User[]> = new Map();
    private playerGrid: Map<string, Map<CoordinateKey, User>> = new Map();
    
    private static instance: RoomManager;

    private constructor() {
        this.rooms = new Map();
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new RoomManager();
        }
        return this.instance;
    }

    // --- Spatial Grid Helpers ---

    private addToGrid(spaceId: string, user: User) {
        if (!this.playerGrid.has(spaceId)) {
            this.playerGrid.set(spaceId, new Map());
        }
        const grid = this.playerGrid.get(spaceId)!;
        grid.set(toCoordinateKey(user.x, user.y), user);
    }

    private removeFromGrid(spaceId: string, user: User) {
        const grid = this.playerGrid.get(spaceId);
        if (grid) {
            grid.delete(toCoordinateKey(user.x, user.y));
        }
    }

    public isTileOccupiedByPlayer(spaceId: string, x: number, y: number): boolean {
        const grid = this.playerGrid.get(spaceId);
        if (grid) {
            return grid.has(toCoordinateKey(x, y));
        }
        return false;
    }

    public updatePlayerGridPosition(spaceId: string, user: User, oldX: number, oldY: number, newX: number, newY: number) {
        const grid = this.playerGrid.get(spaceId);
        if (grid) {
            // Remove from old coordinate
            grid.delete(toCoordinateKey(oldX, oldY));
            // Add to new coordinate
            grid.set(toCoordinateKey(newX, newY), user);
        }
    }

    // --- Core Room Logic ---

    public getRoom(spaceId: string): ReadonlyArray<User> {
        return this.rooms.get(spaceId) ?? [];
    }

    public addUser(spaceId: string, user: User) {
        const room = this.rooms.get(spaceId);
        if (!room) { 
            this.rooms.set(spaceId, [user]); 
        } else {
            room.push(user);
        }
        // Sync with spatial grid
        this.addToGrid(spaceId, user);
    }

    public removeUser(user: User, spaceId: string) {
        if (!this.rooms.has(spaceId)) {
            return;
        }
        
        const remaining = this.rooms.get(spaceId)?.filter((u) => u.id !== user.id) ?? [];
        if (remaining.length === 0) {
            this.rooms.delete(spaceId);
            this.playerGrid.delete(spaceId); // Cleanup grid
            CacheManager.getInstance().clearSpaceCache(spaceId);
            ChatManager.getInstance().clearRoom(spaceId);
        } else {
            this.rooms.set(spaceId, remaining);
            this.removeFromGrid(spaceId, user); // Sync with spatial grid
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
        });
    }

    public broadcastAll(message: OutgoingMessage, roomId: string) {
        this.rooms.get(roomId)?.forEach((u) => {
            u.send(message);
        });
    }
}