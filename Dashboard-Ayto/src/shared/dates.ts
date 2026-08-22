/**
 * Las fechas se comparan como cadenas "YYYY-MM-DD" en vez de con objetos Date:
 * la API devuelve todo en UTC y convertirlo a hora local desplaza de día los
 * eventos y reservas de primera o última hora.
 */
export const toDay = (isoDate: string): string => isoDate.slice(0, 10);

export const toHour = (isoDate: string): string => isoDate.slice(11, 16);

export const dayKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

export const todayKey = (today: Date = new Date()): string => dayKey(today);

/** Los `days` días consecutivos que empiezan en `from` (incluido). */
export function dayRange(from: string, days: number): string[] {
  const start = new Date(`${from}T00:00:00`);
  return Array.from({ length: days }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return dayKey(day);
  });
}

/**
 * Si el dia indicado quedo atras. El mismo dia cuenta como no pasado: un
 * evento de hoy esta en curso, no terminado.
 *
 * Ante una fecha inutilizable devuelve false: es menos dañino no marcar un
 * evento que dar por terminado uno que aun no ha ocurrido.
 */
export function hasPassed(isoDate: string, today: string = todayKey()): boolean {
  if (!isoDate) return false;

  const day = toDay(isoDate);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) && day < today;
}

/** "08/09/2026". Cadena vacia si la fecha no es utilizable. */
export function shortDateLabel(isoDate: string): string {
  if (!isoDate) return "";

  const [year, month, day] = toDay(isoDate).split("-");
  if (!year || !month || !day || Number.isNaN(Number(`${year}${month}${day}`))) {
    return "";
  }

  return `${day}/${month}/${year}`;
}

/**
 * "22 de agosto de 2026". Devuelve cadena vacia si la fecha no es utilizable,
 * porque quien la consume la escribe directamente en mensajes de WhatsApp y un
 * "Invalid Date" ahi no hay quien lo corrija.
 */
export function longDateLabel(isoDate: string): string {
  if (!isoDate) return "";

  const date = new Date(`${toDay(isoDate)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function dayLabel(day: string, today: string = todayKey()): string {
  const [tomorrow] = dayRange(today, 2).slice(1);
  if (day === today) return "Hoy";
  if (day === tomorrow) return "Mañana";

  const texto = new Date(`${day}T00:00:00`).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}