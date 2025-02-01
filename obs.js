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
  videos = [];

  constructor() {
    this.connection = new OBSWebSocket();
  }

  get status() {
    return this.connection.call('GetMediaInputStatus', {
      inputName: this.inputName,
    });
  }

  get inputList() {
    return this.connection
      .call('GetInputList', {
        inputKind: 'ffmpeg_source',
      })
      .then(response => response.inputs);
  }

  async connect() {
    await this.connection.connect('ws://127.0.0.1:4455');
  }

  async changeInput(inputName) {
    const input = await this.connection.call('GetInputSettings', { inputName });

    const settingsResp = await this.connection.call('GetInputDefaultSettings', {
      inputKind: input.inputKind,
    });

    this.inputName = inputName;
    this.settings = { ...settingsResp.defaultInputSettings, ...input.inputSettings };
  }

  async stopMedia() {
    await this.connection.call('TriggerMediaInputAction', {
      inputName: this.inputName,
      mediaAction: 'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_STOP',
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
    console.log(status);
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
    } else {
      console.log("don't need to change!");
    }
  }
}

export default Obs;
