import { type IpcMainInvokeEvent } from "electron";

type ElectronEvent<Args extends any[], Res = unknown> = (
  event: IpcMainInvokeEvent,
  ...args: Args
) => Promise<Res>;

// declare events in the form `[event-name]: ElectronEvent<[...args], return_type>`
type ipcEvents = {};

export default ipcEvents;
