import { useContext } from 'react';
import { SocketContext } from '../SocketProvider';
import { Button } from 'react-bootstrap';

const SkipButton = () => {
  const obs = useContext(SocketContext);

  return (
    <Button variant="primary" onClick={() => obs.changeMedia()}>
      Skip
    </Button>
  );
};

export default SkipButton;
