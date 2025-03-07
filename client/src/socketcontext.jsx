import { createContext, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";

export const SocketContext = createContext(null)

export default function SocketProvider ({ children }) {
  let [backendstate, setbackendstate] = useState({})

  const options = {
    onMessage: (event) => {
      setbackendstate(JSON.parse(event.data))
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
