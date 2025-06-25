import { Form } from 'react-bootstrap';
import { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../SocketProvider';

const VideoEntry = ({ name, updateSelf }: { name: string; updateSelf: (name: string) => void }) => {
  const [selected, setSelected] = useState(name);
  const { videos } = useContext(SocketContext);

  useEffect(() => {
    if (videos?.[0] && !selected) {
      setSelected(videos[0]);
      updateSelf(videos[0]);
    }
  }, [videos, selected, updateSelf]);

  if (typeof videos === 'string' || !videos) {
    return null;
  }

  return (
    <Form.Select
      onChange={e => {
        setSelected(e.target.value);
        updateSelf(e.target.value);
      }}
      value={name}
    >
      {videos.map((name: string, idx: number) => {
        return (
          <option key={idx} value={name}>
            {name}
          </option>
        );
      })}
    </Form.Select>
  );
};

export default VideoEntry;
