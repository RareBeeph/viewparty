import { useContext } from 'react';
import { SocketContext } from '../SocketProvider';
import { Button } from 'react-bootstrap';

const SkipButton = () => {
  const obs = useContext(SocketContext);

  const submit = () => {
    obs.changeMedia();
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
