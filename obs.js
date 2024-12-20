import { randomInt } from 'node:crypto';
import { realpathSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { extname } from 'node:path';
import { OBSWebSocket, OBSWebSocketError } from 'obs-websocket-js';

class Obs {
  connection = null;
  inputName = '';
  settings = {};

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
    } catch (err) {
      console.log(err.message);
      return new Obs(obs, inputName, {});
    }

    const settingsResp = await obs.call('GetInputDefaultSettings', {
      inputKind: input.inputKind,
    });
    const settings = { ...settingsResp.defaultInputSettings, ...input.inputSettings };

    return new Obs(obs, inputName, settings);
  }

  async tryChangeInput(inputName) {
    let input;
    try {
      input = await this.connection.call('GetInputSettings', { inputName });
    } catch (err) {
      console.log(err.message);
      return;
    }

    const settingsResp = await this.connection.call('GetInputDefaultSettings', {
      inputKind: input.inputKind,
    });

    this.inputName = inputName;
    this.settings = { ...settingsResp.defaultInputSettings, ...input.inputSettings };
  }

  async tryChangeMedia() {
    if (this.inputName == '') {
      return;
    }

    const allowed_filetypes = ['.webm', '.mkv'];
    const files = (await readdir('./videos')).filter(f => allowed_filetypes.includes(extname(f)));

    let status;
    try {
      status = await this.connection.call('GetMediaInputStatus', {
        inputName: this.inputName,
      });
    } catch (err) {
      console.log(err.message);
      this.inputName = '';
      return;
    }

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
