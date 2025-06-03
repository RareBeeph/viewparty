import { createContext /*, useEffect, useState */, useEffect } from 'react';
// import useWebSocket from 'react-use-websocket';
import OBSWebSocket from 'obs-websocket-js';
import type { ReactNode } from 'react';
// import type { WebSocketHook } from 'react-use-websocket/dist/lib/types';

// type Backend = Record<string, string | string[]>;
// interface Socket {
//   socket: OBSWebSocket | null;
//   state: Backend;
// }

const socket = new OBSWebSocket();
socket.connect();
export const SocketContext = createContext<OBSWebSocket>(socket);

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
  //
  //   },
  // };

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
