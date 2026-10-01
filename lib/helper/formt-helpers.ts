import { randomUUID } from "crypto";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

export function fmt(date: Date | string) {
  return new Date(date).toLocaleDateString("it-IT");
}

/**
 * "5 min fa", "3 ore fa": quando serve capire da quanto, non il giorno.
 * fmt va bene per una data in elenco, non per un arrivo appena successo.
 */
export function fmtRelative(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: it });
}

export function formatMonth(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("it-IT", {
    style: "currency",
    currency: "EUR",
  });
}

export function generaChiaveConsegna(): string {
    const anno = new Date().getFullYear();
    const codice = randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
    return `TRK-${anno}-${codice}`;
}

/**
 * Converte una Date "locale" (come la produce il DatePicker, che lavora
 * in timezone locale del browser) in una Date che rappresenta la
 * mezzanotte UTC dello stesso giorno di calendario.
 * Da usare in onChange, prima di salvare nel form.
 */
export function toCalendarUTCDate(date: Date | null): Date | null {
  if (!date) return null;
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

/**
 * Converte una Date salvata come mezzanotte UTC (es. dal backend o da
 * toCalendarUTCDate) in una Date locale con lo stesso giorno di calendario,
 * da mostrare nel DatePicker senza shift visivo.
 */
export function toPickerValue(value: unknown): Date | null {
  if (!value) return null;
  const d = new Date(value as Date | string);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function dayRange(date: Date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { gte: start, lt: end };
}
