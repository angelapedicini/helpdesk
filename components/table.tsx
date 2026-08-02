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
  sortField?: TSortField;
};

type TableProps<T, TSortField extends string = string> = {
  data: T[];
  columns: Column<T, TSortField>[];
  keyExtractor: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  maxHeight?: string;
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
  onLoadMore,
  hasMore,
  loadingMore,
  sort,
  onSortChange,
}: TableProps<T, TSortField>) {
  const containerRef = useRef<HTMLDivElement>(null);

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
    console.log("click header", col.header, col.sortField);
    console.log("onSortChange defined?", typeof onSortChange); // aggiungi questo
    if (!col.sortField || !onSortChange) return;
    const isSameField = sort?.field === col.sortField;
    const nextDirection: SortDirection = isSameField && sort?.direction === "ASC" ? "DESC" : "ASC";
    console.log("calling onSortChange with", { field: col.sortField, direction: nextDirection }); // e questo
    onSortChange({ field: col.sortField, direction: nextDirection });
  };

  return (
    <TableContainer
      ref={containerRef}
      component={Paper}
      onScroll={handleScroll}
      sx={{ maxHeight: maxHeight ?? "none", overflow: "auto" }}
    >
      <Table stickyHeader size="small">
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
                  cursor: col.sortField ? "pointer" : "default",
                  userSelect: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <Box
                  component="span"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    whiteSpace: "nowrap",
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
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={keyExtractor(row)}
              hover={!!onRowClick}
              onClick={() => onRowClick?.(row)}
              sx={{ cursor: onRowClick ? "pointer" : "default" }}
            >
              {columns.map((col) => (
                <TableCell key={col.header}>{col.render(row)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}