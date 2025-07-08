import { OBSRequestTypes, OBSWebSocket } from 'obs-websocket-js';

// type Timer = ReturnType<typeof setTimeout>;

class Obs {
  connection: OBSWebSocket | null = null;
  inputName = '';
  settings: Record<'local_file', string> = { local_file: '' };
  videos: string[] = [];

  constructor() {
    this.connection = new OBSWebSocket();
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

  async changeInput(inputName: string) {
    // if (!mediaChangeInterval) {
    //   return;
    // }

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

    // await this.changeMedia();
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
}

export default Obs;
