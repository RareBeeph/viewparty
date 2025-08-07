import { useCallback, useContext, useEffect, useState } from 'react';
import { SocketContext } from '../SocketProvider';
import { Button, Container, Form, Row } from 'react-bootstrap';
import { connect } from '../utils/obs';

const AuthUI = () => {
  const [{ connection }] = useContext(SocketContext);
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState(4455);
  const [password, setPassword] = useState('');
  const [retry, setRetry] = useState(false);

  const tryConnect = useCallback(
    () => void connect(connection, host, port, password).catch(console.error),
    [connection, host, port, password],
  );

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
        <input type="text" value={host} onChange={e => setHost(e.target.value)} />
      </Row>
      <Row className="border p-3 mx-3">
        <p>Port:</p>
        <input type="number" value={port} onChange={e => setPort(e.target.valueAsNumber)} />
      </Row>
      <Row className="border p-3 mx-3">
        <p>Password (leave empty if not applicable):</p>
        <input type="string" value={password} onChange={e => setPassword(e.target.value)} />
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
