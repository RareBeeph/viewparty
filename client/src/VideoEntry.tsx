import { Form } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useAppState } from './hooks';

const VideoEntry = ({ name, updateSelf }: { name: string; updateSelf: (name: string) => void }) => {
  const [selected, setSelected] = useState(name);
  // You tend to do the same destructuring assignment in every component for
  // state, it's probably worth giving it its own hook just for brevity's sake
  const { videos } = useAppState();

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
      {videos.map((name, idx) => {
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
