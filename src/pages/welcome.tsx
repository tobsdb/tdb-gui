import "@/styles/welcome.css";
import { Button } from "@mui/material";
import LaunchIcon from "@mui/icons-material/Launch";
import { Link } from "react-router-dom";

export default function Welcome() {
  return (
    <main className="welcome-page">
      <h1>Welcome to the TDB GUI</h1>
      <p>TDB server administration made easy.</p>
      <div>
        <Link to="/new">
          <Button color="success">New Connection</Button>
        </Link>
        <Button endIcon={<LaunchIcon />}>Read the Docs</Button>
      </div>
    </main>
  );
}
