import { useContext, useEffect, useState } from 'react';
import { SocketContext, Action } from '../SocketProvider';
import { Button, Form } from 'react-bootstrap';
import { call, stopMedia } from '../utils/obs';

const InputSelect = ({ options }: { options: string[] }) => {
  const [selected, setSelected] = useState('');
  const [store, dispatch] = useContext(SocketContext);

  const submit = async () => {
    const oldInputName = store.inputName;
    const conn = store.connection;

    if (oldInputName) {
      await stopMedia(conn, oldInputName);
    }

    const input = await call(conn, 'GetInputSettings', { inputName: selected });
    const settingsResp = await call(conn, 'GetInputDefaultSettings', {
      inputKind: input.inputKind,
    });

    const settings = {
      ...settingsResp.defaultInputSettings,
      ...input.inputSettings,
    };

    dispatch({ type: Action.SetInput, data: selected });
    dispatch({ type: Action.MergeSettings, data: settings });
  };

  useEffect(() => {
    if (options && !selected) {
      setSelected(options[0]);
    }
  }, [options, selected]);

  if (!options) {
    options = [];
  }

  return (
    <>
      <Form.Select onChange={e => setSelected(e.target.value)}>
        {options.map((name, idx) => {
          return (
            <option key={idx} value={name}>
              {name}
            </option>
          );
        })}
      </Form.Select>
      <Button variant="primary" onClick={() => void submit()}>
        Submit
      </Button>
    </>
  );
};

export default InputSelect;
