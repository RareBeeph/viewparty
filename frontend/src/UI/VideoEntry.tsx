import { Form } from 'react-bootstrap';
import { useState, useEffect } from 'react';

const VideoEntry = ({
  name,
  videos,
  updateSelf,
}: {
  name: string;
  videos: string[];
  updateSelf: (name: string) => void;
}) => {
  const [selected, setSelected] = useState(name);

  const firstvideo = videos?.[0];
  useEffect(() => {
    if (firstvideo && !selected) {
      setSelected(firstvideo);
      updateSelf(firstvideo);
    }
  }, [videos, firstvideo, selected, updateSelf]);

  if (!videos) {
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
