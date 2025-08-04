import { useCallback, useContext, useEffect, useState } from 'react';
import VideoEntry from './VideoEntry';
import { Button, Row, Col } from 'react-bootstrap';
import { SocketContext } from '../SocketProvider';
import { isMediaStopped, stopMedia } from '../utils/obs';
import { addBelow, pickNextVideo, removeOne, updateOne, filteredVideoList } from '../utils/queue';

const justThrow = (e: unknown) => {
  throw e;
};

const NextList = () => {
  const [{ connection, inputName }, dispatch] = useContext(SocketContext);
  const [videos, setVideos] = useState([] as string[]); // TODO: useQuery
  const [queue, setQueue] = useState([] as string[]);

  // Handler to change media and retrieve new video list
  const changeMediaAndSetState = useCallback(async () => {
    const newVideos = await filteredVideoList();
    setVideos(newVideos);

    if (!inputName) return;

    const { next, newQueue } = pickNextVideo(queue, newVideos);
    if (newQueue) setQueue(newQueue);

    dispatch({ type: 'media', data: { nextVideo: next } });
  }, [setVideos, setQueue, dispatch, queue, inputName]);

  // Listener to regularly check if the video stopped playing
  useEffect(() => {
    filteredVideoList().then(setVideos).catch(console.error); // so we update our video options immediately
    const mediaChangeInterval = setInterval(() => {
      (async () => {
        const mediaStopped = await isMediaStopped(connection, inputName);
        if (connection.identified && mediaStopped) {
          await changeMediaAndSetState();
        }
      })().catch(console.error);
    }, 5000);
    return () => {
      clearInterval(mediaChangeInterval);
    };
  }, [connection, inputName, changeMediaAndSetState]);

  const defaultName = videos?.[0] || '';

  const skip = async () => {
    await stopMedia(connection, inputName);
    await changeMediaAndSetState();
  };

  return (
    <>
      <Row>
        <Button
          onClick={() => {
            skip().catch(justThrow);
          }}
        >
          Skip
        </Button>
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
