// "use client";

// import * as React from 'react';
// import Box from '@mui/material/Box';
// import Table from '@mui/material/Table';
// import TableBody from '@mui/material/TableBody';
// import TableCell from '@mui/material/TableCell';
// import TableContainer from '@mui/material/TableContainer';
// import TableHead from '@mui/material/TableHead';
// import TableRow from '@mui/material/TableRow';
// import TableSortLabel from '@mui/material/TableSortLabel';
// import Tooltip from '@mui/material/Tooltip';
// import Paper from '@mui/material/Paper';
// import { visuallyHidden } from '@mui/utils';
// import { TruncatedTooltip } from './truncated-tooltip';

// // --------------------------------
// // TYPES
// // --------------------------------


// export interface RowBase {
//     id: number | string;
// }

// export interface HeadCell<T> {
//     id: keyof T;
//     label: string;
//     numeric?: boolean;
//     disablePadding?: boolean;
//     sortable?: boolean;

//     /**
//      * Larghezza opzionale della colonna.
//      * - number  -> interpretato come percentuale (es. 15 => "15%")
//      * - string  -> usato così com'è (es. "120px"), ma NON viene sottratto
//      *              con precisione dal calcolo automatico delle altre colonne
//      * Se omesso, la colonna occupa una quota proporzionale dello spazio
//      * residuo, assieme alle altre colonne senza width esplicita.
//      */
//     width?: number | string;

//     render?: (row: T) => React.ReactNode;
// }

// interface EnhancedTableProps<T extends RowBase> {
//     rows: T[];
//     headCells: readonly HeadCell<T>[];

//     /**
//      * Props di ordinamento opzionali.
//      * Se `onRequestSort` non viene passato, la tabella non è ordinabile:
//      * le colonne vengono renderizzate come semplici label troncabili,
//      * senza TableSortLabel né icone.
//      */
//     order?: Order;
//     orderBy?: keyof T;
//     onRequestSort?: (property: keyof T) => void;

//     actions?: (row: T) => React.ReactNode;

//     /** Larghezza della colonna azioni (number = %, string = valore CSS). Default: 120. */
//     actionsWidth?: number | string;

//     hasNextPage?: boolean;
//     onLoadMore?: () => void;

//     getRowClassName?: (row: T) => string | undefined;
//     getCellClassName?: (
//         row: T,
//         headCellId: keyof T
//     ) => string | undefined;

//     /**
//      * Tooltip opzionale a livello di riga. Se la funzione ritorna una
//      * stringa non vuota per una riga, questa viene avvolta in un
//      * MUI Tooltip che mostra il testo restituito. Se ritorna
//      * undefined/null, la riga viene renderizzata senza tooltip.
//      */
//     getRowTooltip?: (row: T) => string | undefined;

//     /** Altezza massima oltre la quale la tabella scrolla internamente. Default: '70vh'. */
//     maxHeight?: string | number;
// }

// // --------------------------------
// // COLUMN WIDTH RESOLUTION
// // --------------------------------

// function resolveColumnWidths<T>(
//     headCells: readonly HeadCell<T>[],
//     hasActions: boolean,
//     actionsWidth: number | string
// ): (number | string)[] {
//     const declaredWidths: (number | string | undefined)[] = headCells.map(
//         (hc) => hc.width
//     );

//     if (hasActions) {
//         declaredWidths.push(actionsWidth);
//     }

//     const explicitPercentTotal = declaredWidths.reduce<number>(
//         (sum, w) => (typeof w === 'number' ? sum + w : sum),
//         0
//     );

//     const undefinedCount = declaredWidths.filter(
//         (w) => w === undefined
//     ).length;

//     const remainingPercent = Math.max(
//         0,
//         100 - explicitPercentTotal
//     );

//     const autoPercent =
//         undefinedCount > 0
//             ? remainingPercent / undefinedCount
//             : 0;

//     return declaredWidths.map((w) => {
//         if (w === undefined) return `${autoPercent}%`;
//         if (typeof w === 'number') return `${w}%`;
//         return w;
//     });
// }

// // --------------------------------
// // HEADER
// // --------------------------------

// interface EnhancedTableHeadProps<T> {
//     headCells: readonly HeadCell<T>[];
//     order?: Order;
//     orderBy?: keyof T;
//     onRequestSort?: (property: keyof T) => void;
//     hasActions: boolean;
//     columnWidths: (number | string)[];
//     actionsWidth: number | string;
// }

