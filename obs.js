import { randomInt } from 'node:crypto';
import { realpathSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { extname } from 'node:path';
import { OBSWebSocket } from 'obs-websocket-js';

class Obs {
  connection = null;
  inputName = '';
  settings = {};

  constructor(connection, inputName, settings) {
    this.connection = connection;
    this.inputName = inputName;
    this.settings = settings;
  }

  static async build() {
    let obs = new OBSWebSocket();

    let inputName = 'Correct Horse Battery Staple';

    await obs.connect('ws://127.0.0.1:4455');

    const input = await obs.call('GetInputSettings', { inputName });

    const settingsResp = await obs.call('GetInputDefaultSettings', {
      inputKind: input.inputKind,
    });
    const settings = { ...settingsResp.defaultInputSettings, ...input.inputSettings };

    return new Obs(obs, inputName, settings);
  }

  async tryChangeMedia() {
    const allowed_filetypes = ['.webm', '.mkv'];
    const files = (await readdir('./videos')).filter(f => allowed_filetypes.includes(extname(f)));

    const status = await this.connection.call('GetMediaInputStatus', {
      inputName: this.inputName,
    });

    if (status['mediaDuration'] === null) {
      const file = files[randomInt(files.length)];
      this.settings['local_file'] = realpathSync('./videos/' + file);

      await this.connection.call('SetInputSettings', {
        inputName: this.inputName,
        inputSettings: this.settings,
      });
    }
  }
}

export default Obs;
