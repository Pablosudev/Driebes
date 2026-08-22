import type { AllEventsInterface } from "../Interfaces/EventsInterface";

/**
 * Mes de una fecha ISO como "YYYY-MM".
 *
 * Se recorta la cadena en vez de construir un Date: la API devuelve el evento en
 * UTC y convertirlo a hora local movería de mes los eventos del dia 1 o del
 * ultimo dia del mes. Es el mismo criterio que usa el calendario de reservas.
 */
const monthKey = (isoDate: string): string => isoDate.slice(0, 7);

/** El mes en curso, en el mismo formato "YYYY-MM". */
export const currentMonthKey = (today: Date = new Date()): string =>
  `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

/** Eventos programados dentro del mes indicado (por defecto, el mes actual). */
export const eventsInMonth = (
  events: AllEventsInterface,
  month: string = currentMonthKey(),
): AllEventsInterface =>
  events.filter((event) => monthKey(event.eventDate) === month);
