import { createContext } from 'react';
import type { ReactNode } from 'react';
import Obs from './Obs';

const socket = new Obs();
socket.connect().catch(console.error);

export const SocketContext = createContext<Obs>(socket);

interface Props {
  children: ReactNode;
}

export default function SocketProvider({ children }: Props) {
  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}
