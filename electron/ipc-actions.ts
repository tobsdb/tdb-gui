import type { ipcEvent } from "@/types/ipc";
import { ipcMain, webContents } from "electron";

/** Main Process Event listeners as an object */
const actions: ipcEvent = {
  ircMain: async (_, args) => {
    webContents
      .getAllWebContents()
      .forEach((w) => w.send(args.event, args.args));
  },
};

/** Register Main process event listeners */
const RegisterActions = () => {
  for (let key in actions) {
    ipcMain.handle(key, actions[key as keyof ipcEvent]);
  }
};

export default RegisterActions;
