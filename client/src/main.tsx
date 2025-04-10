import React from 'react';
import ReactDOM from 'react-dom/client';
import SocketProvider from './socketcontext';
import UI from './ui';

const root = document.getElementById('root');

if (root !== null) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <SocketProvider>
        <UI />
      </SocketProvider>
    </React.StrictMode>,
  );
}
