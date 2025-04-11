import { randomInt } from 'node:crypto';
import { realpathSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { extname } from 'node:path';
import { OBSWebSocket } from 'obs-websocket-js';
import path from 'node:path';

class Obs {
  connection = null;
  inputName = '';
  settings = {};
  nextVideo = '';
  videos = [];
  clients = new Set();

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

  get data() {
    const na = 'n/a';

    return this.inputList.then(inputs => {
      return {
        inputs: inputs.map(value => value.inputName),
        currentVideo: this.settings.local_file ? path.basename(this.settings.local_file) : na,
        nextVideo: this.nextVideo || na,
        currentInput: this.inputName || na,
        videos: this.videos,
      };
    });
  }

  get mediaStopped() {
    if (!this.inputName) {
      return false;
    }

    return this.status.then(currentStatus => !currentStatus['mediaDuration']);
  }

  async connect() {
    await this.connection.connect('ws://127.0.0.1:4455');
  }

  async changeInput(inputName) {
    if (this.inputName) {
      this.stopMedia();
    }

    const input = await this.connection.call('GetInputSettings', { inputName });

    const settingsResp = await this.connection.call('GetInputDefaultSettings', {
      inputKind: input.inputKind,
    });

    this.inputName = inputName;
    this.settings = { ...settingsResp.defaultInputSettings, ...input.inputSettings };

    this.changeMedia();
  }

  async stopMedia() {
    if (!this.inputName) {
      return;
    }

    await this.connection.call('TriggerMediaInputAction', {
      inputName: this.inputName,
      mediaAction: 'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_STOP',
    });
  }

  async changeMedia() {
    // TODO: pick a new next video if we fail due to nonexistent file

    if (!this.inputName) {
      return;
    }

    const allowed_filetypes = ['.webm', '.mkv'];
    const files = (await readdir('./videos')).filter(f => allowed_filetypes.includes(extname(f)));
    this.videos = files;

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

    this.update();
  }

  update() {
    this.clients.forEach(client => {
      this.data.then(currentData => client.send(JSON.stringify(currentData)));
    });
  }
}

export default Obs;
