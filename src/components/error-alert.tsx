import { Alert, Snackbar } from "@mui/material";
import { useLocation } from "react-router-dom";

export function ErrorAlert(props: {
  open: boolean;
  close: () => void;
  reason?: string;
}) {
  const { state: locationState } = useLocation();
  return (
    <Snackbar
      open={props.open}
      onClose={props.close}
      autoHideDuration={5000}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Alert severity="error" sx={{ width: "100%" }} onClose={props.close}>
        {(props.reason?.length ? props.reason : locationState?.errorReason) ??
          ""}
      </Alert>
    </Snackbar>
  );
}
