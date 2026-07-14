// ─── Auth ────────────────────────────────────────────────────────────────────

export interface SignupPayload {
  username: string;
  password: string;
  type: 'admin' | 'user';
}

export interface SigninPayload {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId?: string;
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

import type { SpaceElement } from '@repo/types';

export interface SpaceDetail {
  space: { width: number; height: number; thumbnail?: string; creatorId: string; weather: string; timeOfDay: string; };
  elements: SpaceElement[];
}

// ─── WebSocket Messages ───────────────────────────────────────────────────────

export type { IncomingClientMessage as ClientMessage, ServerMessage } from '@repo/types';

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
