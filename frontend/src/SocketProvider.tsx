import { createContext } from 'react';
import { useImmerReducer } from 'use-immer';
import type { ReactNode } from 'react';
import OBSWebSocket from 'obs-websocket-js';
import { SocketAction, socketreducer, Action } from './socketreducer';
import * as ConfigStore from '../wailsjs/go/wailsconfigstore/ConfigStore';

export { Action };
const socket = new OBSWebSocket();

ConfigStore.Get('auth.json', 'null')
  .then(async response => {
    const data = JSON.parse(response as string) as {
      host?: string;
      port?: number;
      password?: string;
    };
    if (!data) return;

    await socket.connect(`ws://${data.host ?? 'localhost'}:${data.port ?? 4455}`, data.password);
  })
  .catch(console.error);

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
