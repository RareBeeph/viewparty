import { useCallback, useContext, useEffect, useState } from 'react';
import VideoEntry from './VideoEntry';
import { Button, Row, Col, Form } from 'react-bootstrap';
import { Action, SocketContext } from '../SocketProvider';
import { call, isMediaStopped, stopMedia } from '../utils/obs';
import { addBelow, pickNextVideo, removeOne, updateOne, filteredVideoList } from '../utils/queue';
import { GetBasePath } from '../../wailsjs/go/main/App';
import { useQuery } from '@tanstack/react-query';
import { getConfig, saveConfig } from '../utils/config';

const justThrow = (e: unknown) => {
  throw e;
};

const lockoutThreshold = (numOptions: number) => {
  return Math.min(Math.floor(numOptions * 0.5), 10);
};

const NextList = () => {
  const [{ connection, inputName, settings }, dispatch] = useContext(SocketContext);
  const [sourceDir, setSourceDir] = useState('');
  const videos = useQuery({
    queryKey: ['videoOptions', sourceDir],
    queryFn: async () => filteredVideoList(sourceDir),
  });
  const [queue, setQueue] = useState<string[]>([]);
  const [lockout, setLockout] = useState<string[]>([]);
  const configQuery = useQuery({
    queryKey: ['sourceDir'],
    queryFn: getConfig,
  });

  useEffect(() => {
    if (!configQuery.data) return;
    const sd = configQuery.data.sourceDir;
    setSourceDir(sd);
  }, [configQuery.data]);

  // Handler to change media and update queue
  const changeMedia = useCallback(async () => {
    if (!inputName || !videos.isSuccess) return;

    const { next, newQueue } = pickNextVideo(
      queue,
      videos.data.filter(v => !lockout.includes(v)),
    );
    if (newQueue) setQueue(newQueue);

    // Idea: we should maybe define shared behavior for when we can't pick a
    // new video or change media - I like clearing out the input name, can we
    // wrap that up in a `const fail = () => ...`?
    if (!next) return;

    if (lockout.length < lockoutThreshold(videos.data.length)) {
      setLockout([...lockout, next]);
    } else {
      setLockout([...lockout.slice(1), next]);
    }

    const nextPath = (await GetBasePath(sourceDir)) + next;
    try {
      await call(connection, 'SetInputSettings', {
        inputName: inputName,
        inputSettings: { ...settings, local_file: nextPath },
      });
    } catch (e) {
      console.error('Failed to change media', e);
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
    sourceDir,
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
      <Row>
        Source directory:
        <Form.Control
          type="text"
          value={sourceDir}
          onChange={e => {
            setSourceDir(e.target.value);
            if (!configQuery.data) return;
            saveConfig({ ...configQuery.data, sourceDir: e.target.value }).catch(console.error);
          }}
        />
      </Row>
    </>
  );
};

export default NextList;
