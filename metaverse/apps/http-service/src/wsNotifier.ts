import type { CacheInvalidationPayload } from "@repo/types";
const WS_INTERNAL_URL = process.env.WS_INTERNAL_URL??"http://localhost:3002" ;

export async function notifyWsCache(payload:CacheInvalidationPayload):Promise<void>{
    //agar connect nahi ho paa raha toh timeout hojayega
    const controller = new AbortController();
    const timeoutId = setTimeout(()=>controller.abort(),2000);
    try {
        const res = await fetch(`${WS_INTERNAL_URL}/internal/invalidate-space-elements`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });
       
    } catch (e:any) {
        if(e.name === 'AbortError'){
            console.warn("[wsNotifer] Timeout (2000ms) while notifyining WS service cache") ;
        }
        if(e.name === 'RejectionError'){
            console.warn("[wsNotifer] while notifying WS service cache",e.message) ;
        }
    }
    finally{
        clearTimeout(timeoutId);
    }
}