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
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import SearchIcon from "@mui/icons-material/Search";
import Popper from "@mui/material/Popper";
import Typography from "@mui/material/Typography";
import { useEffect, useRef, useState } from "react";

export type SearchResult = { id: number; label: string };

// Versione "concreta" di un campo controllato da RHF, ristretta
// a value/onChange numerici opzionali: è il contratto reale che
// questo componente si aspetta, indipendentemente dal TInput del form.
type NumericField<TInput extends FieldValues> = Omit<
  ControllerRenderProps<TInput, Path<TInput>>,
  "value" | "onChange"
> & {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
};

// Il componente non sa nulla di come vengono ottenuti i risultati
// (GraphQL, REST, mock...): chiama onSearch con la query digitata
// e gestisce da solo lo stato dei risultati restituiti.
type SearchInputContentProps<TInput extends FieldValues> = {
  idField: NumericField<TInput>;
  fieldState: ControllerFieldState;
  label: string;
  onSearch: (query: string) => Promise<SearchResult[]>;
  loading?: boolean;
  disabled?: boolean;
  initialLabel?: string;
  registerReset?: (name: string, fn: () => void) => void;
};

function SearchInputContent<TInput extends FieldValues>({
  idField,
  fieldState,
  label,
  onSearch,
  loading,
  disabled,
  initialLabel,
  registerReset,
}: SearchInputContentProps<TInput>) {
  const [query, setQuery] = useState(initialLabel ?? "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  // Tiene traccia dell'ultimo id impostato "internamente"
  // (selezione utente o digitazione, vedi handleSelect / onChange).
  // Se idField.value cambia senza passare da lì, significa che è
  // arrivato dall'esterno (es. reset() di react-hook-form) e la
  // label va risincronizzata su initialLabel.
  const lastKnownIdRef = useRef(idField.value);

  useEffect(() => {
    if (idField.value === lastKnownIdRef.current) return;

    lastKnownIdRef.current = idField.value;
    setQuery(initialLabel ?? "");
    setResults([]);
    setOpen(false);
  }, [idField.value, initialLabel]);

  // Comando imperativo: quando si preme Reset, FilterForm chiama questa funzione.
  useEffect(() => {
    registerReset?.(idField.name, () => {
      setQuery("");
      setResults([]);
      setOpen(false);
    });
  }, [registerReset, idField.name]);

  async function handleSearch() {
    setOpen(true);
    try {
      const items = await onSearch(query);
      setResults(items);
    } catch {
      setResults([]);
    }
  }

  function handleSelect(item: SearchResult) {
    lastKnownIdRef.current = item.id;
    idField.onChange(item.id);
    setQuery(item.label);
    setOpen(false);
  }

  return (
    <Box
      ref={setAnchorEl}
      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setOpen(false);
        }
      }}
    >
      <Box sx={{ display: "flex", gap: 0.5 }}>
        <TextField
          label={label}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            lastKnownIdRef.current = undefined;
            idField.onChange(undefined);
            setResults([]);
            setOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
          size="small"
          fullWidth
          disabled={disabled}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
        />
        <IconButton
          onClick={handleSearch}
          size="small"
          disabled={disabled || loading}
        >
          {loading ? (
            <CircularProgress size={16} />
          ) : (
            <SearchIcon fontSize="small" />
          )}
        </IconButton>
      </Box>

      <Popper
        open={open}
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
  control: Control<TInput>;
  onSearch: (query: string) => Promise<SearchResult[]>;
  loading?: boolean;
  disabled?: boolean;
  initialLabel?: string;
  registerReset?: (name: string, fn: () => void) => void;
};

export function SearchInput<TInput extends FieldValues>({
  name,
  label,
  control,
  onSearch,
  loading,
  disabled,
  initialLabel,
  registerReset,
}: Props<TInput>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <SearchInputContent<TInput>
          // Unico punto di raccordo tra il campo generico di RHF
          // e il contratto concreto (number | undefined) richiesto
          // da questo componente. Vale finché SearchInput viene usato
          // solo su campi che rappresentano un id numerico.
          idField={{
            ...field,
            value: field.value as number | undefined,
            onChange: field.onChange as (value: number | undefined) => void,
          }}
          fieldState={fieldState}
          label={label}
          onSearch={onSearch}
          loading={loading}
          disabled={disabled}
          initialLabel={initialLabel}
          registerReset={registerReset}
        />
      )}
    />
  );
}