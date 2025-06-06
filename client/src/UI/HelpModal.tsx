import { Container, Row, Col, Button, Modal } from 'react-bootstrap';
import { useState } from 'react';

const HelpModal = () => {
  const [show, setShow] = useState(false);

  // For small wrappers like this it's not really worth the visual noise of
  // giving these handlers a persistent reference, since they're recreated
  // every time the component renders anyways. Best practice is to keep them
  // inline on the props
  // const handleShow = () => setShow(true);
  // const handleClose = () => setShow(false);

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
