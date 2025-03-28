import React from 'react'
import ReactDOM from 'react-dom/client'
import SocketProvider from './socketcontext'
// import { Container, Row, Col } from 'react-bootstrap'
import SelectForm from './selectform'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SocketProvider>
      <SelectForm action="input" options="inputs"/>
      <SelectForm action="next" options="videos"/>
    </SocketProvider>
  </React.StrictMode>,
)
