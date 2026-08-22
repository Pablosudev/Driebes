import { useEffect, useState } from "react";
import { CiCalendar } from "react-icons/ci";
import { IoImageOutline } from "react-icons/io5";

type EventCategory = "Deportivo" | "Festivo" | "Religioso" | "Otro";

interface EventItem {
  id: number;
  title: string;
  description: string;
  image: string | null;
  creationDate: string;
  eventDate: string;
  category: EventCategory;
}

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(
  /\/+$/,
  "",
);

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function formatEventDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Fecha por confirmar"
    : dateFormatter.format(date);
}

function mediaUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL}/${path.replace(/^\/+/, "")}`;
}

function EventCard({ event }: { event: EventItem }) {
  return (
    <article className="tourism-panel mx-auto flex h-full w-full max-w-[18rem] flex-col overflow-hidden rounded-[1.75rem] border border-white/70 shadow-[0_20px_50px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_65px_rgba(120,53,15,0.14)]">
      <div className="relative flex h-48 shrink-0 items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#fffaf3,#ead7bd)]">
        {event.image ? (
          <img
            src={mediaUrl(event.image)}
            alt={`Cartel de ${event.title}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <IoImageOutline
            className="h-14 w-14 text-amber-700/60"
            aria-label="Evento sin imagen"
          />
        )}
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-amber-800 shadow-sm backdrop-blur-sm">
          {event.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6 text-left">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
          <CiCalendar className="h-4 w-4" aria-hidden="true" />
          <time dateTime={event.eventDate}>
            {formatEventDate(event.eventDate)}
          </time>
        </p>
        <h3 className="tourism-display text-2xl leading-tight text-stone-900">
          {event.title}
        </h3>
        <p className="whitespace-pre-line text-sm leading-7 text-stone-700">
          {event.description}
        </p>
      </div>
    </article>
  );
}

export default function Eventos() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvents() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/events`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`La API respondió con el estado ${response.status}`);
        }

        const data: unknown = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("La respuesta de eventos no es un listado");
        }

        const orderedEvents = [...(data as EventItem[])].sort(
          (first, second) =>
            Date.parse(first.eventDate) - Date.parse(second.eventDate),
        );
        setEvents(orderedEvents);
      } catch {
        if (!controller.signal.aborted) {
          setError(
            "No se han podido cargar los eventos. Inténtalo de nuevo en unos instantes.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadEvents();
    return () => controller.abort();
  }, [reload]);

  return (
    <div className="tourism-page overflow-hidden bg-[#f6efe5] text-slate-900">
      <section
        className="relative min-h-[68vh] overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: 'url("/img/grafitiDriebes.jpg")',
          backgroundPosition: "center center",
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(17,24,39,0.84),rgba(17,24,39,0.5),rgba(180,83,9,0.24))]" />
        <div className="absolute -left-16 top-16 h-44 w-44 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute bottom-8 right-0 h-56 w-56 rounded-full bg-orange-900/20 blur-3xl" />

        <div className="relative mx-auto flex min-h-[68vh] max-w-6xl items-center px-6 py-12 sm:px-8 lg:px-10">
          <div className="tourism-glass max-w-3xl rounded-[1.75rem] p-6 text-left text-white shadow-[0_24px_65px_rgba(15,23,42,0.32)] sm:p-8 lg:p-10">
            <p className="tourism-kicker mb-3 text-xs uppercase tracking-[0.3em] text-amber-200">
              Ayuntamiento de Driebes
            </p>
            <h1 className="tourism-display text-4xl leading-none sm:text-5xl lg:text-6xl">
              Eventos y Fiestas
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-stone-100 sm:text-base">
              Tradiciones que nos unen y celebran nuestra identidad como
              comunidad. Descubre los próximos eventos.
            </p>

            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-sm">
                <p className="text-lg font-semibold text-white">Tradición</p>
                <p className="mt-1 text-xs text-stone-200">
                  Celebraciones con identidad
                </p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-sm">
                <p className="text-lg font-semibold text-white">Comunidad</p>
                <p className="mt-1 text-xs text-stone-200">
                  Encuentros para compartir
                </p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-sm">
                <p className="text-lg font-semibold text-white">Agenda local</p>
                <p className="mt-1 text-xs text-stone-200">
                  Próximas citas del municipio
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8 lg:px-10 lg:py-14">
        <div className="mb-8 max-w-2xl text-left">
          <p className="tourism-kicker text-xs uppercase tracking-[0.28em] text-amber-700">
            Agenda municipal
          </p>
          <h2 className="tourism-display mt-3 text-3xl text-stone-900 sm:text-4xl">
            Eventos de Driebes
          </h2>
        </div>

        {isLoading && (
          <div
            className="tourism-panel rounded-[1.5rem] border border-white/70 px-5 py-12 text-center shadow-[0_18px_45px_rgba(15,23,42,0.07)]"
            role="status"
          >
            <p className="text-lg text-stone-700">
              Cargando eventos...
            </p>
          </div>
        )}

        {!isLoading && error && (
          <div
            className="tourism-panel mx-auto max-w-xl rounded-[1.5rem] border border-red-200 p-6 text-center shadow-[0_18px_45px_rgba(15,23,42,0.07)]"
            role="alert"
          >
            <p className="text-red-800">{error}</p>
            <button
              type="button"
              onClick={() => setReload((value) => value + 1)}
              className="mt-4 rounded-full border border-amber-600 bg-amber-600 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-stone-950 transition hover:-translate-y-0.5 hover:bg-amber-500"
            >
              Reintentar
            </button>
          </div>
        )}

        {!isLoading && !error && events.length === 0 && (
          <div className="tourism-panel rounded-[1.5rem] border border-white/70 px-5 py-12 text-center shadow-[0_18px_45px_rgba(15,23,42,0.07)]">
            <p className="text-lg text-stone-700">
              No hay eventos publicados en este momento.
            </p>
          </div>
        )}

        {!isLoading && !error && events.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
