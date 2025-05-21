import { randomInt } from 'node:crypto';
import { realpathSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { extname } from 'node:path';
import { OBSWebSocket } from 'obs-websocket-js';
import path from 'node:path';

class Obs {
  connection = null;
  connectedCallbackID = false;
  disconnectedCallbackID = false;
  inputName = '';
  settings = {};
  nextVideo = '';
  videos = [];
  clients = new Set();

  constructor() {
    this.connection = new OBSWebSocket();
  }

  get status() {
    if (!this.connectedCallbackID) {
      return;
    }

    return this.connection
      .call('GetMediaInputStatus', {
        inputName: this.inputName,
      })
      .catch(this.retryConnect.bind(this));
  }

  get inputList() {
    if (!this.connectedCallbackID) {
      return;
    }

    return this.connection
      .call('GetInputList', {
        inputKind: 'ffmpeg_source',
      })
      .then(response => response.inputs)
      .catch(this.retryConnect.bind(this));
  }

  get data() {
    if (!this.connectedCallbackID) {
      return;
    }

    const na = 'n/a';
    return this.inputList
      .then(inputs => {
        return {
          inputs: inputs.map(value => value.inputName),
          currentVideo: this.settings.local_file ? path.basename(this.settings.local_file) : na,
          nextVideo: this.nextVideo || na,
          currentInput: this.inputName || na,
          videos: this.videos,
        };
      })
      .catch(this.retryConnect.bind(this));
  }

  get mediaStopped() {
    if (!this.inputName || !this.connectedCallbackID) {
      return false;
    }

    return this.status
      .then(currentStatus => !currentStatus['mediaDuration'])
      .catch(this.retryConnect.bind(this));
  }

  async connect() {
    try {
      await this.connection.connect('ws://127.0.0.1:4455');
      this.connectedCallbackID = setInterval(
        async function () {
          if (await this.mediaStopped) {
            await this.changeMedia();
          }
        }.bind(this),
        5000,
      );
      console.log('Connected successfully.');
    } catch {
      this.retryConnect();
    }
  }

  async retryConnect() {
    clearInterval(this.connectedCallbackID);
    this.connectedCallbackID = false;

    // don't repeat yourself
    if (this.disconnectedCallbackID) {
      return;
    }

    console.log('Failed to connect to OBS. Retrying in 5 seconds.');
    this.disconnectedCallbackID = setTimeout(
      async function () {
        this.disconnectedCallbackID = false;
        this.connect();
      }.bind(this),
      5000,
    );
  }

  async changeInput(inputName) {
    if (!this.connectedCallbackID) {
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
    if (!this.inputName || !this.connectedCallbackID) {
      return;
    }

    try {
      await this.connection.call('TriggerMediaInputAction', {
        inputName: this.inputName,
        mediaAction: 'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_STOP',
      });
    } catch {
      this.retryConnect();
    }
  }

  async changeMedia() {
    // TODO: pick a new next video if we fail due to nonexistent file

    if (!this.inputName || !this.connectedCallbackID) {
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
    if (!this.connectedCallbackID) {
      return;
    }

    this.clients.forEach(client => {
      this.data.then(currentData => client.send(JSON.stringify(currentData)));
    });
  }
}

export default Obs;
