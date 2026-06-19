import { useState, useCallback, useRef } from 'react';
import type { ServerMessage, ArenaUser } from '../types';

interface ArenaState {
  myPos: { x: number; y: number } | null;
  users: Map<string, ArenaUser>;
  connected: boolean;
}

export function useArena(_myUserId: string) {
  const [state, setState] = useState<ArenaState>({
    myPos: null,
    users: new Map(),
    connected: false,
  });

  // Ref so canvas render loop can always read latest pos without stale closure
  const myPosRef = useRef<{ x: number; y: number } | null>(null);

  const handleMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case 'space-joined': {
        const { spawn, users } = msg.payload;
        myPosRef.current = spawn;
        const userMap = new Map<string, ArenaUser>();
        users.forEach((u) => userMap.set(u.userId, u));
        setState({
          myPos: spawn,
          users: userMap,
          connected: true,
        });
        break;
      }

      case 'user-joined': {
        const { userId, x, y } = msg.payload;
        setState((prev) => {
          const next = new Map(prev.users);
          next.set(userId, { userId, x, y });
          return { ...prev, users: next };
        });
        break;
      }

      case 'movement': {
        const { userId, x, y } = msg.payload;
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
    }
  }, []);

  const handleOpen = useCallback(() => {
    setState((prev) => ({ ...prev, connected: true }));
  }, []);

  const handleClose = useCallback(() => {
    setState((prev) => ({ ...prev, connected: false }));
  }, []);

  // Optimistic local move — server will reject if invalid
  const applyOptimisticMove = useCallback((x: number, y: number) => {
    myPosRef.current = { x, y };
    setState((prev) => ({ ...prev, myPos: { x, y } }));
  }, []);

  return {
    state,
    myPosRef,
    handleMessage,
    handleOpen,
    handleClose,
    applyOptimisticMove,
  };
}
