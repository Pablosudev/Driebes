import type { AllEventsInterface } from "../modules/events/Interfaces/EventsInterface";
import type { AllBookings } from "../modules/bookings/Interfaces/bookingsInterface";
import { dayLabel, dayRange, toDay, toHour, todayKey } from "./dates";

export const REMINDER_WINDOW_DAYS = 8;

export type ReminderKind = "event" | "booking";

export interface Reminder {
  key: string;
  kind: ReminderKind;
  title: string;
  detail: string;
  hour: string;
  pending: boolean;
}

export interface ReminderGroup {
  day: string;
  label: string;
  items: Reminder[];
}

export interface Reminders {
  groups: ReminderGroup[];
  pendingLater: Reminder[];
}

const eventReminder = (event: AllEventsInterface[number]): Reminder => ({
  key: `event-${event.id}`,
  kind: "event",
  title: event.title,
  detail: event.category ?? "Evento",
  hour: toHour(event.eventDate),
  pending: false,
});

const bookingReminder = (booking: AllBookings[number]): Reminder => ({
  key: `booking-${booking.id}`,
  kind: "booking",
  title: `Reserva de ${booking.name}`,
  detail:
    booking.state === "pending"
      ? `${booking.phone} · Pendiente de confirmar`
      : `${booking.phone} · Confirmada`,
  hour: toHour(booking.startDate),
  pending: booking.state === "pending",
});

const ordenar = (items: Reminder[]): Reminder[] =>
  [...items].sort(
    (a, b) => a.hour.localeCompare(b.hour) || a.key.localeCompare(b.key),
  );

interface ReminderSources {
  events: AllEventsInterface;
  bookings: AllBookings;
}

export function buildReminders(
  { events, bookings }: ReminderSources,
  today: string = todayKey(),
  days: number = REMINDER_WINDOW_DAYS,
): Reminders {
  const ventana = dayRange(today, days);
  const ultimo = ventana[ventana.length - 1];

  const activas = bookings.filter((booking) => booking.state !== "free");

  const groups = ventana
    .map((day) => ({
      day,
      label: dayLabel(day, today),
      items: ordenar([
        ...events.filter((event) => toDay(event.eventDate) === day).map(eventReminder),
        // Una reserva de varios días aparece en cada día que ocupa.
        ...activas
          .filter(
            (booking) =>
              toDay(booking.startDate) <= day && day <= toDay(booking.endDate),
          )
          .map(bookingReminder),
      ]),
    }))
    .filter((group) => group.items.length > 0);

  const pendingLater = activas
    .filter(
      (booking) => booking.state === "pending" && toDay(booking.startDate) > ultimo,
    )
    .map(bookingReminder)
    .sort((a, b) => a.key.localeCompare(b.key));

  return { groups, pendingLater };
}