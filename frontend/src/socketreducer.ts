import { GetBasePath } from "../wailsjs/go/main/App"
import { SocketData } from "./SocketProvider"
import type { WritableDraft } from "immer"
import { call, stopMedia } from "./utils/obs"
import OBSWebSocket from "obs-websocket-js"

interface InputAction {
  type: "input",
  data: {newInputName: string}
}

interface MediaAction {
  type: "media",
  data: {nextVideo: string}
}

export type SocketAction = InputAction | MediaAction

const changeInput = async (draft: WritableDraft<SocketData>, action: InputAction) => {
  const oldInputName = draft.inputName
  const newInputName = action.data.newInputName
  const conn = draft.connection as OBSWebSocket

  if (oldInputName) {
    await stopMedia(conn, oldInputName);
  }

  const input = await call(conn, 'GetInputSettings', { inputName: newInputName });

  const settingsResp = await call(conn, 'GetInputDefaultSettings', {
    inputKind: input.inputKind,
  });

  draft.inputName = newInputName;
  draft.settings = Object.assign(draft.settings, {
    ...settingsResp.defaultInputSettings,
    ...input.inputSettings,
  })
}

const changeMedia = async (draft: WritableDraft<SocketData>, action: MediaAction) => {
    const nextVideo = action.data.nextVideo

    if (!draft.inputName || !nextVideo) {
      return;
    }

    draft.settings.local_file = (await GetBasePath()) + nextVideo;

    // observation: if the same video that just finished is picked again, this does nothing
    try {
      await call(draft.connection as OBSWebSocket, 'SetInputSettings', {
        inputName: draft.inputName,
        inputSettings: draft.settings,
      });
    } catch {
      console.log('Failed to change media.');
      // future media change attempts short-circuit on empty input name
      // so this assign means we only fail once
      draft.inputName = '';
    }
}

export const socketreducer = (draft: WritableDraft<SocketData>, action: SocketAction) => {
  switch (action.type) {
    case "input":
      changeInput(draft, action).catch(console.error)
      break
    case "media":
      changeMedia(draft, action).catch(console.error)
      break
    default:
  }
}
