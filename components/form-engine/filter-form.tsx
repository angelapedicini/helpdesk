"use client";
import { useCallback, useRef } from "react";
import { useForm, Resolver, FieldValues, SubmitHandler, DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { FilterFormConfig } from "./fieldDefs";
import { renderField } from "./field-render";
import { useFilterPanel } from "../filter-panel";

type Props<TInput extends FieldValues> = {
  config: FilterFormConfig<TInput>;
  onApply: (filter: TInput) => void;
  role?: string;
};


export default function FilterForm<TInput extends FieldValues>({
  config,
  onApply,
  role,
}: Props<TInput>) {
  const { onClose: closeFilterPanel, setActiveFilterCount } = useFilterPanel();

  const resetFnsRef = useRef<Record<string, () => void>>({});
  const registerReset = useCallback((name: string, fn: () => void) => {
    resetFnsRef.current[name] = fn;
  }, []);

  const {
    handleSubmit,
    reset,
    control,
    register,
    formState: { errors },
  } = useForm<TInput, unknown, TInput>({
    resolver: zodResolver(config.schema) as Resolver<TInput>,
    defaultValues: config.defaultValues as DefaultValues<TInput>,
  });

  const onSubmit: SubmitHandler<TInput> = (data) => {
    const activeCount = Object.values(data).filter(
      (v) => v !== undefined && v !== "",
    ).length;
    setActiveFilterCount(activeCount);
    onApply(data);
    closeFilterPanel();
  };

  function handleReset() {
    reset(config.defaultValues as DefaultValues<TInput>);
    Object.values(resetFnsRef.current).forEach((fn) => fn()); // <- svuota tutte le query dei campi search
    setActiveFilterCount(0);
    onApply(config.defaultValues);
    closeFilterPanel();
  }

  const visibleFields = config.fields.filter((f) => !f.visibleFor || f.visibleFor(role));

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: 2 }}
    >
      {visibleFields.map((def) => (
        <Box key={def.name}>
          {renderField<TInput>(def, { control, register, errors, registerReset })}
        </Box>
      ))}

      <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
        <Button variant="outlined" onClick={handleReset}>
          Reset
        </Button>
        <Button type="submit" variant="contained">
          Cerca
        </Button>
      </Box>
    </Box>
  );
}