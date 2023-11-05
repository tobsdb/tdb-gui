import { IconButton, List, ListItem, MenuItem } from "@mui/material";
import { Link, Outlet } from "react-router-dom";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { DeleteConn, GLOBAL_CONNS, type SavedConn } from "@/utils/conn-map";
import { useEffect, useState } from "react";
import { ContextMenu, useContextMenu } from "./context-menu";
import { useIRC } from "@/utils/ipc";

// TODO: edit connections
export default function SideBar() {
  const [conns, setConns] = useState(GLOBAL_CONNS.getAll());

  useEffect(() => {
    const offRefreshSidebar = useIRC.on("refreshSideBar", () => {
      setConns(GLOBAL_CONNS.getAll());
    });

    return () => {
      offRefreshSidebar();
    };
  }, []);

  const deleteConn = (connId: string) => {
    DeleteConn(connId);
    setConns(GLOBAL_CONNS.getAll());
  };

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
              <SideBarItem
                key={conn.connId}
                conn={conn}
                deleteConn={() => deleteConn(conn.connId)}
              />
            ))}
          </List>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}

function SideBarItem(props: { conn: SavedConn; deleteConn: () => void }) {
  const { contextMenuPosition, handleContextMenu, closeContextMenu } =
    useContextMenu();

  return (
    <ListItem
      key={props.conn.connId}
      onContextMenu={handleContextMenu}
      sx={{
        "&:hover, &:has(*:focus)": { backgroundColor: "info.main" },
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
      <ContextMenu
        contextMenuPosition={contextMenuPosition}
        closeContextMenu={closeContextMenu}
      >
        <MenuItem>Edit</MenuItem>
        <MenuItem onClick={props.deleteConn}>Delete</MenuItem>
      </ContextMenu>
    </ListItem>
  );
}
