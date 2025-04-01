import { useContext, useEffect, useState } from 'react';
import { SocketContext } from './socketcontext';

const SelectForm = (props: { action: string; options: string }) => {
  const [selected, setSelected] = useState('');
  const socket = useContext(SocketContext);

  const submit = () => {
    const input = {
      action: props.action,
      data: selected,
    };
    if (socket.socket !== null) {
      socket.socket.sendMessage(JSON.stringify(input));
    }
  };

  useEffect(() => {
    if (socket.state[props.options] && !selected) {
      setSelected(socket.state[props.options][0]);
    }
  }, [socket.state]);

  if (socket.state) {
    if (socket.state[props.options]) {
      const inputs = socket.state[props.options];
      if (typeof inputs === 'string') {
        return;
      }
      return (
        <>
          <select onChange={e => setSelected(e.target.value)}>
            {inputs.map((o, i) => {
              return (
                <option key={i} value={o}>
                  {o}
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
