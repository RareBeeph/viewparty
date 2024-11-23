import { randomInt } from 'node:crypto';
import { realpathSync } from 'node:fs';
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

await obs.connect('ws://127.0.0.1:4455');

const input = await obs.call('GetInputSettings', {
  inputName: 'Correct Horse Battery Staple',
});

let settingsResp = await obs.call('GetInputDefaultSettings', {
  inputKind: input.inputKind,
});

let settings = settingsResp.defaultInputSettings;
for (const key in input.inputSettings) {
  settings[key] = input.inputSettings[key];
}

setInterval(async () => {
  const status = await obs.call('GetMediaInputStatus', {
    inputName: 'Correct Horse Battery Staple',
  });

  if (status['mediaDuration'] === null) {
    const file = files[randomInt(files.length)];

    settings['local_file'] = realpathSync('./videos/' + file);

    await obs.call('SetInputSettings', {
      inputName: 'Correct Horse Battery Staple',
      inputSettings: settings,
    });
  }
}, 5000);
