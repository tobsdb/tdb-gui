import { UseConn, type Data } from "@/utils/conn-map";
import {
  Button,
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
import { FormEventHandler, useEffect, useState } from "react";
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

  const connect = async () => {
    const { data, db } = await UseConn(connId);
    if (!data) {
      navigate(`/new?error=true`, {
        state: { errorReason: "Connection data not found" },
      });
      return;
    }
    setConn({ data, db });
  };

  useEffect(() => {
    connect();
  }, [connId]);

  const [errorMsg, setErrorMsg] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (conn.data && !conn.db) {
      setErrorMsg(`Websocket connection to ${conn.data.url} failed`);
    }
  }, [conn]);

  const [queryRes, setQueryRes] = useState<
    Awaited<ReturnType<typeof Tobsdb.prototype.query>> | undefined
  >(undefined);
  const runQuery: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = formData.get("data") as string;
    const where = formData.get("where") as string;

    if (!conn.db) {
      setErrorMsg(`Websocket not connected to ${conn.data?.url}`);
      return;
    }

    let parsedData: object | object[] = {};
    try {
      if (!data) {
        if (
          selectedAction.includes("create") ||
          selectedAction.includes("update")
        ) {
          setErrorMsg("Data argument is required");
          return;
        }
      } else {
        parsedData = JSON.parse(data);
      }
    } catch {
      setErrorMsg("Invalid Data argument");
      return;
    }

    let parsedWhere: object = {};
    try {
      if (!where) {
        if (
          selectedAction.includes("findUnique") ||
          selectedAction.includes("delete")
        ) {
          setErrorMsg("Where argument is required");
          return;
        }
      } else {
        parsedWhere = JSON.parse(where);
      }
    } catch {
      setErrorMsg("Invalid Where argument");
      return;
    }

    const res = await conn.db.query(
      selectedAction as QueryAction,
      selectedTable,
      parsedData,
      parsedWhere
    );

    // @ts-ignore
    delete res.__tdb_client_req_id__;
    setQueryRes(res);
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
          <IconButton onClick={() => setSchemaPreviewOpen(true)}>
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
      <form onSubmit={runQuery}>
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
          disabled={!conn.db || !selectedAction || !selectedTable}
        >
          RUN
        </Button>
      </form>
      {queryRes ? <DisplayQueryData {...queryRes} /> : null}
    </main>
  );
}

function DisplayQueryData(
  props: Awaited<ReturnType<typeof Tobsdb.prototype.query>>
) {
  if (props.data && Array.isArray(props.data)) {
  }

  return (
    <div>
      <p style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(props, null, 4)}</p>
    </div>
  );
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
