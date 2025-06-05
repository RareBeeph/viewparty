import { ReactNode, useContext, useState } from "react";
import { SocketContext } from "./SocketProvider";

interface Props {
  children: ReactNode;
}

export default function AuthWrapper ( children: Props ) {
  const socket = useContext(SocketContext)
  const [connected, setConnected] = useState(false);

  socket.on("Identified", () => {setConnected(true)})

  if (!connected) {
    return
  }

  return <>{children.children}</>
}
