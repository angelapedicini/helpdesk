// components/table.tsx
"use client";
import { ReactNode, useCallback, useEffect, useRef } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import { Box } from "@mui/material";

export type SortDirection = "ASC" | "DESC";
export type SortState<TSortField extends string = string> = {
  field: TSortField;
  direction: SortDirection;
} | null;

export type Column<T, TSortField extends string = string> = {
  header: string;
  render: (row: T) => ReactNode;
  width?: string | number;
  maxWidth?: string | number;
  sortField?: TSortField;
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
    if (!col.sortField || !onSortChange) return;
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
            {columns.map((col) => (
              <TableCell
                key={col.header}
                onClick={() => handleHeaderClick(col)}
                sx={{
                  fontWeight: 600,
                  bgcolor: "grey.100",
                  width: col.width,
                  maxWidth: col.maxWidth ?? col.width,
                  cursor: col.sortField ? "pointer" : "default",
                  userSelect: "none",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                <Tooltip title={col.header} enterDelay={400}>
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

                    {col.sortField && (
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
                height: rowHeight,
              }}
            >
              {columns.map((col) => (
                <TableCell
                  key={col.header}
                  sx={{
                    height: rowHeight,
                    maxWidth: col.maxWidth ?? col.width,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}