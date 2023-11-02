export class Tobsdb {
  ws: WebSocket;

  constructor(url: string) {
    this.ws = new WebSocket(url);
  }

  static async connect(
    url: string,
    dbName: string,
    schema: string,
    username?: string,
    password?: string
  ) {
    const canonicalUrl = new URL(url);
    canonicalUrl.searchParams.set("db", dbName);
    canonicalUrl.searchParams.set("schema", schema);
    canonicalUrl.searchParams.set("auth", `${username}:${password}`);

    const db = new Tobsdb(canonicalUrl.toString());

    return new Promise<Tobsdb>((resolve, reject) => {
      db.ws.onopen = () => resolve(db);
      db.ws.onerror = (error) => reject(error);
    });
  }

  query(
    action: QueryAction,
    table: string,
    data: object | object[] | undefined,
    where?: object | undefined
  ): Promise<{ status: number; message: string; data: object | object[] }> {
    const q = JSON.stringify({ action, table, data, where });
    this.ws.send(q);
    return new Promise<any>((res) => {
      this.ws.onmessage = (ev) => {
        const data = JSON.parse(ev.data);
        res(data);
      };
    });
  }
}

export type QueryAction =
  | "create"
  | "createMany"
  | "findUnique"
  | "findMany"
  | "updateUnique"
  | "updateMany"
  | "deleteUnique"
  | "deleteMany";
