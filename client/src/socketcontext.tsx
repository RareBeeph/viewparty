import { createContext, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import type { ReactNode } from "react";
import type { WebSocketHook } from "react-use-websocket/dist/lib/types";

type Backend = {[key:string]: string | string[]}
type SocketStuff = { socket: WebSocketHook<unknown> | null, backendstate: Backend }

const stuff: SocketStuff = { socket: null, backendstate: {} }
export const SocketContext = createContext(stuff)

type Props = { children: ReactNode }

export default function SocketProvider ({ children }: Props) {
  const [backendstate, setbackendstate] = useState({})

  const options = {
    onMessage: (event: WebSocketEventMap['message']) => {
      const data: string = event.data
      const newstate: Backend = JSON.parse(data)
      setbackendstate(newstate)
    }
  }

  const socket = useWebSocket("ws://localhost:10000/ws", options);

  useEffect(() => {
    socket.sendMessage(JSON.stringify({action: 'plsdata'}))
  }, [])

  const contextdata = {socket, backendstate}

  return (
    <SocketContext.Provider value={contextdata}>
      {children}
    </SocketContext.Provider>
  );
};
