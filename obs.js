import { randomInt } from 'node:crypto';
import { realpathSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { extname } from 'node:path';
import { OBSWebSocket } from 'obs-websocket-js';
import path from 'node:path';

class Obs {
  connection = null;
  mediaChangeInterval = null;
  reconnectInterval = null;
  inputName = '';
  settings = {};
  nextVideo = '';
  videos = [];
  clients = new Set();

  constructor() {
    this.connection = new OBSWebSocket();
    this.mediaChangeInterval = setInterval(async () => {
      if (this.connected && (await this.mediaStopped)) {
        await this.changeMedia();
      }
    }, 5000);
    this.reconnectInterval = setInterval(() => this.retryConnect(), 5000);
  }

  get connected() {
    return this.connection.socket;
  }

  get status() {
    return this.call('GetMediaInputStatus', {
      inputName: this.inputName,
    });
  }

  get inputList() {
    return this.call('GetInputList', {
      inputKind: 'ffmpeg_source',
    }).then(response => response.inputs);
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

  async call(...args) {
    if (!this.connected) {
      throw new Error('Not connected');
    }

    return this.connection.call(...args);
  }

  async connect() {
    try {
      await this.connection.connect('ws://127.0.0.1:4455');
      console.log('Connected successfully.');
    } catch {
      console.log('Failed to connect to OBS. Retrying in 5 seconds.');
    }
  }

  async retryConnect() {
    if (!this.connected) {
      this.connect();
    }
  }

  async changeInput(inputName) {
    if (!this.mediaChangeInterval) {
      return;
    }

    if (this.inputName) {
      this.stopMedia();
    }

    const input = await this.call('GetInputSettings', { inputName });

    const settingsResp = await this.call('GetInputDefaultSettings', {
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

    await this.call('TriggerMediaInputAction', {
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
    try {
      await this.connection.call('SetInputSettings', {
        inputName: this.inputName,
        inputSettings: this.settings,
      });
    } catch {
      console.log('Failed to change media.');

      // future media change attempts short-circuit on empty input name
      // so this assign means we only fail once
      this.inputName = '';
    }

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
