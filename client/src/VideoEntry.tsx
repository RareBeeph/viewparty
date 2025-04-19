import { Form } from 'react-bootstrap';
import { useContext, useState, useEffect } from 'react';
import { SocketContext } from './SocketProvider';

const VideoEntry = ({ name, updateSelf }: { name: string; updateSelf: (name: string) => void }) => {
  const [selected, setSelected] = useState(name);

  const {
    state: { videos },
  } = useContext(SocketContext);

  if (typeof videos === 'string') {
    return null;
  }

  useEffect(() => {
    if (videos && !selected) {
      setSelected(videos[0]);
      updateSelf(videos[0]);
    }
  }, [videos]);

  if (!videos) {
    return <></>;
  }

  return (
    <>
      <Form.Select
        onChange={e => {
          setSelected(e.target.value);
          updateSelf(e.target.value);
        }}
      >
        {videos.map((name, idx) => {
          return (
            <option key={idx} value={name}>
              {name}
            </option>
          );
        })}
      </Form.Select>
    </>
  );
};

export default VideoEntry;
