import { useController, Control, FieldValues, Path } from "react-hook-form";

export function useSelectField<TInput extends FieldValues>(
  name: Path<TInput>,
  control: Control<TInput>,
  validValues: (string | number)[]
) {
  const { field, fieldState } = useController({ name, control });

  // Se il valore corrente non è tra le opzioni valide (es. in caricamento,
  // o opzione rimossa), fallback a stringa vuota per evitare il warning MUI
  // "out-of-range value" e non mostrare un valore fantasma.
  const value = validValues.includes(field.value) ? field.value : "";

  return {
    value,
    onChange: field.onChange,
    onBlur: field.onBlur,
    name: field.name,
    inputRef: field.ref,
    error: fieldState.error,
  };
}