import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  AppBar,
  Toolbar,
  Typography,
  Divider,
  Box,
  Stack,
} from '@mui/material';
import { useContext, useState } from 'react';
import { SocketContext } from '../SocketProvider';

const HelpModal = () => {
  const [{ connection }] = useContext(SocketContext);
  const [show, setShow] = useState(false);

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h4" sx={{ flexGrow: 1 }}>
              Viewparty
            </Typography>
            <Divider />
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={() => void connection.disconnect()}>
                Disconnect
              </Button>
              <Button variant="contained" onClick={() => setShow(true)}>
                Help
              </Button>
            </Stack>
          </Toolbar>
        </AppBar>
      </Box>

      <Dialog open={show} onClose={() => setShow(false)}>
        <DialogTitle>Help</DialogTitle>
        <DialogContent>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptate, nesciunt?
          Perspiciatis, perferendis voluptatum obcaecati at laborum nesciunt accusantium quo,
          voluptates molestiae, delectus omnis placeat enim alias rem necessitatibus dolorum eaque?
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HelpModal;
