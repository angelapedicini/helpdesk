// components/table.tsx
"use client";
import { ComponentType, ReactNode, useCallback, useEffect, useRef } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { Box } from "@mui/material";

export type SortDirection = "ASC" | "DESC";
export type SortState<TSortField extends string = string> = {
  field: TSortField;
  direction: SortDirection;
} | null;

// ---- NUOVO: azione dichiarativa per riga ----
export type RowAction<T> = {
  icon: ComponentType<{ fontSize?: "small" }>;
  label: string; // usato come tooltip di default
  onClick: (row: T) => void;
  disabled?: (row: T) => boolean;
  disabledReason?: (row: T) => string | undefined;
  hidden?: (row: T) => boolean;
};

export type Column<T, TSortField extends string = string> =
  // aggiungi al tipo Column (variante non-actions):
  | {
    kind?: "custom";
    header: string;
    render: (row: T) => ReactNode;
    width?: string | number;
    maxWidth?: string | number;
    sortField?: TSortField;
    highlight?: (row: T) => boolean; // ← nuovo
    wrap?: boolean; // ← nuovo: permette al testo di andare a capo in questa colonna
  }
  | {
    kind: "actions";
    header?: string;
    width?: string | number;
    actions: RowAction<T>[];
  };

type TableProps<T, TSortField extends string = string> = {
  data: T[];
  columns: Column<T, TSortField>[];
  keyExtractor: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  maxHeight?: string;
  rowHeight?: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  sort?: SortState<TSortField>;
  onSortChange?: (sort: SortState<TSortField>) => void;
};

function ActionsCell<T>({ actions, row }: { actions: RowAction<T>[]; row: T }) {
  return (
    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "nowrap" }}>
      {actions
        .filter((action) => !action.hidden?.(row))
        .map((action) => {
          const disabled = action.disabled?.(row) ?? false;
          const Icon = action.icon;
          const title = disabled ? action.disabledReason?.(row) ?? "" : action.label;

          return (
            <Tooltip key={action.label} title={title}>
              <span>
                <IconButton
                  size="small"
                  disabled={disabled}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseUp={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick(row);
                  }}
                >
                  <Icon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          );
        })}
    </Box>
  );
}

export default function AppTable<T, TSortField extends string = string>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  maxHeight,
  rowHeight = 44,
  onLoadMore,
  hasMore,
  loadingMore,
  sort,
  onSortChange,
}: TableProps<T, TSortField>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseDownPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !onLoadMore || !hasMore || loadingMore) return;
    if (el.scrollHeight <= el.clientHeight) onLoadMore();
  }, [data, hasMore, loadingMore, onLoadMore]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (!onLoadMore || !hasMore || loadingMore) return;
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (scrollHeight - scrollTop - clientHeight < 150) onLoadMore();
    },
    [onLoadMore, hasMore, loadingMore]
  );

  const handleHeaderClick = (col: Column<T, TSortField>) => {
    if (col.kind === "actions" || !col.sortField || !onSortChange) return;
    const isSameField = sort?.field === col.sortField;
    const nextDirection: SortDirection =
      isSameField && sort?.direction === "ASC" ? "DESC" : "ASC";
    onSortChange({ field: col.sortField, direction: nextDirection });
  };

  const handleRowMouseDown = (e: React.MouseEvent) => {
    mouseDownPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleRowMouseUp = (e: React.MouseEvent, row: T) => {
    if (!onRowClick) return;

    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      mouseDownPos.current = null;
      return;
    }

    const start = mouseDownPos.current;
    mouseDownPos.current = null;
    if (start) {
      const dx = Math.abs(e.clientX - start.x);
      const dy = Math.abs(e.clientY - start.y);
      if (dx > 4 || dy > 4) return;
    }

    onRowClick(row);
  };

  return (
    <TableContainer
      ref={containerRef}
      component={Paper}
      onScroll={handleScroll}
      sx={{ maxHeight: maxHeight ?? "none", overflow: "auto" }}
    >
      <Table stickyHeader size="small" sx={{ tableLayout: "fixed" }}>
        <TableHead>
          <TableRow>
            {columns.map((col, i) => (
              <TableCell
                key={col.header ?? `col-${i}`}
                onClick={() => handleHeaderClick(col)}
                sx={{
                  fontWeight: 600,
                  bgcolor: "grey.100",
                  width: col.width,
                  maxWidth: col.kind === "actions" ? col.width : col.maxWidth ?? col.width,
                  cursor: col.kind !== "actions" && col.sortField ? "pointer" : "default",
                  userSelect: "none",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                <Tooltip title={col.header ?? ""} enterDelay={400}>
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
                    }}
                  >
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col.header}
                    </span>

                    {col.kind !== "actions" && col.sortField && (
                      <span
                        style={{
                          flexShrink: 0,
                          fontSize: "0.75em",
                          opacity: sort?.field === col.sortField ? 1 : 0.35,
                        }}
                      >
                        {sort?.field === col.sortField
                          ? sort.direction === "ASC"
                            ? "▲"
                            : "▼"
                          : "⇅"}
                      </span>
                    )}
                  </Box>
                </Tooltip>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={keyExtractor(row)}
              hover={!!onRowClick}
              onMouseDown={onRowClick ? handleRowMouseDown : undefined}
              onMouseUp={onRowClick ? (e) => handleRowMouseUp(e, row) : undefined}
              sx={{
                cursor: onRowClick ? "pointer" : "default",
                minHeight: rowHeight, // era "height": ora la riga può crescere se una cella wrappa
              }}
            >
              {columns.map((col, i) => {
                const wrap = col.kind !== "actions" && col.wrap;

                return (
                  <TableCell
                    key={col.header ?? `col-${i}`}
                    sx={{
                      height: wrap ? "auto" : rowHeight,
                      maxWidth: col.kind === "actions" ? col.width : col.maxWidth ?? col.width,
                      overflow: wrap ? "visible" : "hidden",
                      textOverflow: wrap ? "clip" : "ellipsis",
                      whiteSpace: wrap ? "normal" : "nowrap",
                      wordBreak: wrap ? "break-word" : undefined,
                      verticalAlign: wrap ? "top" : "middle",
                      bgcolor:
                        col.kind !== "actions" && col.highlight?.(row) ? "#44402d" : undefined, // giallo
                    }}
                  >
                    {col.kind === "actions" ? (
                      <ActionsCell actions={col.actions} row={row} />
                    ) : (
                      col.render(row)
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}