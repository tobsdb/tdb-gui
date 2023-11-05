import { type IpcMainInvokeEvent } from "electron";

export type ElectronEvent<Args extends Record<string, any>, Res = unknown> = (
  event: IpcMainInvokeEvent,
  args: Args
) => Promise<Res>;

// declare events in the form `[event-name]: ElectronEvent<{...args}, return_type>`
export type ipcEvent = {
  ircMain: ElectronEvent<{ event: string; args: any[] }>;
};

export type ircEvent = {
  refreshSideBar: [];
};
