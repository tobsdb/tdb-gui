import ipcEvents from "@/utils/ipc";
import { ipcRenderer } from "electron";

/** type-safe api for invoking ipc events */
export const useIPC = {
  invoke: <const T extends keyof ipcEvents>(
    event: T,
    ...params: ipcEventsParameters<ipcEvents[T]>
  ): ReturnType<ipcEvents[T]> => {
    return ipcRenderer.invoke(event, ...params) as ReturnType<ipcEvents[T]>;
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ipcEventsParameters<T extends (...args: any) => any> = T extends (
  e: any,
  ...args: infer P
) => any
  ? P
  : never;
