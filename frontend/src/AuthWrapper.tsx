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
      console.error('Attempted to run AuthWrapper Effect callback while OBS websocket is null.');
      return;
    }

    if (obs.connection.identified) {
      console.log('already identified');
      setConnected(true);
    }

    const onIdentify = () => {
      console.log('identified');
      setConnected(true);
    };

    const onClose = () => {
      console.log('closed');
      setConnected(false);
    };

    obs.connection.off('Identified'); // remove any residual listeners (not sure if this is necessary)
    obs.connection.on('Identified', onIdentify);

    obs.connection.off('ConnectionClosed');
    obs.connection.on('ConnectionClosed', onClose);
  }, [obs.connection]); // run once, unless the reference to obs.connection changes (i.e. from null to not null)

  if (!connected) {
    console.log('not connected yet');
    return;
  }

  return children;
}
