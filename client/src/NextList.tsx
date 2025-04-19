import { useContext, useEffect, useState } from 'react';
import VideoEntry from './VideoEntry';
import { Button, Row, Col } from 'react-bootstrap';
import { SocketContext } from './SocketProvider';

const NextList = () => {
  // this is gonna temporarily be the arbiter of the list, as opposed to storing it on the backend,
  // because i'll have to implement the functionality to store and refer to it in the backend
  const defaultState: string[] = [''];
  const [videoList, setVideoList] = useState(defaultState);
  const {
    socket,
    state: { currentVideo },
  } = useContext(SocketContext);

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
    const input = {
      action: 'next',
      data: videoList[0],
    };
    socket?.sendMessage(JSON.stringify(input));
  };

  useEffect(() => {
    if (videoList.length > 1) {
      removeOne(0);
    }
  }, [currentVideo]);
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
