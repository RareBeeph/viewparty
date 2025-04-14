import SelectForm from './SelectForm';
import { useContext } from 'react';
import { SocketContext } from './SocketProvider';
import SkipButton from './SkipButton';
import { Container, Row, Col } from 'react-bootstrap';
import HelpModal from './HelpModal';

const UI = () => {
  const {
    state: { inputs, videos, currentInput, currentVideo, nextVideo },
  } = useContext(SocketContext);

  if (typeof inputs === 'string' || typeof videos === 'string') {
    return null;
  }

  return (
    <>
      <HelpModal />

      <Container className="mt-5">
        <Row>
          <Col className="border p-3 mx-3">
            <p>Current Input: {currentInput}</p>
            <SelectForm action="input" options={inputs} />
          </Col>

          <Col className="border p-3 mx-3">
            <p>Current Video: {currentVideo}</p>
            <SkipButton />
            <p>Next Video: {nextVideo}</p>
            <SelectForm action="next" options={videos} />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default UI;
