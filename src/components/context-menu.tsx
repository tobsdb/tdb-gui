import { Menu } from "@mui/material";
import { useState, type MouseEvent, type PropsWithChildren } from "react";

type ContextMenuPosition = { mouseX: number; mouseY: number } | null;

export function useContextMenu() {
  const [contextMenuPosition, setContextMenuPosition] =
    useState<ContextMenuPosition>(null);

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition((state) =>
      state === null ? { mouseX: e.clientX + 2, mouseY: e.clientY - 4 } : null
    );
  };

  const closeContextMenu = () => {
    setContextMenuPosition(null);
  };

  return { contextMenuPosition, handleContextMenu, closeContextMenu };
}

interface ContextMenuProps {
  contextMenuPosition: ContextMenuPosition;
  closeContextMenu: () => void;
}

export function ContextMenu({
  children,
  contextMenuPosition,
  closeContextMenu,
}: ContextMenuProps & PropsWithChildren) {
  return (
    <Menu
      open={contextMenuPosition !== null}
      onClose={closeContextMenu}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenuPosition !== null
          ? {
              top: contextMenuPosition.mouseY,
              left: contextMenuPosition.mouseX,
            }
          : undefined
      }
    >
      {children}
    </Menu>
  );
}
