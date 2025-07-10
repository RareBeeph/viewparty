import { useCallback, useContext, useEffect, useState } from 'react';
import VideoEntry from './VideoEntry';
import { Button, Row, Col } from 'react-bootstrap';
import { SocketContext } from '../SocketProvider';
import { GetBasePath, GetVideos } from '../../wailsjs/go/main/App';

const defaultQueue: string[] = [];

const NextList = () => {
  const obs = useContext(SocketContext);
  const [queue, setQueue] = useState(defaultQueue);

  const updateOne = (idx: number, name: string) => {
    setQueue(queue.slice(0, idx).concat([name], queue.slice(idx + 1)));
  };

  const addBelow = (idx: number) => {
    setQueue(queue.slice(0, idx + 1).concat([obs.videos?.[0] || ''], queue.slice(idx + 1)));
  };

  const removeOne = (idx: number) => {
    setQueue(queue.slice(0, idx).concat(queue.slice(idx + 1)));
  };

  const changeMedia = useCallback(async () => {
    if (!obs.inputName) {
      return;
    }

    const allowed_filetypes = ['.webm', '.mkv'];

    // subbed in shenanigans in place of Node function
    const files = (await GetVideos()).filter(file =>
      allowed_filetypes
        .map(filetype => file.endsWith(filetype))
        .reduce((acc, curr) => acc || curr, false),
    );
    obs.videos = files;

    // shenanigans in place of Node function
    const randomInt = (max: number) => Math.floor(max * Math.random());

    if (queue.length === 0) {
      obs.settings.local_file = (await GetBasePath()) + files[randomInt(files.length)];
    } else {
      // also replacing Node function
      obs.settings.local_file = (await GetBasePath()) + queue[0];
      setQueue(queue.slice(1));
    }

    // observation: if the same video that just finished is picked again, this does nothing
    try {
      await obs.connection?.call('SetInputSettings', {
        inputName: obs.inputName,
        inputSettings: obs.settings,
      });
    } catch {
      console.log('Failed to change media.');

      // future media change attempts short-circuit on empty input name
      // so this assign means we only fail once
      obs.inputName = '';
    }

    return;
  }, [obs, queue]);

  const skip = () => {
    obs
      .stopMedia()
      .then(() => {
        changeMedia().catch(console.error);
      })
      .catch(console.error);
    removeOne(0);
  };

  useEffect(() => {
    const mediaChangeInterval = setInterval(() => {
      obs
        .isMediaStopped()
        .then((mediaStopped: boolean) => {
          if (obs.connected && mediaStopped) {
            changeMedia().catch(console.error);
          }
          return;
        })
        .catch(err => console.error('Media change interval failure', err));
    }, 5000);

    return () => {
      clearInterval(mediaChangeInterval);
    };
  }, [obs, queue, changeMedia]);

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
