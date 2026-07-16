import client from './client';
import type {
  SignupPayload,
  SigninPayload,
  SignupResponse,
  AuthResponse,
  Avatar,
  UserAvatar,
  Space,
  SpaceDetail,
  Element,
  GameMap,
} from '../types';

// ─── Auth ────────────────────────────────────────────────────────────────────

export const signup = (data: SignupPayload) =>
  client.post<SignupResponse>('/signup', data);

export const signin = (data: SigninPayload) =>
  client.post<AuthResponse>('/signin', data);

export const googleSignin = (credential: string) =>
  client.post<AuthResponse>('/google-signin', { credential });

// ─── User ────────────────────────────────────────────────────────────────────

export const getCurrentUser = () =>
  client.get<{ user: { id: string, username: string, email: string | null, googleId: string | null, avatarId: string | null } }>('/user/me');

export const updateMetadata = (avatarId: string) =>
  client.post('/user/metadata', { avatarId });

export const getBulkAvatars = (userIds: string[]) =>
  client.get<{ avatars: UserAvatar[] }>(`/user/metadata/bulk?ids=[${userIds.join(',')}]`);

export const getAvailableAvatars = () =>
  client.get<{ avatars: Avatar[] }>('/avatars');

// ─── Spaces ──────────────────────────────────────────────────────────────────

export const createSpace = (data: { name: string; dimensions: string; mapId?: string }) =>
  client.post<{ spaceId: string }>('/space', data);

export const deleteSpace = (spaceId: string) =>
  client.delete(`/space/${spaceId}`);

export const getAllSpaces = () =>
  client.get<{ spaces: Space[] }>('/space/all');

export const getSpace = (spaceId: string) =>
  client.get<SpaceDetail>(`/space/${spaceId}`);

// ─── Space Elements ──────────────────────────────────────────────────────────

export const addSpaceElement = (data: {
  elementId: string;
  spaceId: string;
  x: number;
  y: number;
}) => client.post('/space/element', data);

export const deleteSpaceElement = (elementId: string, spaceId: string) =>
  client.delete('/space/element', { data: { elementId, spaceId } });

// ─── Admin ───────────────────────────────────────────────────────────────────

export const adminCreateElement = (data: {
  imageUrl: string;
  width: number;
  height: number;
  static: boolean;
}) => client.post<{ id: string }>('/admin/element', data);

export const adminUpdateElement = (elementId: string, imageUrl: string) =>
  client.put(`/admin/element/${elementId}`, { imageUrl });

export const adminDeleteElement = (elementId: string) =>
  client.delete(`/admin/element/${elementId}`);

export const adminCreateMap = (data: {
  thumbnail: string;
  dimensions: string;
  name: string;
  defaultElements: { elementId: string; x: number; y: number }[];
}) => client.post<{ id: string }>('/admin/map', data);

export const adminDeleteMap = (mapId: string) =>
  client.delete(`/admin/map/${mapId}`);

export const adminCreateAvatar = (data: { imageUrl: string; name: string }) =>
  client.post<{ avatarId: string }>('/admin/avatar', data);

export const adminDeleteAvatar = (avatarId: string) =>
  client.delete(`/admin/avatar/${avatarId}`);

export const getElements = () =>
  client.get<{ elements: Element[] }>('/elements');

export const getMaps = () =>
  client.get<{ maps: GameMap[] }>('/maps');
