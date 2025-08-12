import { OBSRequestTypes, OBSWebSocket } from 'obs-websocket-js';
import { SocketData } from '../SocketProvider';

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
