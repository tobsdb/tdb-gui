import ipcEvents from "@/types/ipc";

/** type-safe api for invoking ipc events */
export const useIPC = {
  invoke: <const T extends keyof ipcEvents>(
    event: T,
    ...params: ipcEventsParameters<ipcEvents[T]>
  ): ReturnType<ipcEvents[T]> => {
    return window.ipcRenderer.invoke(event, ...params) as ReturnType<
      ipcEvents[T]
    >;
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ipcEventsParameters<T extends (...args: any) => any> = T extends (
  e: any,
  ...args: infer P
) => any
  ? P
  : never;
