import { useCallback, useContext, useEffect, useState } from 'react';
import VideoEntry from './VideoEntry';
import { Button, Row, Col } from 'react-bootstrap';
import { SocketContext } from '../SocketProvider';
import { changeMedia, isMediaStopped, stopMedia } from '../HelperFunctions/Obs';
import {
  addBelow,
  pickNextVideo,
  removeOne,
  updateOne,
  filteredVideoList,
} from '../HelperFunctions/Queue';

const defaultQueue: string[] = [];

const NextList = () => {
  const [{ connection, inputName, settings }, setData] = useContext(SocketContext);
  const defaultVideos: string[] = [];
  const [videos, setVideos] = useState(defaultVideos); // TODO: useQuery
  const [queue, setQueue] = useState(defaultQueue);

  const changeMediaAndSetState = useCallback(async () => {
    const newVideos = await filteredVideoList();
    setVideos(newVideos);

    const { next, newQueue } = inputName
      ? pickNextVideo(queue, newVideos)
      : { next: '', newQueue: undefined };
    if (newQueue) {
      setQueue(newQueue);
    }

    const newData = await changeMedia(connection, inputName, settings, next);
    if (newData) {
      setData(newData);
    }
  }, [setVideos, setQueue, setData, queue, connection, inputName, settings]);

  const mediaChangeCallback = useCallback(() => {
    (async () => {
      const mediaStopped = await isMediaStopped(connection, inputName);
      if (connection.identified && mediaStopped) {
        await changeMediaAndSetState();
      }
    })().catch(console.error);
  }, [connection, inputName, changeMediaAndSetState]);

  useEffect(() => {
    filteredVideoList().then(setVideos).catch(console.error); // so we update our video options immediately
    const mediaChangeInterval = setInterval(mediaChangeCallback, 5000);
    return () => {
      clearInterval(mediaChangeInterval);
    };
  }, [mediaChangeCallback]);

  const defaultName = videos?.[0] || '';

  const skip = () => {
    (async () => {
      await stopMedia(connection, inputName);
      await changeMediaAndSetState();
    })().catch(console.error);
  };

  return (
    <>
      <Row>
        <Button onClick={skip}>Skip</Button>
      </Row>
      <Row>
        <Button onClick={() => setQueue(addBelow(queue, -1, defaultName))}>Add Below</Button>
      </Row>
      {queue.map((name, idx) => {
        return (
          <Row key={idx} value={name}>
            <Col>
              <Button onClick={() => setQueue(addBelow(queue, idx, defaultName))}>Add Below</Button>
            </Col>
            <Col>
              <VideoEntry
                name={name}
                videos={videos}
                updateSelf={(name: string) => {
                  setQueue(updateOne(queue, idx, name));
                }}
              />
            </Col>
            <Col>
              <Button onClick={() => setQueue(removeOne(queue, idx))}>Remove</Button>
            </Col>
          </Row>
        );
      })}
    </>
  );
};

export default NextList;
