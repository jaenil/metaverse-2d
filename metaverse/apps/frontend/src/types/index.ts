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

export interface Element {
  id: string;
  imageUrl: string;
  width: number;
  height: number;
  static: boolean;
}

export interface SpaceElement {
  id: string;           // SpaceElements row id (used for deletion)
  elementId: string;
  x: number;
  y: number;
  element?: Element;
}

// ─── Map ─────────────────────────────────────────────────────────────────────

export interface GameMap {
  id: string;
  name: string;
  thumbnail: string;
  dimensions: string;
  defaultElements: { elementId: string; x: number; y: number }[];
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
  space: { width: number; height: number };
  elements: SpaceElement[];
}

// ─── WebSocket Messages ───────────────────────────────────────────────────────

// Client → Server
export type ClientMessage =
  | { type: 'join'; payload: { spaceId: string; token: string } }
  | { type: 'move'; payload: { x: number; y: number } };

// Server → Client
export type ServerMessage =
  | {
      type: 'space-joined';
      payload: {
        spawn: { x: number; y: number };
        users: { userId: string; x: number; y: number }[];
      };
    }
  | { type: 'user-joined'; payload: { userId: string; x: number; y: number } }
  | { type: 'movement'; payload: { userId: string; x: number; y: number } }
  | { type: 'movement-rejected'; payload: { x: number; y: number } }
  | { type: 'user-left'; payload: { userId: string } };

// ─── Arena State ─────────────────────────────────────────────────────────────

export interface ArenaUser {
  userId: string;
  x: number;
  y: number;
  avatarUrl?: string;
}

export interface ArenaState {
  myPos: { x: number; y: number } | null;
  users: Map<string, ArenaUser>;
  connected: boolean;
}
