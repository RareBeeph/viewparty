import { Container, Row, Col, Button, Modal } from 'react-bootstrap';
import { useState } from 'react';

const HelpModal = () => {
  const [show, setShow] = useState(false);

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  return (
    <>
      <Container className="bg-secondary">
        <Row>
          <Col className="px-4">
            <h1>Viewparty</h1>
          </Col>

          <Col className="px-4 align-content-center">
            <Button className="btn btn-light float-end" onClick={handleShow}>
              Help
            </Button>
          </Col>
        </Row>
      </Container>

      <Modal className="text-black" show={show}>
        <Modal.Header>
          <h1 className="modal-title">Help</h1>
          <Button className="btn-close" onClick={handleClose} />
        </Modal.Header>
        <Modal.Body>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate, nesciunt?
            Perspiciatis, perferendis voluptatum obcaecati at laborum nesciunt accusantium quo,
            voluptates molestiae, delectus omnis placeat enim alias rem necessitatibus dolorum
            eaque?
          </p>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default HelpModal;
