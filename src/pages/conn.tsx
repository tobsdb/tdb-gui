import { UseConn, type Data } from "@/utils/conn-map";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
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
  const [conn, setConn] = useState<{
    data: Data | undefined;
    db: Tobsdb | undefined;
  }>({ data: undefined, db: undefined });
  const tableNames = conn.data?.schema
    ? ParseTableNames(conn.data.schema)
    : null;
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [selectedAction, setSelectedAction] = useState<string>("");

  const [schemaPreviewOpen, setSchemaPreviewOpen] = useState(false);

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
      <div style={{ marginBottom: "1rem" }}>
        <h1>{conn.data?.dbName}</h1>
        <p>
          {conn.data?.url}
          {conn.data?.username ? `@${conn.data.username}` : ""}
          <IconButton
            title="View Schema"
            onClick={() => setSchemaPreviewOpen(true)}
          >
            <InfoIcon />
          </IconButton>
        </p>
        {schemaPreviewOpen ? (
          <Dialog
            open={schemaPreviewOpen}
            onClose={() => setSchemaPreviewOpen(false)}
            fullWidth
          >
            <DialogTitle>Schema</DialogTitle>
            <p
              style={{
                padding: "0 .8rem",
                whiteSpace: "pre-line",
                overflowY: "auto",
                maxHeight: "100%",
                width: "100%",
              }}
            >
              {conn.data?.schema}
            </p>
          </Dialog>
        ) : null}
      </div>
      <form onSubmit={handleSubmit}>
        {tableNames && tableNames.length ? (
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Table</InputLabel>
            <Select
              label="Table"
              name="table"
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
            >
              {tableNames.map((tableName, idx) => (
                <MenuItem key={idx} value={tableName}>
                  {tableName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : null}
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
  // TODO: scroll render and paginate data
  if (props.data && Array.isArray(props.data)) {
    return (
      <div style={{ maxHeight: "100%", width: "100%", overflowY: "auto" }}>
        <p style={{ whiteSpace: "pre-wrap" }}>
          {JSON.stringify(props, null, 4)}
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxHeight: "100%", width: "100%", overflowY: "auto" }}>
      <p style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(props, null, 4)}</p>
    </div>
  );
}

function UseQuery(props: {
  conn: {
    data: Data | undefined;
    db: Tobsdb | undefined;
  };
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
    const data = formData.get("data") as string;
    const where = formData.get("where") as string;

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
