import React from 'react';
import ReactDOM from 'react-dom/client';
import SocketProvider from './SocketProvider';
import UI from './UI';
import AuthWrapper from './AuthWrapper';

const root = document.getElementById('root');

  ReactDOM.createRoot(root!).render(
    <React.StrictMode>
      <SocketProvider>
        <AuthWrapper>
          <UI />
        </AuthWrapper>
      </SocketProvider>
    </React.StrictMode>,
  );
