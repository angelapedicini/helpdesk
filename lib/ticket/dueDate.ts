// lib/ticket/dueDate.ts
import { addBusinessDays } from "date-fns";
import { TicketPriority } from "../validators/enums.schema";

// ============================================================
// DUE FIRST RESPONSE
// ============================================================
// Tempo entro cui un ticket deve ricevere un primo riscontro (passaggio
// da OPEN/ASSIGNED a IN_PROGRESS), calcolato dalla data di creazione.

const FIRST_RESPONSE_BUSINESS_DAYS_BY_PRIORITY: Record<TicketPriority, number> = {
  URGENT: 3,
  HIGH: 5,
  MEDIUM: 7,
  LOW: 10,
};

export function computeDueDate(priority: TicketPriority, from: Date = new Date()): Date {
  const days = FIRST_RESPONSE_BUSINESS_DAYS_BY_PRIORITY[priority];
  return addBusinessDays(from, days);
}

// ============================================================
// DUE WORK DATE
// ============================================================
// Tempo di lavorazione effettiva una volta che il ticket è IN_PROGRESS,
// calcolato dalla dueFirstResponse (o da createdAt come fallback se manca).
// Tabella separata da quella sopra: le due fasi hanno SLA concettualmente
// diversi e potrebbero divergere in futuro anche se oggi partono uguali.

const WORK_BUSINESS_DAYS_BY_PRIORITY: Record<TicketPriority, number> = {
  URGENT: 3,
  HIGH: 5,
  MEDIUM: 7,
  LOW: 10,
};

export function computeDueWorkDate(priority: TicketPriority, from: Date): Date {
  const days = WORK_BUSINESS_DAYS_BY_PRIORITY[priority];
  return addBusinessDays(from, days);
}