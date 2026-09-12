import { z } from "zod";

export const TicketDepartmentStatSchema = z.object({
  department: z.string().meta({ axis: "x" }),

  totalTickets: z.coerce.number().meta({ axis: "y", agg: "sum" }),
  openCount: z.coerce.number().meta({ axis: "y", agg: "sum" }),
  pendingReviewCount: z.coerce.number().meta({ axis: "y", agg: "sum" }),
  inProgressCount: z.coerce.number().meta({ axis: "y", agg: "sum" }),
  closedCount: z.coerce.number().meta({ axis: "y", agg: "sum" }),
  refusedCount: z.coerce.number().meta({ axis: "y", agg: "sum" }),
  overdueCount: z.coerce.number().meta({ axis: "y", agg: "sum" }),

  sumResolutionHours: z
    .coerce.number()
    .meta({ axis: "y", agg: "sum", hidden: true }),
  closedWithResolutionCount: z
    .coerce.number()
    .meta({ axis: "y", agg: "sum", hidden: true }),

  avgResolutionHours: z
    .coerce.number()
    .optional()
    .meta({
      axis: "y",
      agg: "ratio",
      numerator: "sumResolutionHours",
      denominator: "closedWithResolutionCount",
    }),
});

export type TicketDepartmentStat = z.infer<typeof TicketDepartmentStatSchema>;

export const TechnicianWorkloadStatSchema = z.object({
  technicianId: z.coerce.number().meta({ hidden: true }), // non è un asse, serve solo come id/chiave
  firstName: z.string(),
  lastName: z.string(),
  role: z.string(),
  department: z.string().meta({ axis: "x" }),

  pendingReviewCount: z.coerce.number().meta({ axis: "y", agg: "sum" }),
  activeCount: z.coerce.number().meta({ axis: "y", agg: "sum" }),
  overdueCount: z.coerce.number().meta({ axis: "y", agg: "sum" }),
  closedThisPeriod: z.coerce.number().meta({ axis: "y", agg: "sum" }),

  sumResolutionHours: z
    .coerce.number()
    .meta({ axis: "y", agg: "sum", hidden: true }),
  closedWithResolutionCount: z
    .coerce.number()
    .meta({ axis: "y", agg: "sum", hidden: true }),

  avgResolutionHours: z
    .coerce.number()
    .optional()
    .meta({
      axis: "y",
      agg: "ratio",
      numerator: "sumResolutionHours",
      denominator: "closedWithResolutionCount",
    }),
});

export type TechnicianWorkloadStat = z.infer<typeof TechnicianWorkloadStatSchema>;