import React from 'react';
import { createRoot } from 'react-dom/client';
import SocketProvider from './SocketProvider';
import UI from './UI';
import AuthWrapper from './AuthWrapper';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <SocketProvider>
      <AuthWrapper>
        <UI />
      </AuthWrapper>
    </SocketProvider>
  </React.StrictMode>,
);
