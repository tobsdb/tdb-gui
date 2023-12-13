import {
  Button,
  Dialog,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useState } from "react";
import type { SavedConn } from "@/utils/conn-map";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { FieldName } from "@/pages/new-conn";

export default function ConnInfo(props: {
  data: SavedConn["data"];
  edit: (data: Partial<{ [key in FieldName]: string }>) => Promise<void>;
  open: boolean;
  close: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [connInfo, setConnInfo] = useState(props.data);
  const [isEdit, setIsEdit] = useState(false);
  const saveSchema = (schema: string) => {
    props.edit({ [FieldName.SCHEMA]: schema });
    setConnInfo((data) => ({ ...data, schema }));
    setIsEdit(false);
  };

  return (
    <Dialog open={props.open} onClose={props.close} fullWidth>
      <div style={{ padding: ".5rem 1rem" }}>
        <DialogTitle>Connection Info</DialogTitle>
        <TextField
          sx={{ mr: ".5rem" }}
          value={connInfo.username}
          onChange={(e) =>
            setConnInfo((data) => ({ ...data, username: e.target.value }))
          }
          label="Username"
        />
        <TextField
          value={connInfo.password}
          onChange={(e) =>
            setConnInfo((data) => ({ ...data, password: e.target.value }))
          }
          label="Password"
          type={showPassword ? "text" : "password"}
          InputProps={{
            endAdornment: (
              <InputAdornment
                position="end"
                sx={{ cursor: "pointer" }}
                onClick={() => setShowPassword((state) => !state)}
                onMouseDown={(e) => e.preventDefault()}
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </InputAdornment>
            ),
          }}
        />
        {connInfo.username != props.data.username ||
        connInfo.password != props.data.password ? (
          <>
            <Button
              onClick={() => {
                props.edit({
                  [FieldName.USERNAME]: connInfo.username,
                  [FieldName.PASSWORD]: connInfo.password,
                });
                showPassword && setShowPassword(false);
              }}
            >
              Save
            </Button>
            <Button
              onClick={() => {
                setConnInfo((data) => ({
                  ...data,
                  username: props.data.username,
                  password: props.data.password,
                }));
                showPassword && setShowPassword(false);
              }}
            >
              Cancel
            </Button>
          </>
        ) : null}
        {isEdit ? (
          <EditSchemaComponent
            schema={connInfo.schema}
            cancel={() => setIsEdit(false)}
            save={saveSchema}
          />
        ) : (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
              }}
            >
              <h2>Schema</h2>
              <IconButton onClick={() => setIsEdit(true)}>
                <EditIcon />
              </IconButton>
            </div>
            <p
              style={{
                padding: "0 .8rem",
                whiteSpace: "pre-line",
                overflowY: "auto",
                maxHeight: "100%",
                width: "100%",
              }}
            >
              {connInfo.schema}
            </p>
          </>
        )}
      </div>
    </Dialog>
  );
}

function EditSchemaComponent(props: {
  schema: string;
  cancel: () => void;
  save: (schema: string) => void;
}) {
  return (
    <>
      <h2>Edit Schema</h2>
      <form
        style={{
          padding: "0 0 .2rem .5rem",
          gap: ".2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const schema = formData.get("schema")?.toString();
          if (schema) {
            props.save(schema);
          }
        }}
      >
        <TextField
          name="schema"
          required
          multiline
          spellCheck={false}
          defaultValue={props.schema}
          label="Schema"
          minRows={5}
          maxRows={20}
          sx={{ width: "min(100%, 500px)" }}
          InputProps={{ style: { fontSize: ".9rem" } }}
        />
        <div>
          <Button color="error" onClick={() => props.cancel()}>
            CANCEL
          </Button>
          <Button type="submit">SAVE</Button>
        </div>
      </form>
    </>
  );
}
