import { useCallback, useContext, useEffect, useState } from 'react';
import { SocketContext } from './SocketProvider';
import { Button, Container, Form, Row } from 'react-bootstrap';
import * as ConfigStore from '../wailsjs/go/wailsconfigstore/ConfigStore';

const AuthUI = () => {
  const [{ connection }] = useContext(SocketContext);
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState(4455);
  const [password, setPassword] = useState('');
  const [retry, setRetry] = useState(false);

  const tryConnect = useCallback(
    () =>
      void (async () => {
        try {
          await connection.connect(`ws://${host}:${port}`, password);
        } catch (err) {
          console.error('OBS Connection error', err);
        }
      })(),
    [connection, host, port, password],
  );

  useEffect(() => {
    ConfigStore.Get('auth.json', 'null')
      .then(response => {
        const data = JSON.parse(response as string) as {
          host?: string;
          port?: number;
          password?: string;
        };
        if (!data) return;

        if (data.host) setHost(data.host);
        if (data.port) setPort(data.port);
        if (data.password) setPassword(data.password);
      })
      .catch(console.error);
  }, [connection]);

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

  const setConfig = (key: string, value: string | number) => {
    ConfigStore.Set(
      'auth.json',
      JSON.stringify({
        host: host,
        port: port,
        password: password,
        [key]: value,
      }),
    ).catch(console.error);
    return value;
  };

  return (
    <Container className="mt-5">
      <Row className="border p-3 mx-3">
        <p>Host:</p>
        <Form.Control
          type="text"
          placeholder="localhost"
          value={host}
          onChange={e => setHost(setConfig('host', e.target.value) as string)}
        />
      </Row>
      <Row className="border p-3 mx-3">
        <p>Port:</p>
        <Form.Control
          type="number"
          placeholder="4455"
          value={port}
          onChange={e => setPort(setConfig('port', e.target.value) as number)}
        />
      </Row>
      <Row className="border p-3 mx-3">
        <p>Password (leave empty if not applicable):</p>
        <Form.Control
          type="string"
          value={password}
          onChange={e => setPassword(setConfig('password', e.target.value) as string)}
        />
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
