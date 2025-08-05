import { SocketData } from './SocketProvider';
import type { WritableDraft } from 'immer';

export enum Action {
  SetInput,
  MergeSettings,
}

interface SetInputAction {
  type: Action.SetInput;
  data: string;
}

interface MergeSettingsAction {
  type: Action.MergeSettings;
  data: object;
}

export type SocketAction = SetInputAction | MergeSettingsAction;

const setInput = (draft: WritableDraft<SocketData>, action: SetInputAction) => {
  draft.inputName = action.data;
};

const mergeSettings = (draft: WritableDraft<SocketData>, action: MergeSettingsAction) => {
  draft.settings = { ...draft.settings, ...action.data };
};

export const socketreducer = (draft: WritableDraft<SocketData>, action: SocketAction) => {
  try {
    switch (action.type) {
      case Action.SetInput:
        return void setInput(draft, action);
      case Action.MergeSettings:
        return void mergeSettings(draft, action);
      default:
    }
  } catch (e) {
    console.error(e);
  }
};
