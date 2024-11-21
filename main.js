import { randomInt } from 'node:crypto';
import { readdir } from 'node:fs/promises';
import { OBSWebSocket } from 'obs-websocket-js';

const obs = new OBSWebSocket();

let files = await readdir('./videos');
const allowed_filetypes = ['.webm', '.mkv'];

files = files.filter(f => {
  for (const t of allowed_filetypes) {
    if (f.endsWith(t)) {
      return true;
    }
  }
  return false;
});

const file = files[randomInt(files.length)];

await obs.connect('ws://127.0.0.1:4455');
