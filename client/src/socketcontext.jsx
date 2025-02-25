import { createContext } from "react";
import useWebSocket from "react-use-websocket";

export const SocketContext = createContext(null)

export default function SocketProvider ({ children }) {
  const socket = useWebSocket("ws://localhost:10000/ws");

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
