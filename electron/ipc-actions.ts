import ipcEvents from "@/types/ipc";
import { ipcMain } from "electron";

/** Main Process Event listeners as an object */
const actions: ipcEvents = {};

/** Register Main process event listeners */
const RegisterActions = () => {
  for (let key in actions) {
    ipcMain.handle(key, actions[key as keyof ipcEvents]);
  }
};

export default RegisterActions;
