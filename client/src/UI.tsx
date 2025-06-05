// import SelectForm from './SelectForm';
import { useContext } from 'react';
import { SocketContext } from './SocketProvider';
import HelpModal from './HelpModal';
import { Col, Container, Row } from 'react-bootstrap';
// import SkipButton from './SkipButton';
// import { Container, Row, Col } from 'react-bootstrap';
// import HelpModal from './HelpModal';
// import NextList from './NextList';

const UI = () => {
  // const {
  //   state: { inputs, videos, currentInput, currentVideo, err },
  // } = useContext(SocketContext);
  const socket = useContext(SocketContext)

  // if (typeof inputs === 'string' || typeof videos === 'string') {
  //   return null;
  // }

  // if (err) {
  //   return <h1>{err}</h1>;
  // }

  socket.call('GetInputList', {
    inputKind: 'ffmpeg_source',
  }).then(response => console.log(response.inputs));

  return (
    <>
      <HelpModal />

      <Container className="mt-5">
        <Row>
          <Col className="border p-3 mx-3">
            <p>Current Input: n/a {/* currentInput */}</p>
            {/* <SelectForm action="input" options={inputs} /> */}
          </Col>

          {/* <Col className="border p-3 mx-3">
            <p>Current Video: {currentVideo}</p>
            <SkipButton />
            <p>Next Video: {nextVideo}</p>
            <SelectForm action="next" options={videos} />
          </Col> */}
        </Row>
        <Row className="border p-3 mx-3">
          <p>Current Video: n/a {/* currentVideo */}</p>
          {/* <SkipButton /> */}

          {/* <NextList /> */}
        </Row>
      </Container>
    </>
  );
};

export default UI;
