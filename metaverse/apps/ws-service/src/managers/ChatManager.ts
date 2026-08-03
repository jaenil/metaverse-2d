import type { ChatMessage } from "@repo/types";

const MAX_MESSAGES_PER_ROOM = 300;

export class ChatManager{
    private static instance: ChatManager;
    private rooms:Map<string, ChatMessage[]> = new Map();

    private constructor(){}

    static getInstance(): ChatManager {
        if (!this.instance) this.instance = new ChatManager();
        return this.instance;
    }

    addMessage(spaceId:string,message:ChatMessage):void{
         if (!this.rooms.has(spaceId)) this.rooms.set(spaceId, []);
        const history = this.rooms.get(spaceId)!;
        history.push(message);
        if (history.length > MAX_MESSAGES_PER_ROOM) history.shift();
    }
    getHistory(spaceId: string): ReadonlyArray<ChatMessage> {
        return this.rooms.get(spaceId) ?? [];
    }
    clearRoom(spaceId: string): void {
        this.rooms.delete(spaceId);
    }
}