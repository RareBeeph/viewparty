import { useContext, useEffect, useState } from 'react';
import { SocketContext } from './socketcontext';

const SelectForm = ({ action, options }: { action: string; options: string }) => {
  const [selected, setSelected] = useState('');
  const { socket, state } = useContext(SocketContext);

  const submit = () => {
    const input = {
      action: action,
      data: selected,
    };
    socket?.sendMessage(JSON.stringify(input));
  };

  useEffect(() => {
    if (state[options] && !selected) {
      setSelected(state[options][0]);
    }
  }, [state]);

  if (state) {
    if (state[options]) {
      const inputs = state[options];
      if (typeof inputs === 'string') {
        return;
      }
      return (
        <>
          <select onChange={e => setSelected(e.target.value)}>
            {inputs.map((name, idx) => {
              return (
                <option key={idx} value={name}>
                  {name}
                </option>
              );
            })}
          </select>
          <button onClick={submit}>Submit</button>
        </>
      );
    }
  }

  return (
    <>
      <select onChange={e => setSelected(e.target.value)} />
      <button onClick={submit}>Submit</button>
    </>
  );
};

export default SelectForm;
