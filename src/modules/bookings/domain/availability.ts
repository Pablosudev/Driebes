import type { BookingInterface, BookingState } from './booking.interface';

// Estados que ocupan el calendario. 'free' es un estado calculado, no se persiste.
const BLOCKING_STATES: BookingState[] = ['pending', 'reserved'];

// La reserva es por día completo: nos quedamos con el día (YYYY-MM-DD).
// Las cadenas 'YYYY-MM-DD' se comparan cronológicamente de forma lexicográfica.
const toDay = (dateTime: string): string => dateTime.slice(0, 10);

// Dos rangos [aStart, aEnd] y [bStart, bEnd] entran en conflicto si comparten
// al menos un día (comparación inclusiva, porque se ocupa el día completo).
export function rangesConflict(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return toDay(aStart) <= toDay(bEnd) && toDay(bStart) <= toDay(aEnd);
}

// Reservas activas (pending/reserved) que solapan el rango indicado.
export function findConflicts(
  bookings: BookingInterface[],
  startDate: string,
  endDate: string,
): BookingInterface[] {
  return bookings.filter(
    (booking) =>
      BLOCKING_STATES.includes(booking.state) &&
      rangesConflict(startDate, endDate, booking.startDate, booking.endDate),
  );
}
