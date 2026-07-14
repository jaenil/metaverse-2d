import { z } from "zod";

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string(),
  PORT: z.string().regex(/^\d+$/).optional(),
});

export const SignupSchema = z.object({
    username: z.string(),
    password: z.string(),
    type: z.enum(["admin", "user"])
});

export const SigninSchema = z.object({
    username: z.string(),
    password: z.string(),
});

export const UpdateMetadataSchema = z.object({
    avatarId: z.string(),
});

export const CreateSpaceSchema = z.object({
    name: z.string(),
    dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/).transform(val => {const [width,height] = val.split("x"); return {width:Number(width),height:Number(height)}} ),
    mapId: z.string().optional(),
})

export const JoinSpaceSchema = z.object({
    name: z.string(),
    dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/).transform(val => {const [width,height] = val.split("x"); return {width:Number(width),height:Number(height)}} ),
    mapId: z.string(),
})

export const AddElementSchema = z.object({
    elementId: z.string(),
    spaceId: z.string(),
    x: z.number(),
    y: z.number(),
})

export const DeleteElementSchema = z.object({
    elementId: z.string(),
    spaceId:z.string() 
})

export const CreateElementSchema = z.object({
    imageUrl: z.string(),
    width: z.number(),
    height: z.number(),
    static: z.boolean(),
})

export const UpdateElementSchema = z.object({
    imageUrl: z.string(),
})

export const CreateAvatarSchema = z.object({
    imageUrl: z.string(),
    name: z.string()
})

export const CreateMapSchema = z.object({
    thumbnail: z.string(),
    dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/).transform(val => {const [width,height] = val.split("x"); return {width:Number(width),height:Number(height)}} ),
    name: z.string(),
    defaultElements: z.array(z.object({
        elementId: z.string(),
        x: z.number(),
        y: z.number()
    }))
})

export const IncomingClientMessageSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("join"),
        payload: z.object({ 
            spaceId: z.string(), 
            token: z.string() 
        })
    }),
    z.object({
        type: z.literal("move"),
        payload: z.object({ 
            x: z.number(), 
            y: z.number() 
        })
    }),
    z.object({
        type: z.literal("emote"),
        payload: z.object({
            userId: z.string().optional(), // Adding optional userId because frontend doesn't send it, but backend adds it
            emote: z.string()
        })
    }),
    z.object({
        type: z.literal("update-settings"),
        payload: z.object({
            weather: z.enum(["none","rain","snow"]),
            timeOfDay: z.enum(["day","night"])
        })
    }),
    z.object({
        type: z.literal("element-added"),
        payload: z.object({
            id: z.string(),
            elementId: z.string(),
            spaceId: z.string(),
            x: z.number(),
            y: z.number()
        })
    }),
    z.object({
        type: z.literal("element-deleted"),
        payload: z.object({ id: z.string() })
    })
]);

export type IncomingClientMessage = z.infer<typeof IncomingClientMessageSchema>;

export interface Element {
  id: string;
  imageUrl: string;
  width: number;
  height: number;
  static: boolean;
}

export interface SpaceElement {
  id: string;
  elementId: string;
  spaceId?: string;
  x: number;
  y: number;
  element?: Element;
}

export type ServerMessage =
  | {
      type: 'space-joined';
      payload: {
        spawn: { x: number; y: number };
        users: { userId: string; x: number; y: number }[];
        weather?: string;
        timeOfDay?: string;
      };
    }
  | { type: 'user-join'; payload: { userId: string; x: number; y: number } }
  | { type: 'user-joined'; payload: { userId: string; x: number; y: number } }
  | { type: 'movement'; payload: { userId: string; x: number; y: number } }
  | { type: 'movement-rejected'; payload: { x: number; y: number } }
  | { type: 'user-left'; payload: { userId: string } }
  | { type: 'emote'; payload: { userId: string; emote: string } }
  | { type: 'settings-changed'; payload: { weather: string; timeOfDay: string } }
  | { type: 'element-added'; payload: SpaceElement }
  | { type: 'element-deleted'; payload: { id: string } }
  | { type: 'event-rejected' };
