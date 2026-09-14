import { z } from "zod";

export const NewSchema = z.object({
  department: z.string().meta({ axis: "x" }),

  total: z.coerce.number().meta({
    axis: "y",
    view: "totali",
    label: "Totale",
  }),

  average: z.coerce.number().meta({
    axis: "y",
    view: "media",
    label: "Media (h)",
  }),

  open: z.coerce.number().meta({
    axis: "y",
    view: "stati",
    label: "Aperti",
  }),

  assigned: z.coerce.number().meta({
    axis: "y",
    view: "stati",
    label: "Assegnati",
  }),

  inProgress: z.coerce.number().meta({
    axis: "y",
    view: "stati",
    label: "In corso",
  }),

  closed: z.coerce.number().meta({
    axis: "y",
    view: "stati",
    label: "Chiusi",
  }),

  refused: z.coerce.number().meta({
    axis: "y",
    view: "stati",
    label: "Rifiutati",
  }),
});

export type New = z.infer<typeof NewSchema>;