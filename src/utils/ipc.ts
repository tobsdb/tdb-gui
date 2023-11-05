import type { ipcEvent, ircEvent } from "@/types/ipc";

/** type-safe api for invoking ipc events */
export const useIPC = {
  invoke: <const T extends keyof ipcEvent>(
    event: T,
    ...params: ipcEventsParameters<ipcEvent[T]>
  ): ReturnType<ipcEvent[T]> => {
    return window.ipcRenderer.invoke(event, ...params) as ReturnType<
      ipcEvent[T]
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

/** communicate between different windows or renderer processes */
export const useIRC = {
  emit: async <const E extends keyof ircEvent>(
    _event: E,
    ...args: ircEvent[E]
  ) => {
    const event = "irc://" + _event;
    return useIPC.invoke("ircMain", { event, args });
  },
  on: <const E extends keyof ircEvent>(
    _event: E,
    listener: (ev: Electron.IpcRendererEvent, ...args: ircEvent[E]) => void
  ) => {
    const event = "irc://" + _event;
    window.ipcRenderer.on(
      event,
      listener as Parameters<typeof window.ipcRenderer.on>[1]
    );
    return () =>
      window.ipcRenderer.off(
        event,
        listener as Parameters<typeof window.ipcRenderer.on>[1]
      );
  },
  off: (_event: keyof ircEvent) => {
    const event = "irc://" + _event;
    window.ipcRenderer.removeAllListeners(event);
  },
};
