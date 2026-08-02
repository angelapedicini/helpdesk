import {
  Controller,
  ControllerRenderProps,
  ControllerFieldState,
  FieldValues,
  Path,
  Control,
} from "react-hook-form";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import SearchIcon from "@mui/icons-material/Search";
import Popper from "@mui/material/Popper";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { SearchResult } from "../fieldDefs";

type SearchInputContentProps<TInput extends FieldValues> = {
  idField: ControllerRenderProps<TInput, Path<TInput>>;
  fieldState: ControllerFieldState;
  label: string;
  searchFn: (filter: { search?: string }) => Promise<SearchResult[]>;
  initialLabel?: string;
  registerReset?: (name: string, fn: () => void) => void;
};

function SearchInputContent<TInput extends FieldValues>({
  idField,
  fieldState,
  label,
  searchFn,
  initialLabel,
  registerReset,
}: SearchInputContentProps<TInput>) {
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
      const data = await searchFn({ search: query });
      setResults(data);
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
        <IconButton onClick={handleSearch} size="small">
          <SearchIcon fontSize="small" />
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

type Props<TInput extends FieldValues> = {
  name: Path<TInput>;
  label: string;
  searchFn: (filter: { search?: string }) => Promise<SearchResult[]>;
  control: Control<TInput>;
  initialLabel?: string;
  registerReset?: (name: string, fn: () => void) => void;
};

export function SearchInput<TInput extends FieldValues>({
  name,
  label,
  searchFn,
  control,
  initialLabel,
  registerReset,
}: Props<TInput>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: idField, fieldState }) => (
        <SearchInputContent<TInput>
          idField={idField}
          fieldState={fieldState}
          label={label}
          searchFn={searchFn}
          initialLabel={initialLabel}
          registerReset={registerReset}
        />
      )}
    />
  );
}