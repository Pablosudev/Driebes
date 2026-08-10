import type {
  AllBookings,
  BookingState,
} from "../Interfaces/bookingsInterface";
import { toDay, todayKey } from "../../../shared/dates";

/**
 * Estados que ocupan el calendario, los mismos que bloquean fechas en la API
 * (BLOCKING_STATES en availability.ts). 'free' es un estado calculado para los
 * dias sin reserva, no llega nunca en el listado.
 */
const ACTIVE_STATES: BookingState[] = ["pending", "reserved"];

/**
 * Reservas vivas: pendientes o confirmadas que aun no han terminado.
 *
 * Una reserva que acaba hoy sigue contando (se ocupa el dia entero); solo deja
 * de estar activa a partir del dia siguiente a su fecha de salida.
 */
export const activeBookings = (
  bookings: AllBookings,
  today: string = todayKey(),
): AllBookings =>
  bookings.filter(
    (booking) =>
      ACTIVE_STATES.includes(booking.state) && toDay(booking.endDate) >= today,
  );
