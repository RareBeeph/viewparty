import { createContext, useState } from 'react';
import type { ReactNode } from 'react';
import OBSWebSocket from 'obs-websocket-js';

const socket = new OBSWebSocket();
socket.connect().catch(console.error);

export interface SocketData {
  connection: OBSWebSocket;
  inputName: string;
  settings: Record<'local_file', string>;
}
const data: SocketData = { connection: socket, inputName: '', settings: { local_file: '' } };
const defaultContext: [SocketData, React.Dispatch<React.SetStateAction<SocketData>>] = [
  data,
  value => {
    console.error(value);
    return;
  }, // intentionally nonfunctional. this should never be used
];
export const SocketContext = createContext(defaultContext);

interface Props {
  children: ReactNode;
}

export default function SocketProvider({ children }: Props) {
  const state = useState(data);
  return <SocketContext.Provider value={state}>{children}</SocketContext.Provider>;
}
