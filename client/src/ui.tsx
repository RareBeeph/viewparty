import SelectForm from './selectform';
import { useContext } from 'react';
import { SocketContext } from './socketcontext';

const UI = () => {
  const { state } = useContext(SocketContext);

  const inputs = state.inputs;
  const videos = state.videos;

  if (typeof inputs == 'string' || typeof videos == 'string') {
    return;
  }

  return (
    <>
      <SelectForm action="input" options={inputs} />
      <SelectForm action="next" options={videos} />
    </>
  );
};

export default UI;
