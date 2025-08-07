import { useCallback, useContext, useEffect, useState } from 'react';
import VideoEntry from './VideoEntry';
import { Button, Row, Col } from 'react-bootstrap';
import { Action, SocketContext } from '../SocketProvider';
import { call, isMediaStopped, stopMedia } from '../utils/obs';
import { addBelow, pickNextVideo, removeOne, updateOne, filteredVideoList } from '../utils/queue';
import { GetBasePath } from '../../wailsjs/go/main/App';
import { useQuery } from '@tanstack/react-query';

const justThrow = (e: unknown) => {
  throw e;
};

const lockoutThreshold = (numOptions: number) => {
  return Math.min(Math.floor(numOptions * 0.5), 10);
};

const NextList = () => {
  const [{ connection, inputName, settings }, dispatch] = useContext(SocketContext);
  const videos = useQuery({ queryKey: ['videoOptions'], queryFn: filteredVideoList });
  const [queue, setQueue] = useState([] as string[]);
  const [lockout, setLockout] = useState([] as string[]);

  // Handler to change media and update queue
  const changeMedia = useCallback(async () => {
    if (!inputName || !videos.isSuccess) return;

    const { next, newQueue } = pickNextVideo(
      queue,
      videos.data.filter(v => !lockout.includes(v)),
    );
    if (newQueue) setQueue(newQueue);

    if (!next) return;

    if (lockout.length < lockoutThreshold(videos.data.length)) {
      setLockout([...lockout, next]);
    } else {
      setLockout([...lockout.slice(1), next]);
    }

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
  }, [
    setQueue,
    dispatch,
    queue,
    inputName,
    settings,
    connection,
    videos.isSuccess,
    videos.data,
    lockout,
  ]);

  // Listener to regularly check if the video stopped playing
  useEffect(() => {
    const mediaChangeInterval = setInterval(() => {
      (async () => {
        const mediaStopped = await isMediaStopped(connection, inputName);
        if (connection.identified && mediaStopped) {
          await changeMedia();
        }
      })().catch(console.error);
    }, 5000);
    return () => {
      clearInterval(mediaChangeInterval);
    };
  }, [connection, inputName, changeMedia]);

  const defaultName = videos.data?.[0] ?? '';

  const skip = async () => {
    await stopMedia(connection, inputName);
    await changeMedia();
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
                videos={videos.isSuccess ? videos.data : []}
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
