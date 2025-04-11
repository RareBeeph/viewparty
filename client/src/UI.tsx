import SelectForm from './SelectForm';
import { useContext } from 'react';
import { SocketContext } from './SocketProvider';
import SkipButton from './SkipButton';
import { Container, Row, Col } from 'react-bootstrap'

const UI = () => {
  const {
    state: { inputs, videos, currentInput, currentVideo, nextVideo },
  } = useContext(SocketContext);

  if (typeof inputs === 'string' || typeof videos === 'string') {
    return null;
  }

  return (
    <>
      <Container>
        <Row>
          <Col>
            <p>Current Input: {currentInput}</p>
            <SelectForm action="input" options={inputs} />
          </Col>

          <Col>
            <p>Current Video: {currentVideo}</p>
            <SelectForm action="next" options={videos} />

            <p>Next Video: {nextVideo}</p>
            <SkipButton/>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default UI;
