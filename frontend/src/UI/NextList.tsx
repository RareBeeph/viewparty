import { useContext } from 'react';
import VideoEntry from './VideoEntry';
import { Button, Row, Col } from 'react-bootstrap';
// import { SocketContext } from '../SocketProvider';
import { SocketContext } from '../SocketProvider';

const NextList = () => {
  const obs = useContext(SocketContext);

  const updateOne = (idx: number, name: string) => {
    obs.queue = obs.queue.slice(0, idx).concat([name], obs.queue.slice(idx + 1));
  };

  const addBelow = (idx: number) => {
    obs.queue = obs.queue.slice(0, idx + 1).concat([''], obs.queue.slice(idx + 1));
  };

  const removeOne = (idx: number) => {
    obs.queue = obs.queue.slice(0, idx).concat(obs.queue.slice(idx + 1));
  };

  const skip = () => {
    obs
      .stopMedia()
      .then(() => {
        obs.changeMedia.bind(obs);
      })
      .catch(console.error);
    removeOne(0);
  };

  return (
    <>
      <Row>
        <Button onClick={skip}>Skip</Button>
      </Row>
      <Row>
        <Button onClick={() => addBelow(-1)}>Add Below</Button>
      </Row>
      {obs.queue.map((name, idx) => {
        return (
          <Row key={idx} value={name}>
            <Col>
              <Button onClick={() => addBelow(idx)}>Add Below</Button>
            </Col>
            <Col>
              <VideoEntry
                name={name}
                updateSelf={(name: string) => {
                  updateOne(idx, name);
                }}
              />
            </Col>
            <Col>
              <Button onClick={() => removeOne(idx)}>Remove</Button>
            </Col>
          </Row>
        );
      })}
    </>
  );
};

export default NextList;
