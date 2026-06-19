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

// ─── User ────────────────────────────────────────────────────────────────────

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

export const adminCreateMap = (data: {
  thumbnail: string;
  dimensions: string;
  name: string;
  defaultElements: { elementId: string; x: number; y: number }[];
}) => client.post<{ id: string }>('/admin/map', data);

export const adminCreateAvatar = (data: { imageUrl: string; name: string }) =>
  client.post<{ avatarId: string }>('/admin/avatar', data);

export const getElements = () =>
  client.get<{ elements: Element[] }>('/admin/elements');

export const getMaps = () =>
  client.get<{ maps: GameMap[] }>('/admin/maps');
