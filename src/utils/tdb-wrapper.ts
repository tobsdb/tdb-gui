export class Tobsdb {
  private ws?: WebSocket;
  public url: string;

  constructor(
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
    this.url = canonicalUrl.toString();
  }

  connect() {
    if (this.ws && this.ws.readyState <= WebSocket.OPEN) {
      return;
    }
    this.ws = new WebSocket(this.url);
    return new Promise<void>((resolve, reject) => {
      if (!this.ws || this.ws.readyState == WebSocket.OPEN) return;

      this.ws.onerror = (error) => reject(error);
      this.ws.onclose = (e) => {
        // unsupported data
        if (e.code === 1003) {
          return reject(e.reason);
        }
      };
      this.ws.onopen = () => {
        setTimeout(() => resolve(), 500);
      };
    });
  }

  async query(
    action: QueryAction,
    table: string,
    data: object | object[] | undefined,
    where?: object | undefined
  ): Promise<{ status: number; message: string; data: object | object[] }> {
    await this.connect();
    if (!this.ws || this.ws.readyState >= WebSocket.CLOSING) {
      throw new Error("Websocket connection has closed");
    }

    const q = JSON.stringify({ action, table, data, where });
    this.ws.send(q);
    return new Promise<any>((res, reject) => {
      if (!this.ws || this.ws.readyState >= WebSocket.CLOSING) {
        return reject("Websocket connection has closed");
      }
      this.ws.onmessage = (ev) => {
        const data = JSON.parse(ev.data);
        res(data);
      };
      this.ws.onclose = (e) => {
        reject(e.reason);
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
