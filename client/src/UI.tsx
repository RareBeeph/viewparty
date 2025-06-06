import { useContext, useEffect, useState } from 'react';
import { SocketContext } from './SocketProvider';
import { HelpModal, SelectForm, SkipButton, NextList } from './uiElements';
import { Col, Container, Row } from 'react-bootstrap';

const UI = () => {
  const obs = useContext(SocketContext);
  const [options, setOptions] = useState([] as Record<'inputName', string>[]);

  useEffect(() => {
    obs.inputList
      .then(inputList => setOptions(inputList))
      .catch(() => {
        console.log('Obs.inputList() failed in UI.tsx Effect callback');
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
