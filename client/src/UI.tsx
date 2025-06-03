// import SelectForm from './SelectForm';
import { use, useContext, useEffect } from 'react';
import { SocketContext } from './SocketProvider';
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

  // if (!socket || !socket.identified) {
  //   return null
  // }

  // socket.call('GetInputList', {
  //   inputKind: 'ffmpeg_source',
  // }).then(response => console.log(response.inputs));

  return null

  // return (
  //   <>
  //     <HelpModal />

  //     <Container className="mt-5">
  //       <Row>
  //         <Col className="border p-3 mx-3">
  //           <p>Current Input: {currentInput}</p>
  //           <SelectForm action="input" options={inputs} />
  //         </Col>

  //         {/* <Col className="border p-3 mx-3">
  //           <p>Current Video: {currentVideo}</p>
  //           <SkipButton />
  //           <p>Next Video: {nextVideo}</p>
  //           <SelectForm action="next" options={videos} />
  //         </Col> */}
  //       </Row>
  //       <Row className="border p-3 mx-3">
  //         <p>Current Video: {currentVideo}</p>
  //         <SkipButton />

  //         <NextList />
  //       </Row>
  //     </Container>
  //   </>
  // );
};

export default UI;
