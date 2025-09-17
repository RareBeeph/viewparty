import { useCallback, useContext, useEffect, useState } from 'react';
import VideoEntry from './VideoEntry';
import { Action, SocketContext } from '../SocketProvider';
import { call, isMediaStopped, stopMedia } from '../utils/obs';
import { addBelow, pickNextVideo, removeOne, updateOne, filteredVideoList } from '../utils/queue';
import { DirDialog, GetBasePath } from '../../wailsjs/go/main/App';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getConfig, saveConfig } from '../utils/config';
import { Button, Container, IconButton, Paper, Stack, Typography } from '@mui/material';
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
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography variant="body1">Queue:</Typography>
          <Stack spacing={1}>
            {/* zeroth row of the following map, to provide an Add button for before the first entry */}
            <Stack key={0} direction="row">
              <IconButton onClick={() => setQueue(addBelow(queue, -1, defaultName))}>
                <AddIcon />
              </IconButton>
            </Stack>

            {queue.map((name, idx) => (
              <Stack key={idx + 1} direction="row" sx={{ alignItems: 'flex-start' }}>
                {/* TODO: deal with magic positioning numbers and div shenanigans */}
                <IconButton
                  sx={{ position: 'relative', top: 13 }}
                  onClick={() => setQueue(addBelow(queue, idx, defaultName))}
                >
                  <AddIcon />
                </IconButton>

                <IconButton
                  sx={{ position: 'relative', top: -17 }}
                  onClick={() => setQueue(removeOne(queue, idx))}
                >
                  <DeleteIcon />
                </IconButton>

                <Container sx={{ position: 'relative', top: -25 }}>
                  <VideoEntry
                    name={name}
                    videos={videos.isSuccess ? videos.data : []}
                    onSelect={(name: string) => {
                      setQueue(updateOne(queue, idx, name));
                    }}
                  />
                </Container>
              </Stack>
            ))}
          </Stack>
        </Paper>

        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="body1">Source directory: {sourceDir}</Typography>
          <Button
            variant="contained"
            onClick={() => {
              (async () => {
                const dir = await DirDialog();
                if (!dir) return;
                setSourceDir(dir);
                if (!configQuery.data) return;
                configMutation.mutate(dir);
              })().catch(console.error);
            }}
          >
            Change
          </Button>
        </Paper>
      </Stack>
    </Stack>
  );
};

export default NextList;
