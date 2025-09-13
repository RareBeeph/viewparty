import { useCallback, useContext, useEffect, useState } from 'react';
import VideoEntry from './VideoEntry';
import { Action, SocketContext } from '../SocketProvider';
import { call, isMediaStopped, stopMedia } from '../utils/obs';
import { addBelow, pickNextVideo, removeOne, updateOne, filteredVideoList } from '../utils/queue';
import { GetBasePath } from '../../wailsjs/go/main/App';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getConfig, saveConfig } from '../utils/config';
import { Button, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/DeleteOutline';

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
    queryKey: ['config'],
    queryFn: getConfig,
  });
  const queryClient = useQueryClient();
  const configMutation = useMutation({
    mutationFn: async (sourceDir: string) => {
      if (!configQuery.data) return;
      await saveConfig({ ...configQuery.data, sourceDir });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['config'] });
    },
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
    <Stack spacing={1}>
      <Typography variant="body1">
        Current Video:{' '}
        {settings.local_file.slice(settings.local_file.lastIndexOf('/') + 1) || 'n/a'}
      </Typography>

      <Button
        variant="contained"
        onClick={() => {
          skip().catch(justThrow);
        }}
      >
        Skip
      </Button>

      <Stack spacing={1}>
        <Paper elevation={2} sx={{ padding: 2 }}>
          <Typography variant="body1">Queue:</Typography>
          <Stack direction="row">
            {/* hackjob */}
            <Stack spacing={3}>
              {['first'].concat(queue).map((_name, idx) => {
                return (
                  <IconButton
                    key={idx}
                    onClick={() => setQueue(addBelow(queue, idx - 1, defaultName))}
                  >
                    <AddIcon />
                  </IconButton>
                );
              })}
            </Stack>

            <Stack spacing={1} sx={{ paddingY: 3 }}>
              {queue.map((name, idx) => {
                return (
                  <Stack key={idx} direction="row">
                    <IconButton onClick={() => setQueue(removeOne(queue, idx))}>
                      <DeleteIcon />
                    </IconButton>
                    <VideoEntry
                      name={name}
                      videos={videos.isSuccess ? videos.data : []}
                      updateSelf={(name: string) => {
                        setQueue(updateOne(queue, idx, name));
                      }}
                    />
                  </Stack>
                );
              })}
            </Stack>
          </Stack>
        </Paper>

        <Paper elevation={3} sx={{ padding: 2 }}>
          <Typography variant="body1">Source directory: </Typography>
          <TextField
            value={sourceDir}
            fullWidth
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSourceDir(e.target.value);
              if (!configQuery.data) return;
              configMutation.mutate(e.target.value);
            }}
          />
        </Paper>
      </Stack>
    </Stack>
  );
};

export default NextList;
