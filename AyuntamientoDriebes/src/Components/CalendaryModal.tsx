import { useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import esLocale from "@fullcalendar/core/locales/es";
import { FiX } from "react-icons/fi";
import { LuCalendarCheck2 } from "react-icons/lu";

type CalendaryModalProps = {
  onClose: () => void;
};

export default function CalendaryModal({ onClose }: CalendaryModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocusedElement = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);

      if (previouslyFocusedElement instanceof HTMLElement) {
        previouslyFocusedElement.focus();
      }
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-stone-950/70 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-modal-title"
        aria-describedby="calendar-modal-description"
        className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[1.5rem] border border-white/70 bg-[#fffaf3] text-left text-stone-900 shadow-[0_30px_90px_rgba(15,23,42,0.35)] sm:max-h-[calc(100dvh-3rem)] sm:rounded-[1.75rem]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full text-stone-600 transition hover:bg-stone-200 hover:text-stone-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 sm:right-5 sm:top-5"
          aria-label="Cerrar calendario de disponibilidad"
        >
          <FiX className="h-5 w-5" aria-hidden="true" />
        </button>

        <header className="shrink-0 border-b border-amber-200/70 px-4 py-4 pr-16 sm:px-6 sm:py-5 sm:pr-20 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-xl text-amber-700 sm:h-11 sm:w-11 sm:text-2xl">
              <LuCalendarCheck2 aria-hidden="true" />
            </div>
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-amber-700 sm:text-xs">
                Refugio municipal
              </p>
              <h2
                id="calendar-modal-title"
                className="tourism-display mt-1 text-2xl leading-tight text-stone-900 sm:text-3xl"
              >
                Consulta los días disponibles
              </h2>
            </div>
          </div>
          <p
            id="calendar-modal-description"
            className="mt-3 max-w-3xl text-sm leading-6 text-stone-600 sm:text-base"
          >
            Los días ocupados se mostrarán mediante colores, sin información
            personal de las reservas.
          </p>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-5 lg:px-8">
          <div className="reservation-calendar min-w-0 rounded-2xl border border-amber-200 bg-white/85 p-2 shadow-sm sm:p-4">
            <FullCalendar
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              locale={esLocale}
              firstDay={1}
              headerToolbar={{
                left: "prev,next",
                center: "title",
                right: "today",
              }}
              buttonText={{ today: "Hoy" }}
              titleFormat={{ year: "numeric", month: "long" }}
              dayHeaderFormat={{ weekday: "short" }}
              fixedWeekCount={false}
              showNonCurrentDates
              height="auto"
              expandRows
              eventDisplay="background"
              displayEventTime={false}
              navLinks={false}
              selectable={false}
              editable={false}
              events={[]}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-stone-200 bg-white/70 px-4 py-3 text-xs font-medium text-stone-700 sm:text-sm">
            <span className="font-semibold text-stone-900">Leyenda:</span>
            <span className="inline-flex items-center gap-2">
              <span
                className="h-3.5 w-3.5 rounded-sm bg-amber-400"
                aria-hidden="true"
              />
              Pendiente
            </span>
            <span className="inline-flex items-center gap-2">
              <span
                className="h-3.5 w-3.5 rounded-sm bg-rose-500"
                aria-hidden="true"
              />
              Reservado
            </span>
          </div>
        </div>

        <footer className="shrink-0 border-t border-amber-200/70 px-4 py-3 text-xs leading-5 text-stone-600 sm:px-6 sm:py-4 sm:text-sm lg:px-8">
          La disponibilidad mostrada será informativa. La reserva deberá ser
          confirmada por el Ayuntamiento.
        </footer>
      </section>
    </div>
  );
}
