import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventInput } from "@fullcalendar/core";
import esLocale from "@fullcalendar/core/locales/es";
import type { AllBookings } from "../../modules/bookings/Interfaces/bookingsInterface";
import BookingModal from "./BookingModal";

/* Los tres estados que devuelve la API (enum BookingState: free | pending |
   reserved). Cada uno pinta la pastilla del calendario con un color de la
   paleta, para leer el estado de la reserva de un vistazo. */
const STATE_STYLES: Record<string, { bg: string; border: string; text: string }> =
  {
    reserved: {
      bg: "var(--color-primary)",
      border: "var(--color-primary)",
      text: "#ffffff",
    },
    pending: {
      bg: "var(--color-secondary-500)",
      border: "var(--color-secondary-500)",
      text: "#ffffff",
    },
    free: {
      bg: "var(--color-tertiary-200)",
      border: "var(--color-tertiary-300)",
      text: "var(--color-secondary-500)",
    },
  };

interface BookingCalendarProps {
  bookings: AllBookings;
}

export default function BookingCalendar({ bookings }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  /* FullCalendar trata `end` como exclusivo: una reserva que termina el dia 10
     debe declararse hasta el 11 para que el dia 10 quede pintado. */
  const events: EventInput[] = bookings.map((booking) => {
    const style = STATE_STYLES[booking.status] ?? STATE_STYLES.free;

    return {
      id: String(booking.id),
      title: booking.name,
      start: booking.startDate,
      end: booking.endDate,
      backgroundColor: style.bg,
      borderColor: style.border,
      textColor: style.text,
      extendedProps: { booking },
    };
  });

  /* Reservas que solapan el dia pulsado: se comparan solo las fechas (sin
     hora) para que una reserva de varios dias aparezca en todos ellos. */
  const bookingsForSelectedDate = selectedDate
    ? bookings.filter((booking) => {
        const start = booking.startDate.slice(0, 10);
        const end = booking.endDate.slice(0, 10);
        return selectedDate >= start && selectedDate <= end;
      })
    : [];

  return (
    <div className="rounded-2xl bg-white p-6">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={esLocale}
        firstDay={1}
        height="auto"
        fixedWeekCount={false}
        dayMaxEvents={3}
        events={events}
        dateClick={(info) => setSelectedDate(info.dateStr)}
        eventClick={(info) => {
          info.jsEvent.preventDefault();
          setSelectedDate(info.event.startStr.slice(0, 10));
        }}
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "",
        }}
        buttonText={{ today: "Hoy" }}
      />

      {selectedDate && (
        <BookingModal
          date={selectedDate}
          bookings={bookingsForSelectedDate}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}