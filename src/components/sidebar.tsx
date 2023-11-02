import { IconButton, List, ListItem } from "@mui/material";
import { Link, Outlet } from "react-router-dom";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { GLOBAL_CONNS } from "@/utils/conn-map";

export default function SideBar() {
  const conns = GLOBAL_CONNS.getAll();

  return (
    <div className="page">
      <header>
        <span style={{ display: "flex", alignItems: "center" }}>
          <h2 className="display-large">Connections</h2>
          <Link to="/new">
            <IconButton>
              <AddCircleIcon htmlColor="white" />
            </IconButton>
          </Link>
        </span>
        <nav>
          <List dense>
            {conns.map((conn) => (
              <ListItem
                key={conn.connId}
                sx={{
                  "&:hover": { backgroundColor: "info.main" },
                  cursor: "pointer",
                }}
              >
                <Link
                  to={`/conn/${conn.connId}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <h2>{conn.data.dbName}</h2>
                  <sup>{conn.data.url}</sup>
                </Link>
              </ListItem>
            ))}
          </List>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
