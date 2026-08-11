import {
  Controller,
  ControllerRenderProps,
  ControllerFieldState,
  FieldValues,
  Path,
  Control,
} from "react-hook-form";
import { OperationVariables } from "@apollo/client";
import { LazyQueryExecFunction } from "@apollo/client/react";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import SearchIcon from "@mui/icons-material/Search";
import Popper from "@mui/material/Popper";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";

export type SearchResult = { id: number; label: string };

// Vincola TVariables ad avere sempre un campo "search" opzionale,
// così SearchInput può essere usato solo con query che lo prevedono.
type SearchVariables = OperationVariables & { search?: string };

type SearchInputContentProps<
  TInput extends FieldValues,
  TData,
  TVariables extends SearchVariables
> = {
  idField: ControllerRenderProps<TInput, Path<TInput>>;
  fieldState: ControllerFieldState;
  label: string;
  execute: LazyQueryExecFunction<TData, TVariables>;
  variables?: Omit<TVariables, "search">;
  mapData: (data: TData | undefined) => SearchResult[];
  loading?: boolean;
  initialLabel?: string;
  registerReset?: (name: string, fn: () => void) => void;
};

function SearchInputContent<
  TInput extends FieldValues,
  TData,
  TVariables extends SearchVariables
>({
  idField,
  fieldState,
  label,
  execute,
  variables,
  mapData,
  loading,
  initialLabel,
  registerReset,
}: SearchInputContentProps<TInput, TData, TVariables>) {
  const [query, setQuery] = useState(initialLabel ?? "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  // Comando imperativo: quando si preme Reset, FilterForm chiama questa funzione.
  useEffect(() => {
    registerReset?.(idField.name, () => setQuery(""));
  }, [registerReset, idField.name]);

  async function handleSearch() {
    try {
      // Cast sicuro: sappiamo che TVariables ha sempre "search" opzionale
      // (vincolato da SearchVariables), ma TS non riesce a verificare
      // per struttura la fusione di generici, quindi passiamo da "unknown".
      const { data } = await execute({
        variables: { ...variables, search: query } as unknown as TVariables,
      });
      setResults(mapData(data));
    } catch {
      setResults([]);
    } finally {
      setHasSearched(true);
    }
  }

  function handleSelect(item: SearchResult) {
    idField.onChange(item.id);
    setQuery(item.label);
    setResults([]);
    setHasSearched(false);
  }

  const showPopper = hasSearched;

  return (
    <Box
      ref={setAnchorEl}
      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setHasSearched(false);
        }
      }}
    >
      <Box sx={{ display: "flex", gap: 0.5 }}>
        <TextField
          label={label}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            idField.onChange(undefined);
            setHasSearched(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
          size="small"
          fullWidth
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
        />
        <IconButton onClick={handleSearch} size="small" disabled={loading}>
          {loading ? (
            <CircularProgress size={16} />
          ) : (
            <SearchIcon fontSize="small" />
          )}
        </IconButton>
      </Box>

      <Popper
        open={showPopper}
        anchorEl={anchorEl}
        placement="bottom-start"
        sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
        style={{ width: anchorEl?.clientWidth }}
      >
        <Paper
          elevation={8}
          onWheel={(e) => e.stopPropagation()}
          sx={{
            maxHeight: "20vh",
            overflow: "auto",
            overscrollBehavior: "contain",
            borderRadius: 2,
            mt: 0.5,
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "#1e1e1e" : "#ffffff",
          }}
        >
          {results.length > 0 ? (
            <List dense disablePadding>
              {results.map((item) => (
                <ListItemButton
                  key={item.id}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(item)}
                  sx={{ px: 1.5, py: 0.75 }}
                >
                  <ListItemText
                    primary={item.label}
                    slotProps={{ primary: { sx: { fontSize: "0.875rem" } } }}
                  />
                </ListItemButton>
              ))}
            </List>
          ) : (
            <Box sx={{ px: 1.5, py: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Nessun risultato
              </Typography>
            </Box>
          )}
        </Paper>
      </Popper>
    </Box>
  );
}

type Props<
  TInput extends FieldValues,
  TData,
  TVariables extends SearchVariables
> = {
  name: Path<TInput>;
  label: string;
  control: Control<TInput>;
  execute: LazyQueryExecFunction<TData, TVariables>;
  variables?: Omit<TVariables, "search">;
  mapData: (data: TData | undefined) => SearchResult[];
  loading?: boolean;
  initialLabel?: string;
  registerReset?: (name: string, fn: () => void) => void;
};

export function SearchInput<
  TInput extends FieldValues,
  TData,
  TVariables extends SearchVariables
>({
  name,
  label,
  control,
  execute,
  variables,
  mapData,
  loading,
  initialLabel,
  registerReset,
}: Props<TInput, TData, TVariables>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: idField, fieldState }) => (
        <SearchInputContent<TInput, TData, TVariables>
          idField={idField}
          fieldState={fieldState}
          label={label}
          execute={execute}
          variables={variables}
          mapData={mapData}
          loading={loading}
          initialLabel={initialLabel}
          registerReset={registerReset}
        />
      )}
    />
  );
}