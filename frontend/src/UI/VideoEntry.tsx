import { useState, useEffect } from 'react';
import { MenuItem, Select } from '@mui/material';

const VideoEntry = ({
  name,
  videos,
  onSelect,
}: {
  name: string;
  videos: string[];
  onSelect: (name: string) => void;
}) => {
  const [selected, setSelected] = useState(name);
  const select = (video: string) => {
    setSelected(video);
    onSelect(video);
  };

  const firstvideo = videos?.[0];
  useEffect(() => {
    if (firstvideo && !selected) {
      select(firstvideo);
    }
  }, [videos, firstvideo, selected, select]);

  if (!videos) {
    return null;
  }

  return (
    <Select onChange={e => void select(e.target.value)} value={name}>
      {videos.map((name: string, idx: number) => {
        return (
          <MenuItem key={idx} value={name}>
            {name}
          </MenuItem>
        );
      })}
    </Select>
  );
};

export default VideoEntry;
