import { FieldName } from "@/pages/new-conn";
import { Tobsdb } from "./tdb-wrapper";

export const TDB_CONNS = new Map<string, Tobsdb>();

const SAVED_CONNS_KEY = "saved_tdb_connId_data_map_array";
type SavedConn = { connId: string; data: Record<FieldName, string> };
export type Data = Record<FieldName, string>;

export const GLOBAL_CONNS = {
  getAll: () => {
    return JSON.parse(
      localStorage.getItem(SAVED_CONNS_KEY) ?? "[]"
    ) as SavedConn[];
  },
  set: (connId: string, data: Data) => {
    const conns = GLOBAL_CONNS.getAll();
    conns.push({ connId, data });
    localStorage.setItem(SAVED_CONNS_KEY, JSON.stringify(conns));
  },
  get: (connId: string): Data | undefined => {
    const conns = GLOBAL_CONNS.getAll();
    const data = conns.find((c) => c.connId === connId)?.data;
    return data;
  },
};

export async function SaveConn(connId: string, data: Data) {
  GLOBAL_CONNS.set(connId, data);
  const db = await Tobsdb.connect(
    data[FieldName.URL],
    data[FieldName.DB],
    data[FieldName.SCHEMA],
    data[FieldName.USERNAME],
    data[FieldName.PASSWORD]
  );
  TDB_CONNS.set(connId, db);
}

export async function UseConn(connId: string) {
  const data = GLOBAL_CONNS.get(connId);
  if (!data) {
    return { data: null, db: null };
  }

  let db = TDB_CONNS.get(connId);

  // reconnection logic
  try {
    if (!db) {
      console.log("reconnecting to", data[FieldName.URL]);
      db = await Tobsdb.connect(
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
