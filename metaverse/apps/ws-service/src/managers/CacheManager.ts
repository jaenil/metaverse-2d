import type { CachedElement,CachedSpaceMetadata,CacheInvalidationPayload,SpaceSettings } from "@repo/types";

export class CacheManager{
    private static instance: CacheManager;
    //added for caching
    private elementCache: Map<string, CachedElement[]> = new Map();
    private spaceMetaCache: Map<string, CachedSpaceMetadata> = new Map();
    private constructor() {}
    static getInstance() {
        if (!this.instance) {
            this.instance = new CacheManager();
        }
        return this.instance;
    }
    public setElementCache(spaceId:string,elements:CachedElement[]):void{
        this.elementCache.set(spaceId,elements);
    }
    public getElementCache(spaceId:string):CachedElement[] | undefined{
        return this.elementCache.get(spaceId);
    }
    public invalidateElementCache(spaceId:string):void{
        this.elementCache.delete(spaceId);
    }
    public addElementToCache(spaceId:string,element:CachedElement):void{
        if (!this.elementCache.has(spaceId)) {
            this.elementCache.set(spaceId, []);
        }
        this.elementCache.get(spaceId)?.push(element);
    }
    public removeElementFromCache(spaceId:string,elementId:string):void{
        if (!this.elementCache.has(spaceId)) {
            return;
        }
        const remaining = this.elementCache.get(spaceId)?.filter((e) => e.id !== elementId) ?? [];
        this.elementCache.set(spaceId, remaining);
    }
    public setSpaceMetadata(spaceId:string,metadata:CachedSpaceMetadata):void{
        this.spaceMetaCache.set(spaceId,metadata);
    }
    public getSpaceMetadata(spaceId:string):CachedSpaceMetadata | undefined{
        return this.spaceMetaCache.get(spaceId);
    }
    public updateSpaceSettings(spaceId:string,settings:{weather:string;timeOfDay:string}):void{
        if (!this.spaceMetaCache.has(spaceId)) {
            return;
        }
        this.spaceMetaCache.set(spaceId, { ...this.spaceMetaCache.get(spaceId)!, ...settings });
    }
    public clearSpaceCache(spaceId:string):void{
        this.elementCache.delete(spaceId);
        this.spaceMetaCache.delete(spaceId);
    }
}