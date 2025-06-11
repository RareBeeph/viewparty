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

  // Your previous effect caused this component to infinitely re-render
  // because it had no dependency list (second parameter). We DO want to
  // continually update this information, but not every few milliseconds.
  useEffect(() => {
    const interval = setInterval(() => {
      obs
        .getInputList()
        .then(list => setOptions(list))
        .catch(console.error);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
