import React from 'react';
import { createRoot } from 'react-dom/client';
import SocketProvider from './SocketProvider';
import UI from './UI';
import AuthWrapper from './AuthWrapper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const container = document.getElementById('root');
const root = createRoot(container!);

const queryclient = new QueryClient();

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryclient}>
      <SocketProvider>
        <AuthWrapper>
          <UI />
        </AuthWrapper>
      </SocketProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
