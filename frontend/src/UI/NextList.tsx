import { useCallback, useContext, useEffect, useState } from 'react';
import VideoEntry from './VideoEntry';
import { Button, Row, Col } from 'react-bootstrap';
import { SocketContext } from '../SocketProvider';
import { GetBasePath, GetVideos } from '../../wailsjs/go/main/App';
import { call, isMediaStopped, stopMedia } from '../Obs';

const defaultQueue: string[] = [];

const NextList = () => {
  const [{ connection, inputName, settings }, setData] = useContext(SocketContext);
  const defaultVideos: string[] = [];
  const [videos, setVideos] = useState(defaultVideos); // TODO: useQuery
  const [queue, setQueue] = useState(defaultQueue);

  const updateOne = (idx: number, name: string) => {
    setQueue(queue.slice(0, idx).concat([name], queue.slice(idx + 1)));
  };

  const addBelow = (idx: number) => {
    setQueue(queue.slice(0, idx + 1).concat([videos?.[0] || ''], queue.slice(idx + 1)));
  };

  const removeOne = (idx: number) => {
    setQueue(queue.slice(0, idx).concat(queue.slice(idx + 1)));
  };

  const updateVideoList = useCallback(async () => {
    const allowed_filetypes = ['.webm', '.mkv'];
    // subbed in shenanigans in place of Node function
    const files = (await GetVideos()).filter(file =>
      allowed_filetypes
        .map(filetype => file.endsWith(filetype))
        .reduce((acc, curr) => acc || curr, false),
    );
    setVideos(files);

    return files;
  }, []);

  const changeMedia = useCallback(async () => {
    if (!inputName) {
      return;
    }

    const files = await updateVideoList();

    // shenanigans in place of Node function
    const randomInt = (max: number) => Math.floor(max * Math.random());

    if (queue.length === 0) {
      settings.local_file = (await GetBasePath()) + files[randomInt(files.length)];
    } else {
      // also replacing Node function
      settings.local_file = (await GetBasePath()) + queue[0];
      setQueue(queue.slice(1));
    }

    // observation: if the same video that just finished is picked again, this does nothing
    try {
      await call(connection, 'SetInputSettings', {
        inputName: inputName,
        inputSettings: settings,
      });
    } catch {
      console.log('Failed to change media.');

      // future media change attempts short-circuit on empty input name
      // so this assign means we only fail once
      setData({ connection, settings, inputName: '' });
    }

    setData({ connection, inputName, settings });
    return;
  }, [connection, inputName, settings, setData, queue, updateVideoList]);

  const skip = () => {
    stopMedia(connection, inputName)
      .then(() => {
        changeMedia().catch(console.error);
      })
      .catch(console.error);
    removeOne(0);
  };

  const mediaChangeCallback = useCallback(() => {
    isMediaStopped(connection, inputName)
      .then((mediaStopped: boolean) => {
        if (connection.identified && mediaStopped) {
          changeMedia().catch(console.error);
        }
        return;
      })
      .catch(err => console.error('Media change interval failure', err));
  }, [connection, inputName, changeMedia]);

  useEffect(() => {
    updateVideoList().catch(console.error); // so we update our video options immediately
    const mediaChangeInterval = setInterval(mediaChangeCallback, 5000);
    return () => {
      clearInterval(mediaChangeInterval);
    };
  }, [mediaChangeCallback, updateVideoList]);

  return (
    <>
      <Row>
        <Button onClick={skip}>Skip</Button>
      </Row>
      <Row>
        <Button onClick={() => addBelow(-1)}>Add Below</Button>
      </Row>
      {queue.map((name, idx) => {
        return (
          <Row key={idx} value={name}>
            <Col>
              <Button onClick={() => addBelow(idx)}>Add Below</Button>
            </Col>
            <Col>
              <VideoEntry
                name={name}
                videos={videos}
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
