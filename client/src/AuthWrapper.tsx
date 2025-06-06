import { ReactNode, useContext, useEffect, useState } from 'react';
import { SocketContext } from './SocketProvider';

interface Props {
  children: ReactNode;
}

export default function AuthWrapper({ children }: Props) {
  const obs = useContext(SocketContext);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!obs.connection) {
      console.log('Attempted to run AuthWrapper Effect callback while OBS websocket is null.');
      return;
    }

    obs.connection.on('Identified', () => {
      setConnected(true);
    });

    return () => {
      if (!obs.connection) {
        console.log('Attempted to run AuthWrapper Effect destructor while OBS websocket is null.');
        return;
      }

      obs.connection.removeListener('Identified');
    };
  }, [obs.connection]);

  if (!connected) {
    return;
  }

  return children;
}
