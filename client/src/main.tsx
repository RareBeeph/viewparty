import React from 'react'
import ReactDOM from 'react-dom/client'
import SocketProvider from './socketcontext'
import SelectForm from './selectform'

const root = document.getElementById('root')

if (root !== null) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <SocketProvider>
        <SelectForm action="input" options="inputs"/>
        <SelectForm action="next" options="videos"/>
      </SocketProvider>
    </React.StrictMode>,
  )
}
