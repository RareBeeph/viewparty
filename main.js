import { randomInt } from 'node:crypto';
import { realpathSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { extname } from 'node:path';
import { OBSWebSocket } from 'obs-websocket-js';

const obs = new OBSWebSocket();

const allowed_filetypes = ['.webm', '.mkv'];
const files = (await readdir('./videos')).filter(f => allowed_filetypes.includes(extname(f)));

await obs.connect('ws://127.0.0.1:4455');

const input = await obs.call('GetInputSettings', {
  inputName: 'Correct Horse Battery Staple',
});

const settingsResp = await obs.call('GetInputDefaultSettings', {
  inputKind: input.inputKind,
});
const settings = { ...settingsResp.defaultInputSettings, ...input.inputSettings };

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
