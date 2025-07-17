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

const NextList = () => {
  const [{ connection, inputName, settings }, setData] = useContext(SocketContext);
  const [videos, setVideos] = useState([] as string[]); // TODO: useQuery
  const [queue, setQueue] = useState([] as string[]);

  // Whenever you start a new block like this it's helpful to describe
  // what you're going to be doing and why. Much of this is going to change
  // with a reducer, but I'll write some examples:
  // --
  // Handler to change media and retrieve new video list
  const changeMediaAndSetState = useCallback(async () => {
    const newVideos = await filteredVideoList();
    setVideos(newVideos);

    if (!inputName) {
      return;
    }

    const { next, newQueue } = pickNextVideo(queue, newVideos);
    newQueue && setQueue(newQueue);

    const newData = await changeMedia(connection, inputName, settings, next);
    if (newData) {
      setData(newData);
    }
  }, [setVideos, setQueue, setData, queue, connection, inputName, settings]);

  // Listener to regularly check if the video stopped playing
  useEffect(() => {
    filteredVideoList().then(setVideos).catch(console.error); // so we update our video options immediately
    const mediaChangeInterval = setInterval(async () => {
      const mediaStopped = await isMediaStopped(connection, inputName);
      if (connection.identified && mediaStopped) {
        await changeMediaAndSetState();
      }
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
