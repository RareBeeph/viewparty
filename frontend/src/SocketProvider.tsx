import { createContext } from 'react';
import { useImmerReducer } from 'use-immer';
import type { ReactNode } from 'react';
import OBSWebSocket from 'obs-websocket-js';
import { SocketAction, socketreducer, Action } from './socketreducer';

export { Action };
const socket = new OBSWebSocket();
socket.connect().catch(console.error);

export interface SocketData {
  connection: OBSWebSocket;
  inputName: string;
  settings: Record<'local_file', string>;
}
const data: SocketData = { connection: socket, inputName: '', settings: { local_file: '' } };
const defaultContext: [SocketData, React.Dispatch<SocketAction>] = [data, console.error];
export const SocketContext = createContext(defaultContext);

interface Props {
  children: ReactNode;
}

export default function SocketProvider({ children }: Props) {
  const state = useImmerReducer(socketreducer, data);
  return <SocketContext.Provider value={state}>{children}</SocketContext.Provider>;
}
