import { useContext } from 'react';
import { SocketContext } from './SocketProvider';

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
      <button className="btn btn-primary" onClick={submit}>
        Skip
      </button>
    </>
  );
};

export default SkipButton;
