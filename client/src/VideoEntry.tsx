import { Form } from 'react-bootstrap';
import { useState, useEffect, useContext } from 'react';
// import { useAppState } from './hooks';
import { SocketContext } from './SocketProvider';

const VideoEntry = ({ name, updateSelf }: { name: string; updateSelf: (name: string) => void }) => {
  const [selected, setSelected] = useState(name);
  const { videos } = useContext(SocketContext);

  // hopefully moving this up doesn't break anything
  useEffect(() => {
    if (typeof videos !== 'string' && videos && !selected) {
      setSelected(videos[0]);
      updateSelf(videos[0]);
    }
  }, [videos]);

  if (typeof videos === 'string' || !videos) {
    return null;
  }

  // Why return an empty fragment instead of null?
  // if (!videos) {
  //   return <></>;
  // }
  // (rolled into the prior check)

  // You're only returning a single element so the fragment is unnecessary
  return (
    <Form.Select
      onChange={e => {
        setSelected(e.target.value);
        updateSelf(e.target.value);
      }}
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
