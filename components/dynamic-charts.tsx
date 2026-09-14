"use client";

import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import { z } from "zod";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import {
  Box,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

type ChartMeta = {
  axis: "x" | "y";
  view?: string;   // a quale visualizzazione appartiene questo campo Y
  label?: string;  // etichetta leggibile per legenda/tooltip
};

type Props<T extends Record<string, unknown>> = {
  data: T[];
  schema: z.ZodObject<Record<string, z.ZodType>>;
  viewLabels?: Record<string, string>; // controlla QUALI viste sono disponibili e come si chiamano
  renderLabel?: (label: string) => React.ReactNode;
};

export default function DynamicChart<T extends Record<string, unknown>>({
  data,
  schema,
  viewLabels = {},
  renderLabel,
}: Props<T>) {
  // =========================================================
  // 1. LETTURA METADATI: asse X fisso + campi Y raggruppati per vista
  // =========================================================

  const { xKey, viewGroups } = useMemo(() => {
    const shape = schema.shape;
    const keys = Object.keys(shape);
    const metaOf = (key: string) => shape[key].meta() as ChartMeta | undefined;

    const xKey = keys.find((key) => metaOf(key)?.axis === "x") ?? keys[0];

    const groups: Record<string, { key: string; label: string }[]> = {};

    for (const key of keys) {
      const meta = metaOf(key);
      if (meta?.axis !== "y" || !meta.view) continue;

      if (!groups[meta.view]) groups[meta.view] = [];
      groups[meta.view].push({ key, label: meta.label ?? key });
    }

    return { xKey, viewGroups: groups };
  }, [schema]);

  // =========================================================
  // 2. VISTE DISPONIBILI
  //
  // Se viewLabels viene passata con solo alcune chiavi (es. solo
  // "stati" per un admin), il Select mostra SOLO quelle, nell'ordine
  // in cui sono dichiarate. Se viewLabels non viene passata (o è
  // vuota), mostra tutte le viste trovate nello schema.
  // =========================================================

  const viewNames = useMemo(() => {
    const declared = Object.keys(viewLabels);

    if (declared.length > 0) {
      return declared.filter((name) => viewGroups[name]);
    }

    return Object.keys(viewGroups);
  }, [viewGroups, viewLabels]);

  // =========================================================
  // 3. STATO: vista selezionata + label nascoste
  // =========================================================

  const [view, setView] = useState<string>(viewNames[0]);
  const [hiddenLabels, setHiddenLabels] = useState<Set<string>>(new Set());

  // Se le viste disponibili cambiano (es. viewLabels arriva da una
  // query async, oppure passa da "tutte" a "solo stati" per un admin)
  // e la vista attualmente selezionata non è più valida, riallinea
  // automaticamente sulla prima disponibile.
  useEffect(() => {
    if (!viewNames.includes(view) && viewNames.length > 0) {
      setView(viewNames[0]);
    }
  }, [viewNames, view]);

  const activeFields = viewGroups[view] ?? [];

  const toggleLabel = (label: string) => {
    setHiddenLabels((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  // =========================================================
  // 4. LABEL ASSE X (direttamente dai dati, nessuna aggregazione)
  // =========================================================

  const allLabels = useMemo(
    () => data.map((row) => String(row[xKey] ?? "")),
    [data, xKey],
  );

  // =========================================================
  // 5. FILTRO DELLE RIGHE IN BASE ALLE LABEL NASCOSTE
  // =========================================================

  const filtered = useMemo(() => {
    const visible = data
      .map((row, index) => ({ row, label: allLabels[index] }))
      .filter(({ label }) => !hiddenLabels.has(label));

    return {
      labels: visible.map(({ label }) => label),
      rows: visible.map(({ row }) => row),
    };
  }, [data, allLabels, hiddenLabels]);

  // =========================================================
  // 6. CONFIGURAZIONE ECHARTS
  // =========================================================

  const option = useMemo(() => {
    const chartSeries = activeFields.map(({ key, label }) => ({
      name: label,
      type: "bar",
      barMaxWidth: 40,
      itemStyle: { borderRadius: [3, 3, 0, 0] },
      data: filtered.rows.map((row) => Number(row[key] ?? 0)),
    }));

    return {
      tooltip: { trigger: "axis" },

      legend:
        chartSeries.length > 1
          ? { top: 0, data: chartSeries.map((s) => s.name) }
          : undefined,

      grid: {
        left: 55,
        right: 40,
        top: chartSeries.length > 1 ? 60 : 30,
        bottom: 60,
      },

      xAxis: {
        type: "category",
        data: filtered.labels,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { rotate: 25, fontSize: 11, interval: 0 },
      },

      yAxis: {
        type: "value",
        splitLine: { lineStyle: { opacity: 0.2 } },
        axisLine: { show: false },
      },

      series: chartSeries,
    };
  }, [activeFields, filtered]);

  // =========================================================
  // 7. EMPTY STATE
  // =========================================================

  if (data.length === 0) return null;

  // =========================================================
  // 8. RENDER
  // =========================================================

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%", pt: 2 }}>
      {/* =====================================================
          SELETTORE VISTA + FILTRI
          ===================================================== */}

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          gap: 2,
          width: "100%",
        }}
      >
        {/* -----------------------------------------------
            SELETTORE VISTA
            ----------------------------------------------- */}

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexShrink: 0 }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Vista</InputLabel>

            <Select
              value={view}
              label="Vista"
              onChange={(event) => setView(event.target.value)}
            >
              {viewNames.map((name) => (
                <MenuItem key={name} value={name}>
                  {viewLabels[name] ?? name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* -----------------------------------------------
            FILTRI DIPARTIMENTI (righe)
            ----------------------------------------------- */}

        <Box sx={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 0.5 }}>
          {Array.from(new Set(allLabels)).map((label) => (
            <FormControlLabel
              key={label}
              label={renderLabel ? renderLabel(label) : label}
              sx={{ mr: 1, ml: 0 }}
              control={
                <Checkbox
                  size="small"
                  checked={!hiddenLabels.has(label)}
                  onChange={() => toggleLabel(label)}
                  sx={{
                    color: "#6366f1",
                    "&.Mui-checked": { color: "#6366f1" },
                    padding: "2px",
                  }}
                />
              }
            />
          ))}
        </Box>
      </Box>

      {/* =====================================================
          GRAFICO
          ===================================================== */}

      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <ReactECharts
            option={option}
            replaceMerge={["series", "legend"]}
            style={{ height: 330 }}
          />
        </Box>
      </Box>
    </Box>
  );
}