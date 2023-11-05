import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
  type ChangeEventHandler,
  useRef,
  useState,
  type FormEventHandler,
  useEffect,
} from "react";
import { SaveConn } from "@/utils/conn-map";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ErrorAlert } from "@/components/error-alert";

const reader = new FileReader();

// TODO implement schema validation
// function useSchemaValidation(_schema?: string) {
//   return {};
// }

export enum FieldName {
  URL = "url",
  DB = "dbName",
  USERNAME = "username",
  PASSWORD = "password",
  SCHEMA = "schema",
}

export default function NewConnection() {
  const navigator = useNavigate();
  const [params] = useSearchParams();

  const [errorReason, setErrorReason] = useState("");
  const [reasonAlertOpen, setReasonAlert] = useState(false);
  useEffect(() => {
    if (params.get("error") === "true") {
      setReasonAlert(true);
    }
  }, []);

  const schemaInputRef = useRef<HTMLInputElement>(null);
  const schemaUploadInputRef = useRef<HTMLInputElement>(null);

  const [confirmOverwriteDialogOpen, setConfirmOverwriteDialogOpen] =
    useState(false);
  const [tempSchema, setTempSchema] = useState<string>("");
  const uploadSchema = (schema?: string) => {
    if (schemaInputRef.current)
      schemaInputRef.current.value = schema ?? tempSchema;
  };

  const handleSchemaUpload: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    reader.readAsText(file);
    reader.onload = (e) => {
      if (!e.target?.result || !schemaInputRef.current) return;
      if (schemaInputRef.current.value.trim()) {
        setTempSchema(e.target.result as string);
        setConfirmOverwriteDialogOpen(true);
      } else {
        uploadSchema(e.target.result as string);
      }
      if (schemaUploadInputRef.current) schemaUploadInputRef.current.value = "";
    };
  };

  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    const data: Record<FieldName, string> = {} as Record<FieldName, string>;
    for (const _field in FieldName) {
      const field = FieldName[_field as keyof typeof FieldName];
      const value = formData.get(field)?.toString();
      data[field] = value ?? "";
    }

    const connId = crypto.randomUUID();
    try {
      await SaveConn(connId, data);
      setIsLoading(false);

      navigator(`/conn/${connId}`);
    } catch (e) {
      if (e instanceof Error) {
        setErrorReason(e.message);
        setReasonAlert(true);
      } else {
        setErrorReason("Failed to connect to tobsdb server");
        setReasonAlert(true);
      }
      setIsLoading(false);
    }
  };

  return (
    <>
      <main>
        <h1>New TDB Server Connection</h1>
        <form onSubmit={handleSubmit}>
          <h2>Network</h2>
          <fieldset>
            <TextField
              type="url"
              label="URL"
              name={FieldName.URL}
              required
              defaultValue="ws://localhost:7085"
            />
            <TextField label="Database Name" name={FieldName.DB} required />
          </fieldset>
          <h2>Authentication</h2>
          <fieldset>
            <TextField label="Username" name={FieldName.USERNAME} />
            <TextField
              type="password"
              label="Password"
              name={FieldName.PASSWORD}
            />
          </fieldset>
          <TextField
            name={FieldName.SCHEMA}
            inputRef={schemaInputRef}
            required
            multiline
            spellCheck={false}
            label="Schema"
            minRows={5}
            maxRows={15}
            sx={{ width: "min(100%, 500px)" }}
            InputProps={{ style: { fontSize: ".9rem" } }}
          />
          <Button
            startIcon={<UploadFileIcon />}
            onClick={() => schemaUploadInputRef.current?.click()}
          >
            Import Schema
          </Button>
          <ConfirmSchemaOverwriteDialog
            open={confirmOverwriteDialogOpen}
            close={() => setConfirmOverwriteDialogOpen(false)}
            upload={uploadSchema}
          />
          <input
            type="file"
            onChange={handleSchemaUpload}
            ref={schemaUploadInputRef}
            hidden
            accept=".tdb"
          />
          <Button disabled={isLoading} variant="contained" type="submit">
            {isLoading ? <CircularProgress /> : "Connect"}
          </Button>
        </form>
      </main>
      {reasonAlertOpen ? (
        <ErrorAlert
          open={reasonAlertOpen}
          close={() => setReasonAlert(false)}
          reason={errorReason}
        />
      ) : null}
    </>
  );
}

function ConfirmSchemaOverwriteDialog(props: {
  open: boolean;
  close: () => void;
  upload: () => void;
}) {
  return (
    <Dialog open={props.open} onClose={props.close}>
      <DialogTitle>
        Are you sure you want to overwrite existing schema?
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Import will overwrite existing schema
        </DialogContentText>
        <DialogActions>
          <Button onClick={props.close}>Cancel</Button>
          <Button
            onClick={() => {
              props.upload();
              props.close();
            }}
            autoFocus
          >
            Import Anyway
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}
