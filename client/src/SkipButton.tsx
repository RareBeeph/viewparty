import { useContext } from 'react';
import { SocketContext } from './SocketProvider';
import { Button } from 'react-bootstrap';

const SkipButton = () => {
  const { socket } = useContext(SocketContext);

  const submit = () => {
    const input = {
      action: 'skip',
    };
    socket?.sendMessage(JSON.stringify(input));
  };

  return (
    <>
      <Button variant="primary" onClick={submit}>
        Skip
      </Button>
    </>
  );
};

export default SkipButton;
