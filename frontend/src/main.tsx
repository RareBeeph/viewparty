import React from 'react';
import { createRoot } from 'react-dom/client';
import SocketProvider from './SocketProvider';
import UI from './UI';
import AuthWrapper from './AuthWrapper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { SnackbarProvider } from 'notistack';

const container = document.getElementById('root');
const root = createRoot(container!);

const queryclient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 1000,
    },
  },
});

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
            <SnackbarProvider>
              <AuthWrapper>
                <UI />
              </AuthWrapper>
            </SnackbarProvider>
          </SocketProvider>
        </QueryClientProvider>
      </CssBaseline>
    </ThemeProvider>
  </React.StrictMode>,
);
