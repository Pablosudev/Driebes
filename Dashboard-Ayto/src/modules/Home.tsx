import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Weather from "../shared/weather";
import { IoCalendarClearOutline } from "react-icons/io5";
import { MdOutlineWorkOutline } from "react-icons/md";
import { ImCalendar } from "react-icons/im";
import type { IconType } from "react-icons";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getEventsThunk } from "./events/Features/eventsThunks";
import { eventsInMonth } from "./events/Features/eventsSelectors";
import { getJobsThunk } from "./jobs/Features/jobsThunks";
import { getAllBookingsThunk } from "./bookings/Features/bookingsThunks";
import { activeBookings } from "./bookings/Features/bookingsSelectors";
import {
  buildReminders,
  REMINDER_WINDOW_DAYS,
  type Reminder,
  type ReminderKind,
} from "../shared/reminders";
import type { RequestStatus } from "../shared/types";

/** Lo que se pinta en el hueco del contador segun el estado de la peticion. */
function statValue(status: RequestStatus, count: number): string {
  if (status === "rejected") return "—";
  if (status === "idle" || status === "pending") return "…";
  return String(count);
}

const REMINDER_STYLES: Record<
  ReminderKind,
  { Icon: IconType; badge: string; to: string }
> = {
  event: {
    Icon: IoCalendarClearOutline,
    badge: "bg-primary text-white",
    to: "/eventos",
  },
  booking: {
    Icon: ImCalendar,
    badge: "bg-tertiary-300 text-neutral",
    to: "/reservas",
  },
};

function ReminderRow({ item }: { item: Reminder }) {
  const { Icon, badge, to } = REMINDER_STYLES[item.kind];

  return (
    <li className="flex items-start gap-3.5 py-3">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${badge}`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <Link
          to={to}
          className="font-label text-label text-neutral hover:text-primary"
        >
          {item.title}
        </Link>
        <p className="font-body text-xs text-secondary-500">{item.detail}</p>
      </div>
      {item.pending && (
        <span className="rounded-full bg-secondary-500 px-2 py-0.5 font-body text-xs whitespace-nowrap text-white">
          Sin confirmar
        </span>
      )}
      <span className="font-body text-xs whitespace-nowrap text-secondary-500">
        {item.hour}
      </span>
    </li>
  );
}

export default function Home() {
  const dispatch = useAppDispatch();
  const events = useAppSelector((state) => state.eventsSlice.events);
  const eventsStatus = useAppSelector(
    (state) => state.eventsSlice.getEventsStatus,
  );
  const jobs = useAppSelector((state) => state.jobsSlice.jobs);
  const jobsStatus = useAppSelector((state) => state.jobsSlice.getJobsStatus);
  const bookings = useAppSelector((state) => state.bookingsSlice.bookings);
  const bookingsStatus = useAppSelector(
    (state) => state.bookingsSlice.getAllBookingsStatus,
  );

  useEffect(() => {
    dispatch(getEventsThunk());
    dispatch(getJobsThunk());
    dispatch(getAllBookingsThunk());
  }, [dispatch]);

  const eventsThisMonth = useMemo(() => eventsInMonth(events).length, [events]);
  const bookingsActive = useMemo(
    () => activeBookings(bookings).length,
    [bookings],
  );

  const { groups, pendingLater } = useMemo(
    () => buildReminders({ events, bookings }),
    [events, bookings],
  );
  const cargando =
    eventsStatus === "pending" || bookingsStatus === "pending";

  const stats = [
    {
      label: "Eventos",
      description: "Actividades programadas este mes",
      value: statValue(eventsStatus, eventsThisMonth),
      Icon: IoCalendarClearOutline,
      bg: "bg-primary",
      text: "text-white",
      muted: "text-white/80",
      badge: "bg-white/20",
      navigate: "/eventos",
    },
    {
      label: "Trabajos",
      description: "Ofertas de empleo activas",
      value: statValue(jobsStatus, jobs.length),
      Icon: MdOutlineWorkOutline,
      bg: "bg-secondary",
      text: "text-white",
      muted: "text-white/80",
      badge: "bg-white/20",
      navigate: "/ofertas",
    },
    {
      label: "Reservas",
      description: "Reservas activas del refugio municipal",
      value: statValue(bookingsStatus, bookingsActive),
      Icon: ImCalendar,
      bg: "bg-tertiary",
      text: "text-neutral",
      muted: "text-secondary-500",
      badge: "bg-white/70",
      navigate: "/reservas",
    },
  ];

  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-headline text-headline mb-1">
            Buenos días, Pablo
          </h1>
          <p className="font-body text-body text-secondary-500">
            Aquí tienes el estado actual del municipio.
          </p>
        </div>
        <Weather />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.navigate}
            aria-label={`Ver ${stat.label}`}
            className={`flex flex-col gap-4 rounded-2xl p-5 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral ${stat.bg}`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.badge} ${stat.text}`}
              >
                <stat.Icon className="h-4 w-4" />
              </span>
              <span className={`font-headline text-headline ${stat.text}`}>
                {stat.value}
              </span>
            </div>
            <div>
              <h2 className={`font-label text-label ${stat.text}`}>
                {stat.label}
              </h2>
              <p className={`font-body text-xs ${stat.muted}`}>
                {stat.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-white p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-headline text-headline">Recordatorios</h2>
          <p className="font-body text-xs text-secondary-500">
            Próximos {REMINDER_WINDOW_DAYS} días
          </p>
        </div>

        {cargando ? (
          <p className="mt-4 font-body text-body text-secondary-500">
            Cargando…
          </p>
        ) : groups.length === 0 && pendingLater.length === 0 ? (
          <p className="mt-4 font-body text-body text-secondary-500">
            No hay nada previsto para los próximos {REMINDER_WINDOW_DAYS} días.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-5">
            {groups.map((group) => (
              <section key={group.day}>
                <h3 className="font-label text-label text-secondary-600">
                  {group.label}
                </h3>
                <ul className="mt-1 flex flex-col divide-y divide-tertiary-200">
                  {group.items.map((item) => (
                    <ReminderRow key={item.key} item={item} />
                  ))}
                </ul>
              </section>
            ))}

            {pendingLater.length > 0 && (
              <section>
                <h3 className="font-label text-label text-secondary-600">
                  Pendientes de confirmar más adelante
                </h3>
                <ul className="mt-1 flex flex-col divide-y divide-tertiary-200">
                  {pendingLater.map((item) => (
                    <ReminderRow key={item.key} item={item} />
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </>
  );
}
