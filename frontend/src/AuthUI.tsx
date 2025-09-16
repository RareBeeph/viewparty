import { useCallback, useContext, useEffect, useState } from 'react';
import { SocketContext } from './SocketProvider';
import {
  Button,
  TextField,
  Stack,
  Switch,
  FormControlLabel,
  Paper,
  Typography,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConfig, saveConfig } from './utils/config';

const AuthUI = () => {
  const [{ connection }] = useContext(SocketContext);
  const [host, setHost] = useState('');
  const [port, setPort] = useState(0);
  const [password, setPassword] = useState('');
  const [retry, setRetry] = useState(false);
  const configQuery = useQuery({
    queryKey: ['config'],
    queryFn: getConfig,
  });
  const queryClient = useQueryClient();
  const configMutation = useMutation({
    mutationFn: async (authData: { host: string; port: number; password: string }) => {
      if (!configQuery.data) return;
      await saveConfig({ ...configQuery.data, ...authData });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['config'] });
    },
  });

  // Connect with entered credentials, saving on success
  const tryConnect = useCallback(
    () =>
      void (async () => {
        if (!configQuery.data) return;
        try {
          await connection.connect(`ws://${host}:${port}`, password);
          configMutation.mutate({ host, port, password });
        } catch (err) {
          console.error('OBS Connection error', err);
        }
      })(),
    [connection, host, port, password, configQuery.data, configMutation],
  );

  // Hydrate the credential data from the backend
  useEffect(() => {
    if (!configQuery.data) return;
    const { host, port, password } = configQuery.data;
    setHost(host);
    setPort(port);
    setPassword(password);
  }, [configQuery.data]);

  // Automatically retry connection
  useEffect(() => {
    const reconnectCallback = () => {
      console.log(retry);
      if (!connection.identified && retry) tryConnect();
    };

    const reconnectInterval = setInterval(reconnectCallback, 5000);

    return () => {
      clearInterval(reconnectInterval);
    };
  }, [connection, retry, tryConnect]);

  return (
    <Paper elevation={1} sx={{ m: 2, p: 2 }}>
      <Stack spacing={1}>
        <Paper elevation={2} sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Typography variant="body1">Host:</Typography>
            <TextField
              fullWidth
              placeholder="localhost"
              value={host}
              onChange={e => setHost(e.target.value)}
            />
            <Typography variant="body1">Port:</Typography>
            <TextField
              fullWidth
              type="number"
              placeholder="4455"
              value={port}
              onChange={e => setPort(parseInt(e.target.value))}
            />
            <Typography variant="body1">Password (leave empty if not applicable):</Typography>
            <TextField fullWidth value={password} onChange={e => setPassword(e.target.value)} />
          </Stack>
        </Paper>
        <Stack className="border p-3 mx-3">
          <Button variant="contained" onClick={tryConnect}>
            Connect to OBS Websocket
          </Button>
          <FormControlLabel
            control={
              <Switch
                onChange={e => {
                  setRetry(e.target.checked);
                }}
              />
            }
            label="Auto-retry every 5 seconds"
          />
        </Stack>
      </Stack>
    </Paper>
  );
};

export default AuthUI;
