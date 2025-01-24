import { randomInt } from 'node:crypto';
import { realpathSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { extname } from 'node:path';
import { OBSWebSocket } from 'obs-websocket-js';

class Obs {
  connection = null;
  inputName = '';
  settings = {};
  nextVideo = '';
  // This should be an array based off your usage in changeMedia
  videos = [];

  constructor(connection, inputName, settings) {
    this.connection = connection;
    this.inputName = inputName;
    this.settings = settings;
  }

  static async build(inputName) {
    let obs = new OBSWebSocket();
    await obs.connect('ws://127.0.0.1:4455');

    let input;
    try {
      input = await obs.call('GetInputSettings', { inputName });
    } catch {
      return new Obs(obs, '', {});
    }

    const settingsResp = await obs.call('GetInputDefaultSettings', {
      inputKind: input.inputKind,
    });
    const settings = { ...settingsResp.defaultInputSettings, ...input.inputSettings };

    return new Obs(obs, inputName, settings);
  }

  async changeInput(inputName) {
    const input = await this.connection.call('GetInputSettings', { inputName });

    const settingsResp = await this.connection.call('GetInputDefaultSettings', {
      inputKind: input.inputKind,
    });

    this.inputName = inputName;
    this.settings = { ...settingsResp.defaultInputSettings, ...input.inputSettings };
  }

  // Try defining reusable attributes like this so as to avoid repeating requests
  get status() {
    return this.connection.call('GetMediaInputStatus', {
      inputName: this.inputName,
    });
  }

  async changeMedia() {
    if (!this.inputName) {
      return;
    }

    const allowed_filetypes = ['.webm', '.mkv'];
    const files = (await readdir('./videos')).filter(f => allowed_filetypes.includes(extname(f)));
    this.videos = files;

    const status = await this.status;
    if (!status['mediaDuration']) {
      if (!this.nextVideo) {
        this.nextVideo = files[randomInt(files.length)];
      }

      this.settings['local_file'] = realpathSync('./videos/' + this.nextVideo);

      // observation: if the same video that just finished is picked again, this does nothing
      await this.connection.call('SetInputSettings', {
        inputName: this.inputName,
        inputSettings: this.settings,
      });

      this.nextVideo = files[randomInt(files.length)];
    }
  }
}

export default Obs;
