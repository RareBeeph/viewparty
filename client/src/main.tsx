import React from 'react';
import ReactDOM from 'react-dom/client';
import SocketProvider from './SocketProvider';
import UI from './UI';

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
