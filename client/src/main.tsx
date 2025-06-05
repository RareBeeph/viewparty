import React from 'react';
import ReactDOM from 'react-dom/client';
import SocketProvider from './SocketProvider';
import UI from './UI';
import AuthWrapper from './AuthWrapper';

const root = document.getElementById('root');

if (root !== null) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <SocketProvider>
        <AuthWrapper>
          <UI />
        </AuthWrapper>
      </SocketProvider>
    </React.StrictMode>,
  );
}
