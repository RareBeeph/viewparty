import { useCallback, useContext, useEffect, useState } from 'react';
import { SocketContext } from './SocketProvider';
import { Button, Container, Form, Row } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { getCredentials, saveCredentials } from './utils/config';

const AuthUI = () => {
  const [{ connection }] = useContext(SocketContext);
  const [host, setHost] = useState('');
  const [port, setPort] = useState(0);
  const [password, setPassword] = useState('');
  const [retry, setRetry] = useState(false);
  const configQuery = useQuery({
    queryKey: ['config'],
    queryFn: getCredentials,
  });

  // Connect with entered credentials, saving on success
  const tryConnect = useCallback(
    () =>
      void (async () => {
        try {
          await connection.connect(`ws://${host}:${port}`, password);
          await saveCredentials({ host, port, password });
        } catch (err) {
          console.error('OBS Connection error', err);
        }
      })(),
    [connection, host, port, password, configQuery.data],
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
    <Container className="mt-5">
      <Row className="border p-3 mx-3">
        <p>Host:</p>
        <Form.Control
          type="text"
          placeholder="localhost"
          value={host}
          onChange={e => setHost(e.target.value)}
        />
      </Row>
      <Row className="border p-3 mx-3">
        <p>Port:</p>
        <Form.Control
          type="number"
          placeholder="4455"
          value={port}
          onChange={e => setPort(parseInt(e.target.value))}
        />
      </Row>
      <Row className="border p-3 mx-3">
        <p>Password (leave empty if not applicable):</p>
        <Form.Control type="string" value={password} onChange={e => setPassword(e.target.value)} />
      </Row>
      <Row className="border p-3 mx-3">
        <Button onClick={tryConnect}>Connect to OBS Websocket</Button>
        <Form.Switch
          inline
          label="Auto-retry every 5 seconds"
          onChange={e => {
            setRetry(e.target.checked);
          }}
        />
      </Row>
    </Container>
  );
};

export default AuthUI;
