import { useContext } from 'react';
import { SocketContext } from '../SocketProvider';
import { Paper, Stack, Typography } from '@mui/material';

import HelpModal from './HelpModal';
import NextList from './NextList';
import InputSelect from './InputSelect';
import { getInputList } from '../utils/obs';
import { useQuery } from '@tanstack/react-query';

const UI = () => {
  const [{ connection, inputName }] = useContext(SocketContext);

  const inputListQuery = useQuery({
    queryKey: ['inputList'],
    queryFn: () => {
      console.log('refetching');
      return getInputList(connection);
    }, // connection is an unmarked dependency, but my intuition is saying that's not the particular problem i'm having?
  });

  const options = inputListQuery.isSuccess ? (inputListQuery.data.map(e => e.inputName) ?? []) : [];
  return (
    <>
      <HelpModal />

      <Stack spacing={2} sx={{ m: 2 }}>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Typography variant="body1">Current Input: {inputName ?? 'n/a'}</Typography>
            <Paper elevation={2} sx={{ p: 2 }}>
              <InputSelect label={'Input'} options={options} />
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
