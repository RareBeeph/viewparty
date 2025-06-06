import { ReactNode, useContext, useState } from 'react';
import { SocketContext } from './SocketProvider';

interface Props {
  children: ReactNode;
}

export default function AuthWrapper({ children }: Props) {
  const obs = useContext(SocketContext);
  const [connected, setConnected] = useState(false);

  if (!obs.connection) {
    console.log('Attempted to pass through auth wrapper while OBS websocket is null.')
    return;
  }

  // This needs to be wrapped in an effect, right now every time this component
  // rerenders you add another callback to that event
  obs.connection.on('Identified', () => {
    setConnected(true);
  });

  if (!connected) {
    return;
  }

  return children;
}
