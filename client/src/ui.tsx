import SelectForm from './selectform';
import { useContext } from 'react';
import { SocketContext } from './socketcontext';

const UI = () => {
  const {
    state: { inputs, videos },
  } = useContext(SocketContext);

  if (![inputs, videos].every(Array.isArray)) {
    return null;
  }

  return (
    <>
      <SelectForm action="input" options={inputs as string[]} />
      <SelectForm action="next" options={videos as string[]} />
    </>
  );
};

export default UI;
