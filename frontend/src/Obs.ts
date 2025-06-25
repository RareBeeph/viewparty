import { OBSRequestTypes, OBSWebSocket } from 'obs-websocket-js';
import { GetVideos, GetBasePath } from '../wailsjs/go/main/App.js';

type Timer = ReturnType<typeof setTimeout>;

class Obs {
  connection: OBSWebSocket | null = null;
  mediaChangeInterval: Timer | null = null;
  reconnectInterval: Timer | null = null;
  inputName = '';
  settings: Record<'local_file', string> = { local_file: '' };
  queue: string[] = [];
  videos: string[] = [];

  constructor() {
    this.connection = new OBSWebSocket();

    this.mediaChangeInterval = setInterval(() => {
      this.isMediaStopped()
        .then((mediaStopped: boolean) => {
          if (this.connected && mediaStopped) {
            this.changeMedia().catch(console.error);
          }
          return;
        })
        .catch(err => console.error('Media change interval failure', err));
    }, 5000);

    this.reconnectInterval = setInterval(() => {
      this.retryConnect().catch(err => console.error('Obs.retryConnect() failure', err));
      return;
    }, 5000);
  }

  get connected() {
    return this.connection?.identified ?? false;
  }

  getStatus = async () =>
    this.call('GetMediaInputStatus', {
      inputName: this.inputName,
    });

  getInputList = async () => {
    const response = await this.call('GetInputList', {
      inputKind: 'ffmpeg_source',
    });

    return (response.inputs ?? []) as Record<'inputName', string>[];
  };

  async isMediaStopped() {
    if (!this.inputName) {
      return false;
    }

    const currentStatus = await this.getStatus();
    return !currentStatus.mediaDuration;
  }

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
    } catch (err) {
      console.error('Failed to connect to OBS. Retrying in 5 seconds.', err);
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

    this.inputName = inputName;
    this.settings = Object.assign(this.settings, {
      ...settingsResp.defaultInputSettings,
      ...input.inputSettings,
    });

    await this.changeMedia();
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
    if (!this.inputName) {
      return;
    }

    const allowed_filetypes = ['.webm', '.mkv'];

    // subbed in shenanigans in place of Node function
    const files = (await GetVideos()).filter(file =>
      allowed_filetypes
        .map(filetype => file.endsWith(filetype))
        .reduce((acc, curr) => acc || curr, false),
    );
    this.videos = files;

    // shenanigans in place of Node function
    const randomInt = (max: number) => Math.floor(max * Math.random());

    if (this.queue.length == 0) {
      this.queue = [files[randomInt(files.length)]];
    }

    // also replacing Node function
    this.settings.local_file = (await GetBasePath()) + this.queue[0];

    // observation: if the same video that just finished is picked again, this does nothing
    try {
      await this.connection?.call('SetInputSettings', {
        inputName: this.inputName,
        inputSettings: this.settings,
      });
    } catch {
      console.log('Failed to change media.');

      // future media change attempts short-circuit on empty input name
      // so this assign means we only fail once
      this.inputName = '';
    }

    this.queue.shift();

    return;
  }
}

export default Obs;
