import { useContext, useEffect, useState } from 'react';
import VideoEntry from './VideoEntry';
import { Button, Row, Col } from 'react-bootstrap';
import { SocketContext } from '../SocketProvider';

const defaultState: string[] = [''];

const NextList = () => {
  const [videoList, setVideoList] = useState(defaultState);
  const obs = useContext(SocketContext);

  const updateOne = (idx: number, name: string) => {
    setVideoList(videoList.slice(0, idx).concat([name], videoList.slice(idx + 1)));
  };

  const addBelow = (idx: number) => {
    setVideoList(videoList.slice(0, idx + 1).concat([''], videoList.slice(idx + 1)));
  };

  const removeOne = (idx: number) => {
    setVideoList(videoList.slice(0, idx).concat(videoList.slice(idx + 1)));
  };

  const submit = () => {
    obs
      .stopMedia()
      .then(() => obs.changeMedia())
      .catch(console.error);
  };

  useEffect(() => {
    if (videoList.length > 1) {
      removeOne(0);
    }
  }, [obs.settings.local_file]);
  useEffect(submit, [videoList[0]]);

  return (
    <>
      {videoList.map((name, idx) => {
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
