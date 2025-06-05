import { ReactNode, useContext, useState } from 'react';
import { SocketContext } from './SocketProvider';

interface Props {
  children: ReactNode;
}

export default function AuthWrapper({ children }: Props) {
  const socket = useContext(SocketContext);
  const [connected, setConnected] = useState(false);

  // This needs to be wrapped in an effect, right now every time this component
  // rerenders you add another callback to that event
  socket.on('Identified', () => {
    setConnected(true);
  });

  if (!connected) {
    return;
  }

  return children;
}
