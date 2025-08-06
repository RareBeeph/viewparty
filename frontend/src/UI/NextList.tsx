import { useCallback, useContext, useEffect, useState } from 'react';
import VideoEntry from './VideoEntry';
import { Button, Row, Col } from 'react-bootstrap';
import { Action, SocketContext } from '../SocketProvider';
import { call, isMediaStopped, stopMedia } from '../utils/obs';
import { addBelow, pickNextVideo, removeOne, updateOne, filteredVideoList } from '../utils/queue';
import { GetBasePath } from '../../wailsjs/go/main/App';

const justThrow = (e: unknown) => {
  throw e;
};

const NextList = () => {
  const [{ connection, inputName, settings }, dispatch] = useContext(SocketContext);
  const [videos, setVideos] = useState([] as string[]); // TODO: useQuery
  const [queue, setQueue] = useState([] as string[]);

  // Handler to change media and retrieve new video list
  const changeMediaAndSetState = useCallback(async () => {
    const newVideos = await filteredVideoList();
    setVideos(newVideos);

    if (!inputName) return;

    const { next, newQueue } = pickNextVideo(queue, newVideos);
    if (newQueue) setQueue(newQueue);

    if (!next) return;

    const nextPath = (await GetBasePath()) + next;

    // observation: if the same video that just finished is picked again, this does nothing
    try {
      await call(connection, 'SetInputSettings', {
        inputName: inputName,
        inputSettings: { ...settings, local_file: nextPath },
      });
    } catch {
      console.log('Failed to change media.');
      // future media change attempts short-circuit on empty input name
      // so this assign means we only fail once
      dispatch({ type: Action.SetInput, data: '' });
    }

    dispatch({ type: Action.MergeSettings, data: { nextVideo: next, local_file: nextPath } });
  }, [setVideos, setQueue, dispatch, queue, inputName, settings, connection]);

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
