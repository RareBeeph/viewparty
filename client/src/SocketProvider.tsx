import { createContext,/*, useEffect, useState */
useEffect} from 'react';
// import useWebSocket from 'react-use-websocket';
import OBSWebSocket from 'obs-websocket-js';
import type { ReactNode } from 'react';
// import type { WebSocketHook } from 'react-use-websocket/dist/lib/types';

// type Backend = Record<string, string | string[]>;
// interface Socket {
//   socket: OBSWebSocket | null;
//   state: Backend;
// }

const defaultSocket: OBSWebSocket | null = null //Socket = { socket: null, state: {} };
export const SocketContext = createContext<OBSWebSocket | null>(defaultSocket);

interface Props {
  children: ReactNode;
}

export default function SocketProvider({ children }: Props) {
  // const [state, setState] = useState({});

  // const options = {
  //   onMessage: (event: WebSocketEventMap['message']) => {
  //     const data: string = typeof event.data === 'string' ? event.data : '';

  //     if (data.startsWith('ERROR')) {
  //       setState({ err: data, ...state } as Backend);
  //       console.log(data);
  //     } else {
  //       setState(JSON.parse(data) as Backend);
  //       console.log(JSON.parse(data));
  //     }
  //   },
  // };

  const socket = new OBSWebSocket() // useWebSocket('ws://localhost:10000/ws', options);

  useEffect(() => {
    socket.connect()
  }, [])


  // useEffect(() => {
  //   socket.connect()
  //   return () => {
  //     socket.disconnect()
  //   }
  // }, [socket])

  // useEffect(() => {
  //   socket.sendMessage(JSON.stringify({ action: 'plsdata' }));
  // }, []);

  // const contextdata = { socket, state: state };

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}
