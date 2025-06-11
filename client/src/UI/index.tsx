import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../SocketProvider';
import { Col, Container, Row } from 'react-bootstrap';

import HelpModal from './HelpModal';
import NextList from './NextList';
import SelectForm from './SelectForm';
import SkipButton from './SkipButton';

const UI = () => {
  const obs = useContext(SocketContext);
  const [options, setOptions] = useState([] as Record<'inputName', string>[]);

  useEffect(() => {
    obs
      .getInputList()
      .then(inputList => setOptions(inputList))
      .catch(() => {
        console.log('Obs.getInputList() failed in UI Effect callback');
      });
  });

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
          <p>Current Video: n/a</p>
          <SkipButton />
          <NextList />
        </Row>
      </Container>
    </>
  );
};

export default UI;
