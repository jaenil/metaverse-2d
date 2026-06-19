import { useEffect, useRef, useCallback } from 'react';
import { WS_URL } from '../api/client';
import type { ClientMessage, ServerMessage } from '../types';

interface UseWebSocketOptions {
  spaceId: string;
  token: string;
  onMessage: (msg: ServerMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export function useWebSocket({
  spaceId,
  token,
  onMessage,
  onOpen,
  onClose,
}: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intentionalClose = useRef(false);

  const send = useCallback((msg: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const sendMove = useCallback((x: number, y: number) => {
    send({ type: 'move', payload: { x, y } });
  }, [send]);

  const connect = useCallback(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      // First thing: join the space
      ws.send(JSON.stringify({
        type: 'join',
        payload: { spaceId, token },
      }));
      onOpen?.();
    };

    ws.onmessage = (event) => {
      try {
        const msg: ServerMessage = JSON.parse(event.data as string);
        onMessage(msg);
      } catch {
        console.error('WS parse error', event.data);
      }
    };

    ws.onclose = () => {
      onClose?.();
      if (!intentionalClose.current) {
        // Exponential backoff reconnect (capped at 5s)
        reconnectTimer.current = setTimeout(connect, 3000);
      }
    };

    ws.onerror = (err) => {
      console.error('WS error', err);
      ws.close();
    };
  }, [spaceId, token, onMessage, onOpen, onClose]);

  useEffect(() => {
    intentionalClose.current = false;
    connect();

    return () => {
      intentionalClose.current = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { sendMove };
}
