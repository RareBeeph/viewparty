import React from 'react';
import { createRoot } from 'react-dom/client';
import SocketProvider from './SocketProvider';
import UI from './UI';
import AuthWrapper from './AuthWrapper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';

const container = document.getElementById('root');
const root = createRoot(container!);

const queryclient = new QueryClient();

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

root.render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline>
        <QueryClientProvider client={queryclient}>
          <SocketProvider>
            <AuthWrapper>
              <UI />
            </AuthWrapper>
          </SocketProvider>
        </QueryClientProvider>
      </CssBaseline>
    </ThemeProvider>
  </React.StrictMode>,
);
