import { UseConn, type Data, UpdateConn } from "@/utils/conn-map";
import {
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { useLoaderData, useNavigate } from "react-router-dom";
import { FormEvent, FormEventHandler, useEffect, useState } from "react";
import { type QueryAction, Tobsdb } from "@/utils/tdb-wrapper";
import { ErrorAlert } from "@/components/error-alert";
import ConnInfo from "@/components/conn-info";
import { FieldName } from "./new-conn";

const QUERY_ACTIONS: QueryAction[] = [
  "create",
  "createMany",
  "findUnique",
  "findMany",
  "updateUnique",
  "updateMany",
  "deleteUnique",
  "deleteMany",
];

export default function Connection() {
  const connId = useLoaderData() as string;
  const navigate = useNavigate();
  const [conn, setConn] = useState<{ data?: Data; db?: Tobsdb }>({
    data: undefined,
    db: undefined,
  });
  const tableNames = conn.data?.schema
    ? ParseTableNames(conn.data.schema)
    : null;
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [selectedAction, setSelectedAction] = useState<string>("");

  const [connInfoOpen, setConnInfoOpen] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);

  const connect = async () => {
    const { data, db } = await UseConn(connId);
    if (!data) {
      navigate(`/new?error=true`, {
        state: { errorReason: "Connection data not found" },
      });
      return;
    }

    if (!db) {
      setErrorMsg(`Websocket connection to ${data.url} failed`);
    }
    setConn({ data, db });
  };

  useEffect(() => {
    connect();
  }, [connId]);

  const [queryRes, setQueryRes] = useState<
    Awaited<ReturnType<typeof Tobsdb.prototype.query>> | undefined
  >(undefined);

  const handler = UseQuery({
    conn,
    setErrorMsg: (msg: string) => setErrorMsg(msg),
  });

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    handler.runQuery(e, (res) => setQueryRes(res));
  };

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
      }}
    >
      {errorMsg && errorMsg.length > 0 ? (
        <ErrorAlert
          open={errorMsg !== undefined && !!errorMsg.length}
          close={() => setErrorMsg(undefined)}
          reason={errorMsg}
        />
      ) : null}
      {conn.data ? (
        <div style={{ marginBottom: "1rem" }}>
          <h1>{conn.data.dbName}</h1>
          <p>
            {conn.data.url}
            {conn.data.username ? `@${conn.data.username}` : ""}
            <IconButton
              title="View Schema"
              onClick={() => setConnInfoOpen(true)}
            >
              <InfoIcon />
            </IconButton>
          </p>
          {connInfoOpen ? (
            <ConnInfo
              open={connInfoOpen}
              edit={async (schema: string) => {
                const conn = await UpdateConn(connId, {
                  [FieldName.SCHEMA]: schema,
                });
                if (conn) {
                  setConn(conn);
                }
              }}
              close={() => setConnInfoOpen(false)}
              data={conn.data}
            />
          ) : null}
        </div>
      ) : null}
      <form onSubmit={handleSubmit}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Table</InputLabel>
          <Select
            label="Table"
            name="table"
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
          >
            {tableNames && tableNames.length
              ? tableNames.map((tableName, idx) => (
                  <MenuItem key={idx} value={tableName}>
                    {tableName}
                  </MenuItem>
                ))
              : null}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Action</InputLabel>
          <Select
            label="Action"
            name="action"
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
          >
            {QUERY_ACTIONS.map((action, idx) => (
              <MenuItem key={idx} value={action}>
                {action}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {!selectedAction.includes("create") ? (
          <TextField
            label="Where"
            name="where"
            spellCheck={false}
            placeholder={`\
e.g:
{
    "id": { 
        "gt": 0 
      },
    "name": "value"
}`}
            multiline
            minRows={5}
            maxRows={20}
            sx={{ width: "min(100%, 500px)" }}
            InputProps={{ style: { fontSize: ".9rem" } }}
          />
        ) : null}
        {!selectedAction.includes("find") &&
        !selectedAction.includes("delete") ? (
          <TextField
            label="Data"
            name="data"
            spellCheck={false}
            placeholder={`\
e.g:
{
    "name": "value"
}`}
            multiline
            minRows={5}
            maxRows={20}
            sx={{ width: "min(100%, 500px)" }}
            InputProps={{ style: { fontSize: ".9rem" } }}
          />
        ) : null}
        <Button
          type="submit"
          disabled={
            !conn.db || !selectedAction || !selectedTable || handler.isLoading
          }
        >
          RUN
        </Button>
      </form>
      {handler.isLoading ? (
        <div style={{ display: "grid", placeItems: "center" }}>
          <CircularProgress />
        </div>
      ) : queryRes ? (
        <DisplayQueryData {...queryRes} />
      ) : null}
    </main>
  );
}

function DisplayQueryData(
  props: Awaited<ReturnType<typeof Tobsdb.prototype.query>>
) {
  const [page, setPage] = useState(1);
  useEffect(() => {
    setPage(1);
  }, [props]);

  return (
    <div
      style={{
        width: "100%",
        maxHeight: "100%",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          color: props.status >= 400 ? "red" : "green",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <span>Status: {props.status}</span>
        <span>Message: {props.message}</span>
      </div>
      {Array.isArray(props.data) ? (
        <>
          <div>
            <Button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >{`<-`}</Button>
            <span>Page {page}</span>
            <Button
              disabled={50 * page >= props.data.length}
              onClick={() => setPage(page + 1)}
            >{`->`}</Button>
          </div>
          <p
            style={{
              whiteSpace: "pre-wrap",
              width: "100%",
              maxHeight: "100%",
              overflowY: "auto",
            }}
          >
            {JSON.stringify(
              props.data.slice(50 * (page - 1), 50 * page),
              null,
              4
            )}
          </p>
        </>
      ) : (
        <p
          style={{
            whiteSpace: "pre-wrap",
            width: "100%",
            maxHeight: "100%",
            overflowY: "auto",
          }}
        >
          {JSON.stringify(props.data ?? null, null, 4)}
        </p>
      )}
    </div>
  );
}

function UseQuery(props: {
  conn: { data?: Data; db?: Tobsdb };
  setErrorMsg: (msg: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const throwError = (err: string) => {
    setIsLoading(false);
    props.setErrorMsg(err);
  };

  // TODO: save query params in some sort of history
  // and left user be able to load those options back into the inputs
  const runQuery = async (
    e: FormEvent<HTMLFormElement>,
    callback: (res: Awaited<ReturnType<typeof Tobsdb.prototype.query>>) => void
  ) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const action = formData.get("action")!.toString();
    const table = formData.get("table")!.toString();
    const data = formData.get("data")?.toString();
    const where = formData.get("where")?.toString();

    if (!props.conn.db) {
      throwError(`Websocket not connected to ${props.conn.data?.url}`);
      return;
    }

    let parsedData: object | object[] = {};
    try {
      if (!data) {
        if (action.includes("create") || action.includes("update")) {
          throwError("Data argument is required");
          return;
        }
      } else {
        parsedData = JSON.parse(data);
      }
    } catch {
      throwError("Invalid Data argument");
      return;
    }

    let parsedWhere: object = {};
    try {
      if (!where) {
        if (action.includes("findUnique") || action.includes("delete")) {
          throwError("Where argument is required");
          return;
        }
      } else {
        parsedWhere = JSON.parse(where);
      }
    } catch {
      throwError("Invalid Where argument");
      return;
    }

    let res;
    try {
      res = await props.conn.db.query(
        action as QueryAction,
        table,
        parsedData,
        parsedWhere
      );
    } catch (e) {
      if (typeof e === "string") {
        throwError(e);
        return;
      }
      if (e instanceof Error) {
        throwError(e.message);
        return;
      }

      throwError("Failed to run Query");
      return;
    }

    // @ts-ignore
    delete res.__tdb_client_req_id__;
    callback(res);
    setIsLoading(false);
  };

  return {
    isLoading,
    runQuery,
  };
}

function ParseTableNames(schema: string) {
  const schemaLines = schema
    .split("\n")
    .filter((s) => s.trim().length > 0)
    .map((s) => s.trim());
  const tableNames: string[] = [];
  schemaLines.forEach((line) => {
    if (!line.startsWith("$TABLE")) return;
    const tableName = line.split(" ")[1];
    tableNames.push(tableName);
  });

  return tableNames;
}
