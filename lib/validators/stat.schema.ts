import { z } from "zod";

const totalField = z.coerce.number().meta({
  axis: "y",
  view: "totali",
  label: "Totale",
});

const averageField = z.coerce.number().meta({
  axis: "y",
  view: "media",
  label: "Media (h)",
});

const statusField = (label: string) =>
  z.coerce.number().meta({
    axis: "y",
    view: "stati",
    label,
  });

const lateField = (label: string) =>
  z.coerce.number().meta({
    axis: "y",
    view: "ritardi",
    label,
  });

export const NewSchema = z.object({
  department: z.string().meta({ axis: "x" }),

  total: totalField,
  average: averageField,

  open: statusField("Aperti"),
  assigned: statusField("Assegnati"),
  inProgress: statusField("In corso"),
  closed: statusField("Chiusi"),
  refused: statusField("Rifiutati"),

  firstResponseLate: lateField("Prima risposta in ritardo"),
  dueDateLate: lateField("Chiusi oltre dueDate"),
  closedOnTime: lateField("Chiusi nei tempi"),
  openAssignedLate: lateField("Open/Assegnati oltre scadenza"),
});

export type New = z.infer<typeof NewSchema>;

export const TechnicianSchema = z.object({
  label: z.string().meta({ axis: "x" }),
  technicianId: z.string(),

  total: totalField,
  average: averageField,

  open: statusField("Aperti"),
  assigned: statusField("Assegnati"),
  inProgress: statusField("In corso"),
  closed: statusField("Chiusi"),
  refused: statusField("Rifiutati"),

  firstResponseLate: lateField("Prima risposta in ritardo"),
  dueDateLate: lateField("Chiusi oltre dueDate"),
});

export type TechnicianStats = z.infer<typeof TechnicianSchema>;