import { useContext, useEffect, useState } from "react"
import { SocketContext } from "./socketcontext"


const SelectForm = (props) => {
  const [selected, setSelected] = useState("")
  const socket = useContext(SocketContext)

  const submit = () => {
    const input = {
      action: props.action,
      data: selected,
    };
    socket.socket.sendMessage(JSON.stringify(input))
  }

  useEffect(()=>{
    if(socket.backendstate[props.options] && !selected) {
      setSelected(socket.backendstate[props.options][0])
    }
  }, [socket.backendstate])

  if(socket.backendstate){
    if(socket.backendstate[props.options]){
      const inputs = socket.backendstate[props.options]
      return (
        <>
          <select onChange={e => setSelected(e.target.value)}>
            {inputs.map((o, i) => {return <option key={i} value={o}>{o}</option>})}
          </select>
          <button onClick={submit}>Submit</button>
        </>
      )
    }
  }

  return (
    <>
      <select onChange={e => setSelected(e.target.value)} />
      <button onClick={submit}>Submit</button>
    </>
  )
}

export default SelectForm
