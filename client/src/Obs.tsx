// import { randomInt } from 'node:crypto';
//  import { realpathSync } from 'node:fs';
// import { readdir } from 'node:fs/promises';
// import { extname } from 'node:path';
import { OBSRequestTypes, OBSWebSocket } from 'obs-websocket-js';
// import path from 'node:path';

// const randomInt = (max:number) => {
//   return Math.floor(Math.random()*max)
// }

class Obs {
  connection: OBSWebSocket | null = null;
  mediaChangeInterval: NodeJS.Timeout | null = null;
  reconnectInterval: NodeJS.Timeout | null = null;
  inputName = '';
  settings: Record<'local_file', string> = { local_file: '' };
  nextVideo = '';
  videos: string[] = [];
  // clients = new Set();

  constructor() {
    this.connection = new OBSWebSocket();
    this.mediaChangeInterval = setInterval(() => {
      const stoppedpromise = this.mediaStopped;

      // goofy shi cuz it might be false outright
      if (typeof stoppedpromise === 'boolean') {
        return;
      }

      stoppedpromise
        .then((mediaStopped: boolean) => {
          if (this.connected && mediaStopped) {
            this.changeMedia();
          }
          return;
        })
        .catch(() => {
          console.log('mediaStopped getter failed in Obs.tsx');
        });
    }, 5000);
    this.reconnectInterval = setInterval(() => {
      this.retryConnect().catch(() => {
        console.log('Obs.retryConnect() failed in Obs.tsx reconnect interval callback');
      });
      return;
    }, 5000);
  }

  get connected() {
    return this.connection?.identified;
  }

  get status() {
    return this.call('GetMediaInputStatus', {
      inputName: this.inputName,
    });
  }

  get inputList() {
    return this.call('GetInputList', {
      inputKind: 'ffmpeg_source',
    }).then(response => response.inputs as Record<'inputName', string>[]);
  }

  get data() {
    const na = 'n/a';
    return this.inputList.then(inputs => {
      return {
        inputs: inputs.map(value => value.inputName),
        currentVideo: this.settings.local_file, // ? path.basename(this.settings.local_file) : na,
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

    return this.status.then(currentStatus => !currentStatus.mediaDuration);
  }

  // function signature yoinked from definition of connection.call()
  async call<Type extends keyof OBSRequestTypes>(
    requestType: Type,
    requestData?: OBSRequestTypes[Type],
  ) {
    if (!this.connection || !this.connected) {
      throw new Error('Not connected');
    }

    return this.connection.call(requestType, requestData);
  }

  async connect() {
    if (!this.connection) {
      console.log('Attempted to connect while OBS websocket object is null.');
      return;
    }

    try {
      await this.connection.connect('ws://127.0.0.1:4455');
      console.log('Connected successfully.');
    } catch {
      console.log('Failed to connect to OBS. Retrying in 5 seconds.');
    }
  }

  async retryConnect() {
    if (!this.connected) {
      await this.connect();
    }
  }

  async changeInput(inputName: string) {
    if (!this.mediaChangeInterval) {
      return;
    }

    if (this.inputName) {
      await this.stopMedia();
    }

    const input = await this.call('GetInputSettings', { inputName });

    const settingsResp = await this.call('GetInputDefaultSettings', {
      inputKind: input.inputKind,
    });

    // console.log('wiwiwi')
    this.inputName = inputName;
    this.settings = Object.assign(this.settings, {
      ...settingsResp.defaultInputSettings,
      ...input.inputSettings,
    });

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

  changeMedia() {
    // too many filesystem operations for browser
    return;
    /*
    // TODO: pick a new next video if we fail due to nonexistent file
    if (!this.connection) {
      console.log('Attempted to change media while OBS websocket object is null');
      return;
    }

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

    // await this.update();
    */
  }

  // async update() {
  //   const currentData = await this.data;
  //   for (const client of this.clients) {
  //     client.send(JSON.stringify(currentData));
  //   }
  // }
}

export default Obs;
