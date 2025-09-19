import { useContext, useEffect, useState } from 'react';
import { SocketContext, Action } from '../SocketProvider';
import { Button, FormControl, InputLabel, Select, MenuItem, Stack } from '@mui/material';
import { call, stopMedia } from '../utils/obs';
import { useSnackbar } from 'notistack';

const InputSelect = ({ label, options }: { label: string; options: string[] }) => {
  const [selected, setSelected] = useState('');
  const [store, dispatch] = useContext(SocketContext);
  const { enqueueSnackbar } = useSnackbar();

  const submit = async () => {
    const oldInputName = store.inputName;
    const conn = store.connection;

    if (oldInputName) {
      await stopMedia(conn, oldInputName);
    }

    const input = await call(conn, 'GetInputSettings', { inputName: selected });
    const settingsResp = await call(conn, 'GetInputDefaultSettings', {
      inputKind: input.inputKind,
    });

    const settings = {
      ...settingsResp.defaultInputSettings,
      ...input.inputSettings,
    };

    dispatch({ type: Action.SetInput, data: selected });
    dispatch({ type: Action.MergeSettings, data: settings });
  };

  useEffect(() => {
    if (options && !selected) {
      setSelected(options[0]);
    }
  }, [options, selected]);

  if (!options) {
    options = [];
  }

  return (
    <Stack spacing={1}>
      <FormControl fullWidth>
        <InputLabel id="inputs">{label}</InputLabel>
        <Select
          labelId="inputs"
          label={label}
          variant="outlined"
          defaultValue=""
          onChange={e => {
            setSelected(e.target.value);
          }}
        >
          {options.map((name, idx) => {
            return (
              <MenuItem key={idx} value={name}>
                {name}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      <Button
        variant="contained"
        onClick={() =>
          void submit().catch(reason => {
            enqueueSnackbar(
              <>
                {'Failed to change selected input.'}
                <br />
                {'(' + reason + ')'}
              </>,
            );
          })
        }
      >
        Submit
      </Button>
    </Stack>
  );
};

export default InputSelect;
