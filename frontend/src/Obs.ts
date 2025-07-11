import { OBSRequestTypes, OBSWebSocket } from 'obs-websocket-js';
import { SocketData } from './SocketProvider';

// type Timer = ReturnType<typeof setTimeout>;

// connection: OBSWebSocket | null = null; // Should be Context
// inputName = ''; // Should be Context, I guess
// settings: Record<'local_file', string> = { local_file: '' }; // Should be a Query
// videos: string[] = []; // Set by changeMedia(), which is currently in NextList.tsx. Should be a Query

// constructor() {
//   this.connection = new OBSWebSocket();
// }

// const connected = (conn: OBSWebSocket) => {
//   return conn.identified;
// }

const getStatus = async (conn: OBSWebSocket, inputName: string) =>
  call(conn, 'GetMediaInputStatus', { inputName });

export const getInputList = async (conn: OBSWebSocket) => {
  const response = await call(conn, 'GetInputList', {
    inputKind: 'ffmpeg_source',
  });

  return (response.inputs ?? []) as Record<'inputName', string>[];
};

export const isMediaStopped = async (conn: OBSWebSocket, inputName: string) => {
  if (!inputName) {
    return false;
  }

  const currentStatus = await getStatus(conn, inputName);
  return !currentStatus.mediaDuration;
};

export const call = async <Type extends keyof OBSRequestTypes>(
  conn: OBSWebSocket,
  requestType: Type,
  requestData?: OBSRequestTypes[Type],
) => {
  if (!conn?.identified) {
    throw new Error('Not connected');
  }

  return conn.call(requestType, requestData);
};

export const connect = async (conn: OBSWebSocket) => {
  if (!conn) {
    console.log('Attempted to connect while OBS websocket object is null.');
    return;
  }

  try {
    await conn.connect('ws://127.0.0.1:4455');
    console.log('Connected successfully.');
  } catch (err) {
    console.error('Failed to connect to OBS. Retrying in 5 seconds.', err);
  }
};

export const changeInput = async (
  conn: OBSWebSocket,
  settings: Record<'local_file', string>,
  oldInputName: string,
  newInputName: string,
): Promise<SocketData> => {
  // if (!mediaChangeInterval) {
  //   return;
  // }

  if (oldInputName) {
    await stopMedia(conn, oldInputName);
  }

  const input = await call(conn, 'GetInputSettings', { inputName: newInputName });

  const settingsResp = await call(conn, 'GetInputDefaultSettings', {
    inputKind: input.inputKind,
  });

  // console.log('attempting to set input name')
  // console.log('old input name: ' + oldInputName)
  // console.log('new input name: ' + newInputName)
  // setInputName(newInputName); // questionable
  // setSettings(
  //   Object.assign(settings, {
  //     ...settingsResp.defaultInputSettings,
  //     ...input.inputSettings,
  //   }),
  // );

  // await this.changeMedia();

  return {
    connection: conn,
    inputName: newInputName,
    settings: Object.assign(settings, {
      ...settingsResp.defaultInputSettings,
      ...input.inputSettings,
    }),
  };
};

export const stopMedia = async (conn: OBSWebSocket, inputName: string) => {
  if (!inputName) {
    return;
  }

  await call(conn, 'TriggerMediaInputAction', {
    inputName,
    mediaAction: 'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_STOP',
  });
};

// export default Obs;
