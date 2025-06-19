import { Container, Row, Col, Button, Modal } from 'react-bootstrap';
import { useState } from 'react';

const HelpModal = () => {
  const [show, setShow] = useState(false);

  return (
    <>
      <Container className="bg-secondary">
        <Row>
          <Col className="px-4">
            <h1>Viewparty</h1>
          </Col>

          <Col className="px-4 align-content-center">
            <Button variant="light" className="float-end" onClick={() => setShow(true)}>
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