// function EnhancedTableHead<T>(
//     props: EnhancedTableHeadProps<T>
// ) {
//     const {
//         headCells,
//         order,
//         orderBy,
//         onRequestSort,
//         hasActions,
//         columnWidths,
//         actionsWidth,
//     } = props;

//     // Se non viene passato onRequestSort, l'intera tabella è considerata
//     // non ordinabile: ogni colonna diventa una semplice label troncabile
//     // (solo hover, tramite TruncatedTooltip), senza TableSortLabel né icone.
//     const sortingEnabled = !!onRequestSort;

//     return (
//         <TableHead>
//             <TableRow>
//                 {headCells.map((headCell, index) => {
//                     const isSortable =
//                         sortingEnabled &&
//                         headCell.sortable !== false;

//                     return (
//                         <TableCell
//                             key={String(headCell.id)}
//                             align={
//                                 headCell.numeric
//                                     ? 'right'
//                                     : 'left'
//                             }
//                             padding={
//                                 headCell.disablePadding
//                                     ? 'none'
//                                     : 'normal'
//                             }
//                             sortDirection={
//                                 isSortable &&
//                                     orderBy === headCell.id
//                                     ? order
//                                     : false
//                             }
//                             sx={{
//                                 zIndex: 2,
//                                 width: columnWidths[index],
//                                 maxWidth: columnWidths[index],
//                                 overflow: 'hidden',
//                             }}
//                         >
//                             {!isSortable ? (
//                                 // Header non ordinabile: solo hover, nessun pulsante
//                                 <TruncatedTooltip trigger="hover">
//                                     {headCell.label}
//                                 </TruncatedTooltip>
//                             ) : (
//                                 <TableSortLabel
//                                     active={
//                                         orderBy === headCell.id
//                                     }
//                                     direction={
//                                         orderBy === headCell.id
//                                             ? order
//                                             : 'asc'
//                                     }
//                                     onClick={() =>
//                                         onRequestSort!(
//                                             headCell.id
//                                         )
//                                     }
//                                     sx={{
//                                         width: '100%',
//                                         '& .MuiTableSortLabel-icon': {
//                                             flexShrink: 0,
//                                         },
//                                     }}
//                                 >
//                                     {/* Header ordinabile: solo hover, nessun pulsante */}
//                                     <TruncatedTooltip trigger="hover">
//                                         {headCell.label}
//                                     </TruncatedTooltip>

//                                     {orderBy === headCell.id ? (
//                                         <Box
//                                             component="span"
//                                             sx={visuallyHidden}
//                                         >
//                                             {order === 'desc'
//                                                 ? 'sorted descending'
//                                                 : 'sorted ascending'}
//                                         </Box>
//                                     ) : null}
//                                 </TableSortLabel>
//                             )}
//                         </TableCell>
//                     );
//                 })}

//                 {hasActions && (
//                     <TableCell
//                         align="left"
//                         sx={{
//                             zIndex: 2,
//                             width: actionsWidth,
//                         }}
//                     >
//                         Azioni
//                     </TableCell>
//                 )}
//             </TableRow>
//         </TableHead>
//     );
// }

// // --------------------------------
// // TABLE
// // --------------------------------

// const SCROLL_THRESHOLD_PX = 100;
// const DEFAULT_MAX_HEIGHT = '78vh';
// const DEFAULT_ACTIONS_WIDTH = 11;

// export default function EnhancedTable<
//     T extends RowBase
// >({
//     rows,
//     headCells,
//     order,
//     orderBy,
//     onRequestSort,
//     actions,
//     actionsWidth = DEFAULT_ACTIONS_WIDTH,
//     hasNextPage = false,
//     onLoadMore,
//     getRowClassName,
//     getRowTooltip,
//     getCellClassName,
//     maxHeight = DEFAULT_MAX_HEIGHT,
// }: EnhancedTableProps<T>) {
//     const containerRef =
//         React.useRef<HTMLDivElement>(null);

//     const loadingLockRef =
//         React.useRef(false);

//     const columnWidths = React.useMemo(
//         () =>
//             resolveColumnWidths(
//                 headCells,
//                 !!actions,
//                 actionsWidth
//             ),
//         [headCells, actions, actionsWidth]
//     );

//     React.useEffect(() => {
//         loadingLockRef.current = false;
//     }, [rows.length, hasNextPage]);

//     const requestLoadMore = React.useCallback(() => {
//         if (
//             !hasNextPage ||
//             !onLoadMore ||
//             loadingLockRef.current
//         ) {
//             return;
//         }

