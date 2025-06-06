// import SelectForm from './SelectForm';
import { useContext, useEffect, useState } from 'react';
import { SocketContext } from './SocketProvider';
import HelpModal from './HelpModal';
import { Col, Container, Row } from 'react-bootstrap';
import SelectForm from './SelectForm';
import SkipButton from './SkipButton';
import NextList from './NextList';
// import SkipButton from './SkipButton';
// import { Container, Row, Col } from 'react-bootstrap';
// import HelpModal from './HelpModal';
// import NextList from './NextList';

const UI = () => {
  // const {
  //   state: { inputs, videos, currentInput, currentVideo, err },
  // } = useContext(SocketContext);
  const obs = useContext(SocketContext)
  const [ options, setOptions ] = useState([] as Record<'inputName',string>[])

  useEffect(() => {
    obs.inputList.then(inputList => setOptions(inputList))
  })

  // if (typeof inputs === 'string' || typeof videos === 'string') {
  //   return null;
  // }

  // if (err) {
  //   return <h1>{err}</h1>;
  // }

  return (
    <>
      <HelpModal />

      <Container className="mt-5">
        <Row>
          <Col className="border p-3 mx-3">
            <p>Current Input: { obs.inputName || 'n/a' }</p>
            <SelectForm action="input" options={options.map((e) => e.inputName)} />
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
          { <SkipButton /> }

          { <NextList /> }
        </Row>
      </Container>
    </>
  );
};

export default UI;
