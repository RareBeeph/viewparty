import { useContext, useState } from "react"
import { SocketContext } from "./socketcontext"


const SelectForm = (props) => {
  const [selected, setSelected] = useState(null)
  const socket = useContext(SocketContext)

  const submit = () => {
    const input = {
      action: props.action,
      data: selected,
    };
    socket.sendMessage(JSON.stringify(input))
  }

  let options = []
  // NOTE: not doing what i want it to
  // console.log(socket.sendMessage(JSON.stringify({action: 'plsdata'})))

  // NOTE: incomplete
  // if (props.action == "next") {
  //   // options =
  // }

  return (
    <>
      <select onChange={e => setSelected(e.target.value)} />
      <button onClick={submit}>Submit</button>
    </>
  )
}

export default SelectForm