//         loadingLockRef.current = true;
//         onLoadMore();
//     }, [hasNextPage, onLoadMore]);

//     const handleScroll = () => {
//         const container = containerRef.current;

//         if (!container) {
//             return;
//         }

//         const distanceFromBottom =
//             container.scrollHeight -
//             container.scrollTop -
//             container.clientHeight;

//         if (
//             distanceFromBottom <=
//             SCROLL_THRESHOLD_PX
//         ) {
//             requestLoadMore();
//         }
//     };

//     React.useEffect(() => {
//         const container = containerRef.current;

//         if (!container) {
//             return;
//         }

//         if (
//             container.scrollHeight <=
//             container.clientHeight
//         ) {
//             requestLoadMore();
//         }
//     }, [
//         rows,
//         hasNextPage,
//         requestLoadMore,
//     ]);

//     return (
//         <Box sx={{ width: '100%' }}>
//             <Paper sx={{ width: '100%' }}>
//                 <TableContainer
//                     ref={containerRef}
//                     onScroll={handleScroll}
//                     sx={{
//                         maxHeight,
//                         overflowX: 'hidden',
//                         overflowY: 'auto',
//                     }}
//                 >
//                     <Table
//                         stickyHeader
//                         sx={{
//                             width: '100%',
//                             tableLayout: 'fixed',
//                         }}
//                     >
//                         <EnhancedTableHead<T>
//                             headCells={headCells}
//                             order={order}
//                             orderBy={orderBy}
//                             onRequestSort={
//                                 onRequestSort
//                             }
//                             hasActions={!!actions}
//                             columnWidths={
//                                 columnWidths
//                             }
//                             actionsWidth={
//                                 actionsWidth
//                             }
//                         />

//                         <TableBody>
//                             {rows.map((row) => {
//                                 const rowNode = (
//                                     <TableRow
//                                         hover
//                                         className={getRowClassName?.(row)}
//                                     >
//                                         {headCells.map(
//                                             (
//                                                 headCell,
//                                                 index
//                                             ) => (
//                                                 <TableCell
//                                                     key={String(
//                                                         headCell.id
//                                                     )}
//                                                     component={
//                                                         index ===
//                                                             0
//                                                             ? 'th'
//                                                             : undefined
//                                                     }
//                                                     scope={
//                                                         index ===
//                                                             0
//                                                             ? 'row'
//                                                             : undefined
//                                                     }
//                                                     align={
//                                                         headCell.numeric
//                                                             ? 'right'
//                                                             : 'left'
//                                                     }
//                                                     padding={
//                                                         headCell.disablePadding
//                                                             ? 'none'
//                                                             : 'normal'
//                                                     }
//                                                     className={getCellClassName?.(
//                                                         row,
//                                                         headCell.id
//                                                     )}
//                                                     sx={{
//                                                         width: columnWidths[index],
//                                                         overflow: 'hidden',
//                                                         textOverflow: 'ellipsis',
//                                                         whiteSpace: 'nowrap',
//                                                     }}
//                                                 >
//                                                     {headCell.render ? (
//                                                         // Render custom: resta a discrezione del chiamante
//                                                         headCell.render(row)
//                                                     ) : (
//                                                         // Render di default: click con pulsante "espandi"
//                                                         <TruncatedTooltip trigger="click">
//                                                             {String(row[headCell.id])}
//                                                         </TruncatedTooltip>
//                                                     )}
//                                                 </TableCell>
//                                             )
//                                         )}

//                                         {actions && (
//                                             <TableCell
//                                                 align="left"
//                                                 sx={{
//                                                     width: actionsWidth,
//                                                 }}
//                                             >
//                                                 {actions(row)}
//                                             </TableCell>
//                                         )}
//                                     </TableRow>
//                                 );

//                                 const tooltipTitle = getRowTooltip?.(row);

//                                 return tooltipTitle ? (
//                                     <Tooltip
//                                         key={row.id}
//                                         title={tooltipTitle}
//                                         arrow
//                                         placement="top"
//                                         slotProps={{
//                                             tooltip: {
//                                                 sx: { fontSize: "0.875rem" }, // default MUI è 0.6875rem (11px)
//                                             },
//                                         }}
//                                     >
//                                         {rowNode}
//                                     </Tooltip>
//                                 ) : (
//                                     <React.Fragment key={row.id}>
//                                         {rowNode}
//                                     </React.Fragment>
//                                 );
//                             })}
//                         </TableBody>
//                     </Table>
//                 </TableContainer>
//             </Paper>
//         </Box>
//     );
// }