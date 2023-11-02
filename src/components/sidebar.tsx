import { IconButton, List, ListItem } from "@mui/material";
import { Link, Outlet } from "react-router-dom";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { GLOBAL_CONNS, type SavedConn } from "@/utils/conn-map";
import { useEffect, useState } from "react";

export default function SideBar() {
  const [conns, setConns] = useState(GLOBAL_CONNS.getAll());

  const refreshConns = (ev: MessageEvent<any>) => {
    if (ev.data === "refreshSideBar") {
      setConns(GLOBAL_CONNS.getAll());
    }
  };

  useEffect(() => {
    window.addEventListener("message", refreshConns);

    return () => {
      window.removeEventListener("message", refreshConns);
    };
  }, []);

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
              <SideBarItem key={conn.connId} conn={conn} />
            ))}
          </List>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}

function SideBarItem(props: { conn: SavedConn }) {
  return (
    <ListItem
      key={props.conn.connId}
      sx={{
        "&:hover": { backgroundColor: "info.main" },
        cursor: "pointer",
      }}
    >
      <Link
        to={`/conn/${props.conn.connId}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <h2>{props.conn.data.dbName}</h2>
        <sup>{props.conn.data.url}</sup>
      </Link>
    </ListItem>
  );
}
