import { useCallback, useContext, useEffect, useState } from 'react';
import { SocketContext } from '../SocketProvider';
import { Col, Container, Row } from 'react-bootstrap';

import HelpModal from './HelpModal';
import NextList from './NextList';
import InputSelect from './InputSelect';
import { getInputList } from '../utils/obs';

const UI = () => {
  const [{ connection, inputName, settings }] = useContext(SocketContext);
  const [options, setOptions] = useState([] as Record<'inputName', string>[]);

  const inputListCallback = useCallback(() => {
    getInputList(connection)
      .then(list => setOptions(list))
      .catch(console.error);
  }, [connection]);

  useEffect(() => {
    inputListCallback(); // so we refresh our input list immediately
    const interval = setInterval(inputListCallback, 5000);
    return () => clearInterval(interval);
  }, [inputListCallback]);

  return (
    <>
      <HelpModal />

      <Container className="mt-5">
        <Row>
          <Col className="border p-3 mx-3">
            <p>Current Input: {inputName || 'n/a'}</p>
            <InputSelect options={options.map(e => e.inputName)} />
          </Col>
        </Row>
        <Row className="border p-3 mx-3">
          <p>
            Current Video:{' '}
            {settings.local_file.slice(settings.local_file.lastIndexOf('/') + 1) || 'n/a'}
          </p>
          <NextList />
        </Row>
      </Container>
    </>
  );
};

export default UI;
