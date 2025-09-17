import { useCallback, useContext, useEffect, useState } from 'react';
import { SocketContext } from '../SocketProvider';
import { Paper, Stack, Typography } from '@mui/material';

import HelpModal from './HelpModal';
import NextList from './NextList';
import InputSelect from './InputSelect';
import { getInputList } from '../utils/obs';

const UI = () => {
  const [{ connection, inputName }] = useContext(SocketContext);
  const [options, setOptions] = useState([] as Record<'inputName', string>[]);

  // TODO: move this to react-query
  const inputListCallback = useCallback(() => {
    getInputList(connection)
      .then(list => setOptions(list))
      .catch(console.error);
  }, [connection]);

  useEffect(() => {
    inputListCallback(); // so we refresh our input list immediately
    const interval = setInterval(inputListCallback, 5000);
    return () => clearInterval(interval);
  }, [inputListCallback]);

  return (
    <>
      <HelpModal />

      <Stack spacing={2} sx={{ m: 2 }}>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Typography variant="body1">Current Input: {inputName ?? 'n/a'}</Typography>
            <Paper elevation={2} sx={{ p: 2 }}>
              <InputSelect label={'Input'} options={options.map(e => e.inputName)} />
            </Paper>
          </Stack>
        </Paper>

        <Paper elevation={1} sx={{ p: 2 }}>
          <NextList />
        </Paper>
      </Stack>
    </>
  );
};

export default UI;
