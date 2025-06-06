import { OBSRequestTypes, OBSWebSocket } from 'obs-websocket-js';

type Timer = ReturnType<typeof setTimeout>;

class Obs {
  connection: OBSWebSocket | null = null;
  mediaChangeInterval: Timer | null = null;
  reconnectInterval: Timer | null = null;
  inputName = '';
  settings: Record<'local_file', string> = { local_file: '' };
  nextVideo = '';
  videos: string[] = [];

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
    // TODO
    return;
  }
}

export default Obs;
