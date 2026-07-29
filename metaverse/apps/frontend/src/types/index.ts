import type {SignupSchema, SigninSchema,SpaceElement} from '@repo/types';
export type { IncomingClientMessage as ClientMessage, ServerMessage } from '@repo/types';
import type {z} from 'zod';
// ─── Auth ────────────────────────────────────────────────────────────────────

export type SignupPayload = z.infer<typeof SignupSchema>;

export type SigninPayload = z.infer<typeof SigninSchema>;

export interface AuthResponse {
  token: string;
  userId: string;
  role?:'admin'|'user';
}

export interface SignupResponse {
  userId: string;
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

export interface Avatar {
  id: string;
  name: string;
  imageUrl: string;
}

export interface UserAvatar {
  userId: string;
  avatarId: string;
  imageUrl: string;
  name: string;
}

// ─── Element ─────────────────────────────────────────────────────────────────

export type { Element, SpaceElement } from '@repo/types';

// ─── Map ─────────────────────────────────────────────────────────────────────

export interface GameMap {
  id: string;
  name: string;
  thumbnail: string;
  dimensions?: string;
  width?: number;
  height?: number;
  defaultElements?: { elementId: string; x: number; y: number }[];
  creator?: { id: string; username: string };
}

// ─── Space ───────────────────────────────────────────────────────────────────

export interface Space {
  id: string;
  name: string;
  dimensions: string;
  width?: number;
  height?: number;
  thumbnail?: string;
}

export interface SpaceDetail {
  space: { width: number; height: number; thumbnail?: string; creatorId: string; weather: string; timeOfDay: string; };
  elements: SpaceElement[];
}

// ─── Arena State ─────────────────────────────────────────────────────────────

export interface ArenaUser {
  userId: string;
  x: number;
  y: number;
  avatarUrl?: string;
  emote?: string;
  emoteExpiresAt?: number;
}

export interface ArenaState {
  myPos: { x: number; y: number } | null;
  myEmote?: string;
  myEmoteExpiresAt?: number;
  users: Map<string, ArenaUser>;
  connected: boolean;
  myAvatarUrl?: string; // added manually if needed
}
