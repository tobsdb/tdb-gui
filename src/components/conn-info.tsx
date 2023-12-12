import {
  Button,
  Dialog,
  DialogTitle,
  IconButton,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useState } from "react";
import type { SavedConn } from "@/utils/conn-map";

export default function ConnInfo(props: {
  data: SavedConn["data"];
  edit: (schema: string) => Promise<void>;
  open: boolean;
  close: () => void;
}) {
  const [schema, setSchema] = useState(props.data.schema);
  const [isEdit, setIsEdit] = useState(false);
  const saveSchema = (schema: string) => {
    props.edit(schema);
    setSchema(schema);
    setIsEdit(false);
  };

  return (
    <Dialog open={props.open} onClose={props.close} fullWidth>
      {isEdit ? (
        <EditSchemaComponent
          schema={schema}
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
            <DialogTitle>Schema</DialogTitle>
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
            {schema}
          </p>
        </>
      )}
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
      <DialogTitle>Edit Schema</DialogTitle>
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
