import { Container, Row, Col, Button, Modal } from 'react-bootstrap';
import { useContext, useState } from 'react';
import { SocketContext } from '../SocketProvider';

const HelpModal = () => {
  const [{ connection }] = useContext(SocketContext);
  const [show, setShow] = useState(false);

  return (
    <>
      <Container className="bg-secondary">
        <Row>
          <Col className="px-4">
            <h1>Viewparty</h1>
          </Col>

          <Col className="px-4 d-flex align-content-center justify-content-end">
            <Button variant="light" className="m-2" onClick={() => void connection.disconnect()}>
              Disconnect
            </Button>
            <Button variant="light" className="my-2" onClick={() => setShow(true)}>
              Help
            </Button>
          </Col>
        </Row>
      </Container>

      <Modal className="text-black" show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Help</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate, nesciunt?
          Perspiciatis, perferendis voluptatum obcaecati at laborum nesciunt accusantium quo,
          voluptates molestiae, delectus omnis placeat enim alias rem necessitatibus dolorum eaque?
        </Modal.Body>
      </Modal>
    </>
  );
};

export default HelpModal;
