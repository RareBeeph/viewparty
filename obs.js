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
  nextVideoForced = '';
  videos = '';

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

  async changeMedia() {
    if (!this.inputName) {
      return;
    }

    const allowed_filetypes = ['.webm', '.mkv'];
    const files = (await readdir('./videos')).filter(f => allowed_filetypes.includes(extname(f)));
    this.videos = files;

    const status = await this.connection.call('GetMediaInputStatus', {
      inputName: this.inputName,
    });

    function randomFilePath() {
      const file = files[randomInt(files.length)];
      return realpathSync('./videos/' + file);
    }

    if (!status['mediaDuration']) {
      if (!this.nextVideo) {
        this.nextVideo = randomFilePath();
      }

      if (this.nextVideoForced) {
        this.settings['local_file'] = realpathSync('./videos/' + this.nextVideoForced);
        this.nextVideoForced = '';
      } else {
        this.settings['local_file'] = this.nextVideo;
      }

      this.nextVideo = randomFilePath();

      // observation: if the same video that just finished is picked again, this does nothing
      await this.connection.call('SetInputSettings', {
        inputName: this.inputName,
        inputSettings: this.settings,
      });
    }
  }
}

export default Obs;
