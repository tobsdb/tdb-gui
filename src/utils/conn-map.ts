import { FieldName } from "@/pages/new-conn";
import { Tobsdb } from "./tdb-wrapper";
import { useIRC } from "./ipc";

export const TDB_CONNS = new Map<string, Tobsdb>();

const SAVED_CONNS_KEY = "saved_tdb_connId_data_map_array";
export type SavedConn = { connId: string; data: Record<FieldName, string> };
export type Data = Record<FieldName, string>;

export const GLOBAL_CONNS = {
  getAll: () => {
    return JSON.parse(
      localStorage.getItem(SAVED_CONNS_KEY) ?? "[]"
    ) as SavedConn[];
  },
  set: (connId: string, data: Data) => {
    const conns = GLOBAL_CONNS.getAll();
    const connIdx = conns.findIndex((c) => c.connId === connId);
    if (connIdx === -1) {
      conns.push({ connId, data });
    } else {
      conns.splice(connIdx, 1, { connId, data });
    }
    localStorage.setItem(SAVED_CONNS_KEY, JSON.stringify(conns));
  },
  get: (connId: string): Data | undefined => {
    const conns = GLOBAL_CONNS.getAll();
    const data = conns.find((c) => c.connId === connId)?.data;
    return data;
  },
  delete: (connId: string) => {
    let conns = GLOBAL_CONNS.getAll();
    conns = conns.filter((c) => c.connId !== connId);
    localStorage.setItem(SAVED_CONNS_KEY, JSON.stringify(conns));
  },
};

export async function SaveConn(connId: string, data: Data) {
  const db = new Tobsdb(
    data[FieldName.URL],
    data[FieldName.DB],
    data[FieldName.SCHEMA],
    data[FieldName.USERNAME],
    data[FieldName.PASSWORD]
  );
  GLOBAL_CONNS.set(connId, data);
  TDB_CONNS.set(connId, db);
  await useIRC.emit("refreshSideBar");
}

export async function UpdateConn(connId: string, newData: Partial<Data>) {
  let data = GLOBAL_CONNS.get(connId);
  if (!data) {
    return;
  }
  data = { ...data, ...newData };
  const db = new Tobsdb(
    data[FieldName.URL],
    data[FieldName.DB],
    data[FieldName.SCHEMA],
    data[FieldName.USERNAME],
    data[FieldName.PASSWORD]
  );
  GLOBAL_CONNS.set(connId, data);
  TDB_CONNS.set(connId, db);
  return { data, db };
}

export async function UseConn(connId: string) {
  const data = GLOBAL_CONNS.get(connId);
  if (!data) {
    return { data: null, db: null };
  }

  let db = TDB_CONNS.get(connId);

  try {
    if (!db) {
      db = new Tobsdb(
        data[FieldName.URL],
        data[FieldName.DB],
        data[FieldName.SCHEMA],
        data[FieldName.USERNAME],
        data[FieldName.PASSWORD]
      );
      TDB_CONNS.set(connId, db);
    }
  } catch (e) {
    console.error(e);
  }

  return { data, db };
}

export function DeleteConn(connId: string) {
  GLOBAL_CONNS.delete(connId);
  TDB_CONNS.delete(connId);
}
