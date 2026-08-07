import { useState, useCallback, useRef, useEffect } from 'react';
import { getBulkAvatars } from '../api';
import type { ServerMessage, ArenaUser, SpaceElement, ChatMessage } from '../types';

interface ArenaState {
  myPos: { x: number; y: number } | null;
  myAvatarUrl?: string;
  myEmote?: string;
  myEmoteExpiresAt?: number;
  users: Map<string, ArenaUser>;
  connected: boolean;
  weather?: 'none' | 'rain' | 'snow';
  timeOfDay?: 'day' | 'night';
  elements: SpaceElement[];
  chatMessages: ChatMessage[];
}

export function useArena(_myUserId: string) {
  const [state, setState] = useState<ArenaState>({
    myPos: null,
    users: new Map(),
    connected: false,
    elements: [],
    chatMessages: [],
  });

  const setElements = useCallback((elements: SpaceElement[]) => {
    setState(prev => ({ ...prev, elements }));
  }, []);

  // Ref so canvas render loop can always read latest pos without stale closure
  const myPosRef = useRef<{ x: number; y: number } | null>(null);

  const handleMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case 'space-joined': {
        const { spawn, users, weather, timeOfDay, chatHistory } = msg.payload;
        myPosRef.current = spawn;
        const userMap = new Map<string, ArenaUser>();
        // Backend sends { id, x, y } in space-joined
        users.forEach((u: { id?: string; userId?: string; x: number; y: number }) => {
          const uid = u.userId || u.id;
          if (uid && uid !== _myUserId) userMap.set(uid, { userId: uid, x: u.x, y: u.y });
        });
        setState(prev => ({
          ...prev,
          myPos: spawn,
          users: userMap,
          connected: true,
          weather: weather as 'none' | 'rain' | 'snow',
          timeOfDay: timeOfDay as 'day' | 'night',
          chatMessages: chatHistory || []
        }));
        break;
      }

      case 'user-join':
      case 'user-joined': {
        const { userId, x, y } = msg.payload;
        if (userId === _myUserId) return;
        setState((prev) => {
          const next = new Map(prev.users);
          next.set(userId, { userId, x, y });
          return { ...prev, users: next };
        });
        break;
      }

      case 'movement': {
        const { userId, x, y } = msg.payload;
        if (userId === _myUserId) return;
        setState((prev) => {
          const next = new Map(prev.users);
          const existing = next.get(userId);
          if (existing) next.set(userId, { ...existing, x, y });
          return { ...prev, users: next };
        });
        break;
      }

      case 'movement-rejected': {
        // Server corrects our position — snap back
        const { x, y } = msg.payload;
        myPosRef.current = { x, y };
        setState((prev) => ({ ...prev, myPos: { x, y } }));
        break;
      }

      case 'user-left': {
        const { userId } = msg.payload;
        setState((prev) => {
          const next = new Map(prev.users);
          next.delete(userId);
          return { ...prev, users: next };
        });
        break;
      }

      case 'emote': {
        const { userId, emote } = msg.payload;
        if (userId === _myUserId) return;
        setState((prev) => {
          const next = new Map(prev.users);
          const u = next.get(userId);
          if (u) {
            next.set(userId, { ...u, emote, emoteExpiresAt: Date.now() + 3000 });
          }
          return { ...prev, users: next };
        });
        break;
      }
      case 'settings-changed': {
        const payload = msg.payload as any;
        setState(prev => ({
          ...prev,
          weather: payload.weather,
          timeOfDay: payload.timeOfDay
        }));
        break;
      }
      case 'element-added': {
        setState(prev => ({ ...prev, elements: [...prev.elements, msg.payload as SpaceElement] }));
        break;
      }
      case 'element-deleted': {
        const { id } = msg.payload as any;
        setState(prev => ({ ...prev, elements: prev.elements.filter(e => e.id !== id) }));
        break;
      }
      case 'chat-message': {
        const chatMsg = msg.payload as ChatMessage;
        setState(prev => ({ ...prev, chatMessages: [...prev.chatMessages, chatMsg] }));
        break;
      }
    }
  }, [_myUserId]);

  const setMyEmote = useCallback((emote: string) => {
    setState(prev => ({ ...prev, myEmote: emote, myEmoteExpiresAt: Date.now() + 3000 }));
  }, []);

  const handleOpen = useCallback(() => {
    setState((prev) => ({ ...prev, connected: true }));
  }, []);

  const handleClose = useCallback(() => {
    setState((prev) => ({ ...prev, connected: false, myPos: null, users: new Map() }));
    myPosRef.current = null;
  }, []);

  // Optimistic local move — server will reject if invalid
  const applyOptimisticMove = useCallback((x: number, y: number) => {
    myPosRef.current = { x, y };
    setState((prev) => ({ ...prev, myPos: { x, y } }));
  }, []);

  const fetchedAvatarIds = useRef<Set<string>>(new Set());

  // Fetch missing avatars
  useEffect(() => {
    if (!state.connected) return;
    const missingAvatarUserIds: string[] = [];
    
    // Check if my avatar is missing
    if (!state.myAvatarUrl && !fetchedAvatarIds.current.has(_myUserId)) {
      missingAvatarUserIds.push(_myUserId);
      fetchedAvatarIds.current.add(_myUserId);
    }

    state.users.forEach((user, id) => {
      if (!user.avatarUrl && !fetchedAvatarIds.current.has(id)) {
        missingAvatarUserIds.push(id);
        fetchedAvatarIds.current.add(id);
      }
    });

    if (missingAvatarUserIds.length > 0) {
      getBulkAvatars(missingAvatarUserIds).then(res => {
        if (res.status === 200 && res.data.avatars) {
          setState(prev => {
            let myAvatarUrl = prev.myAvatarUrl;
            const nextUsers = new Map(prev.users);
            
            res.data.avatars.forEach(a => {
              // The backend maps avatar?.imageUrl to the avatarId field
              const url = a.avatarId; 
              if (a.userId === _myUserId) {
                myAvatarUrl = url || myAvatarUrl;
              } else {
                const existing = nextUsers.get(a.userId);
                if (existing) {
                  nextUsers.set(a.userId, { ...existing, avatarUrl: url });
                }
              }
            });

            return { ...prev, myAvatarUrl, users: nextUsers };
          });
        }
      }).catch(err => {
        console.error("Failed to fetch avatars", err);
        // On error, we could remove them from the set to retry later, 
        // but for now we just skip retrying to prevent loop.
      });
    }
  }, [state.connected, state.users, _myUserId, state.myAvatarUrl]);

  return {
    state,
    myPosRef,
    handleMessage,
    handleOpen,
    handleClose,
    applyOptimisticMove,
    setMyEmote,
    setElements,
  };
}
