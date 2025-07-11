import { ReactNode, useContext, useEffect, useState } from 'react';
import { SocketContext } from './SocketProvider';
import { connect } from './Obs';

interface Props {
  children: ReactNode;
}

export default function AuthWrapper({ children }: Props) {
  const [{ connection }] = useContext(SocketContext);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!connection) {
      console.error('Attempted to run AuthWrapper Effect callback while OBS websocket is null.');
      return;
    }

    if (connection.identified) {
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

    connection.off('Identified'); // remove any residual listeners (not sure if this is necessary)
    connection.on('Identified', onIdentify);

    connection.off('ConnectionClosed');
    connection.on('ConnectionClosed', onClose);
  }, [connection]); // run once, unless the reference to obs.connection changes (i.e. from null to not null)

  useEffect(() => {
    const reconnectCallback = () => {
      if (!connection.identified) {
        connect(connection).catch(err => console.error('Obs.retryConnect() failure', err));
      }
      return;
    };

    const reconnectInterval = setInterval(reconnectCallback, 5000);

    return () => {
      clearInterval(reconnectInterval);
    };
  }, [connection]);

  if (!connected) {
    console.log('not connected yet');
    return;
  }

  return children;
}
