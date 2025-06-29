import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../SocketProvider';
import { Col, Container, Row } from 'react-bootstrap';

import HelpModal from './HelpModal';
import NextList from './NextList';
import SelectForm from './SelectForm';

const UI = () => {
  const obs = useContext(SocketContext);
  const [options, setOptions] = useState([] as Record<'inputName', string>[]);

  useEffect(() => {
    const interval = setInterval(() => {
      obs
        .getInputList()
        .then(list => setOptions(list))
        .catch(console.error);
    }, 5000);
    return () => clearInterval(interval);
  }, [obs]); // TODO: rerender on obs.inputName change

  return (
    <>
      <HelpModal />

      <Container className="mt-5">
        <Row>
          <Col className="border p-3 mx-3">
            <p>Current Input: {obs.inputName || 'n/a'}</p>
            <SelectForm action="input" options={options.map(e => e.inputName)} />
          </Col>
        </Row>
        <Row className="border p-3 mx-3">
          <p>
            Current Video:{' '}
            {obs.settings.local_file.slice(obs.settings.local_file.lastIndexOf('/') + 1) || 'n/a'}
          </p>
          <NextList />
        </Row>
      </Container>
    </>
  );
};

export default UI;
