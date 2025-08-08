import { OBSRequestTypes, OBSWebSocket } from 'obs-websocket-js';
import { SocketData } from '../SocketProvider';
import { GetBasePath } from '../../wailsjs/go/main/App';

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

export const changeInput = async (
  conn: OBSWebSocket,
  settings: Record<'local_file', string>,
  oldInputName: string,
  newInputName: string,
): Promise<SocketData> => {
  if (oldInputName) {
    await stopMedia(conn, oldInputName);
  }

  const input = await call(conn, 'GetInputSettings', { inputName: newInputName });

  const settingsResp = await call(conn, 'GetInputDefaultSettings', {
    inputKind: input.inputKind,
  });

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

export const changeMedia = async (
  connection: OBSWebSocket,
  inputName: string,
  settings: Record<'local_file', string>,
  nextVideo: string,
) => {
  if (!inputName || !nextVideo) {
    return;
  }

  settings.local_file = (await GetBasePath()) + nextVideo;

  // observation: if the same video that just finished is picked again, this does nothing
  try {
    await call(connection, 'SetInputSettings', {
      inputName: inputName,
      inputSettings: settings,
    });
  } catch {
    console.log('Failed to change media.');
    // future media change attempts short-circuit on empty input name
    // so this assign means we only fail once
    return { connection, settings, inputName: '' };
  }

  // settings have been changed, so we return the updated values
  return { connection, inputName, settings };
};
