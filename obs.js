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
  }

  get connected() {
    return this.connection.socket;
  }

  get status() {
    if (!this.connected) {
      return;
    }

    return this.connection.call('GetMediaInputStatus', {
      inputName: this.inputName,
    });
  }

  get inputList() {
    if (!this.connected) {
      return;
    }

    return this.connection
      .call('GetInputList', {
        inputKind: 'ffmpeg_source',
      })
      .then(response => response.inputs);
  }

  get data() {
    if (!this.connected) {
      return;
    }

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
    if (!this.inputName || !this.connected) {
      return false;
    }

    return this.status.then(currentStatus => !currentStatus['mediaDuration']);
  }

  async connect() {
    await this.connection.connect('ws://127.0.0.1:4455');
    this.mediaChangeInterval = setInterval(async () => {
      if (this.connected && (await this.mediaStopped)) {
        await this.changeMedia();
      }
    }, 5000);

    this.reconnectInterval = setInterval(this.retryConnect, 5000);
    console.log('Connected successfully.');
  }

  async retryConnect() {
    console.log('Failed to connect to OBS. Retrying in 5 seconds.');
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

    try {
      const input = await this.connection.call('GetInputSettings', { inputName });

      const settingsResp = await this.connection.call('GetInputDefaultSettings', {
        inputKind: input.inputKind,
      });

      this.inputName = inputName;
      this.settings = { ...settingsResp.defaultInputSettings, ...input.inputSettings };

      this.changeMedia();
    } catch {
      this.retryConnect();
    }
  }

  async stopMedia() {
    if (!this.inputName || !this.connected) {
      return;
    }

    await this.connection.call('TriggerMediaInputAction', {
      inputName: this.inputName,
      mediaAction: 'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_STOP',
    });
  }

  async changeMedia() {
    // TODO: pick a new next video if we fail due to nonexistent file

    if (!this.inputName || !this.connected) {
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
    if (!this.connected) {
      return;
    }

    this.clients.forEach(client => {
      this.data.then(currentData => client.send(JSON.stringify(currentData)));
    });
  }
}

export default Obs;
