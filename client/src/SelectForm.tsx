import { useContext, useEffect, useState } from 'react';
import { SocketContext } from './SocketProvider';

const SelectForm = ({ action, options }: { action: string; options: string[] }) => {
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
    if (options && !selected) {
      setSelected(options[0]);
    }
  }, [state]);

  if (!options) {
    options = [];
  }

  return (
    <>
      <select className="form-select" onChange={e => setSelected(e.target.value)}>
        {options.map((name, idx) => {
          return (
            <option key={idx} value={name}>
              {name}
            </option>
          );
        })}
      </select>
      <button className="btn btn-primary" onClick={submit}>
        Submit
      </button>
    </>
  );
};

export default SelectForm;
