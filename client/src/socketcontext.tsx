import { createContext, useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import type { ReactNode } from 'react';
import type { WebSocketHook } from 'react-use-websocket/dist/lib/types';

type Backend = Record<string, string | string[]>;
interface Socket {
  socket: WebSocketHook<unknown> | null;
  state: Backend;
}

const defaultSocket: Socket = { socket: null, state: {} };
export const SocketContext = createContext<Socket>(defaultSocket);

interface Props {
  children: ReactNode;
}

export default function SocketProvider({ children }: Props) {
  const [state, setState] = useState({});

  const options = {
    onMessage: (event: WebSocketEventMap['message']) => {
      const data: string = typeof event.data == 'string' ? event.data : '';
      setState(JSON.parse(data) as Backend);
    },
  };

  const socket = useWebSocket('ws://localhost:10000/ws', options);

  useEffect(() => {
    socket.sendMessage(JSON.stringify({ action: 'plsdata' }));
  }, []);

  const contextdata = { socket, state: state };

  return <SocketContext.Provider value={contextdata}>{children}</SocketContext.Provider>;
}
