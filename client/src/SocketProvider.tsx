import { createContext } from 'react';
// import useWebSocket from 'react-use-websocket';
import type { ReactNode } from 'react';
import Obs from './Obs';
// import type { WebSocketHook } from 'react-use-websocket/dist/lib/types';

// type Backend = Record<string, string | string[]>;
// interface Socket {
//   socket: OBSWebSocket | null;
//   state: Backend;
// }

const socket = new Obs();
socket.connect().catch(() => {
  console.log('Obs.connect() failed in SocketProvider.tsx');
});

export const SocketContext = createContext<Obs>(socket);

interface Props {
  children: ReactNode;
}

export default function SocketProvider({ children }: Props) {
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
