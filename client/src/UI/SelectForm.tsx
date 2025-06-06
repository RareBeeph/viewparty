import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../SocketProvider';
import { Button, Form } from 'react-bootstrap';

const SelectForm = ({ action, options }: { action: string; options: string[] }) => {
  const [selected, setSelected] = useState('');
  const obs = useContext(SocketContext);

  const submit = () => {
    switch (action) {
      case 'input':
        obs.changeInput(selected).catch(() => {
          console.log('Obs.changeInput() failed in SelectForm.tsx');
        });
        break;
      case 'next':
        break;
      default:
    }
  };

  useEffect(() => {
    if (options && !selected) {
      setSelected(options[0]);
    }
  }, [options, !!selected]);

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
      <Button variant="primary" onClick={submit}>
        Submit
      </Button>
    </>
  );
};

export default SelectForm;
