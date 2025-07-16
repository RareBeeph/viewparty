import { GetVideos } from '../../wailsjs/go/main/App';

export const updateOne = (queue: string[], idx: number, name: string) => {
  return queue.slice(0, idx).concat([name], queue.slice(idx + 1));
};

export const addBelow = (queue: string[], idx: number, name: string) => {
  return queue.slice(0, idx + 1).concat([name], queue.slice(idx + 1));
};

export const removeOne = (queue: string[], idx: number) => {
  return queue.slice(0, idx).concat(queue.slice(idx + 1));
};

// Probably replace this with useQuery later
export const filteredVideoList = async () => {
  const allowed_filetypes = ['.webm', '.mkv'];
  const files = (await GetVideos()).filter(file =>
    allowed_filetypes
      .map(filetype => file.endsWith(filetype))
      .reduce((acc, curr) => acc || curr, false),
  );

  return files;
};

const randomInt = (max: number) => Math.floor(max * Math.random());

export const pickNextVideo = (queue: string[], files: string[]) => {
  const out: { next: string; newQueue: string[] | undefined } = { next: '', newQueue: undefined };

  if (queue.length === 0) {
    out.next = files[randomInt(files.length)];
  } else {
    out.next = queue[0];
    out.newQueue = queue.slice(1);
  }

  return out;
};
