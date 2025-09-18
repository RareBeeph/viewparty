import { ReactNode, useContext, useEffect, useState } from 'react';
import { SocketContext } from './SocketProvider';
import AuthUI from './AuthUI';
import { useSnackbar } from 'notistack';

interface Props {
  children: ReactNode;
}

export default function AuthWrapper({ children }: Props) {
  const [{ connection }] = useContext(SocketContext);
  const [connected, setConnected] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (!connection) {
      enqueueSnackbar(
        'Error: Attempted to run AuthWrapper Effect callback while OBS websocket object is null.',
      );
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

    connection.on('Identified', onIdentify);
    connection.on('ConnectionClosed', onClose);

    return () => {
      connection.off('Identified'); // remove any residual listeners (not sure if this is necessary)
      connection.off('ConnectionClosed');
    };
  }, [connection, enqueueSnackbar]); // ideally: run once, unless the reference to obs.connection changes (i.e. from null to not null)

  if (!connected) {
    console.log('not connected yet');
    return <AuthUI />;
  }

  return children;
}
