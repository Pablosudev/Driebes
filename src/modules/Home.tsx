import Weather from "../shared/weather";
import {
  IoCalendarClearOutline,
  IoCheckmarkCircleOutline,
  IoMegaphoneOutline,
  IoWaterOutline,
} from "react-icons/io5";
import { MdOutlineWorkOutline } from "react-icons/md";
import { ImCalendar } from "react-icons/im";

const stats = [
  {
    label: "Eventos",
    description: "Actividades programadas este mes",
    count: 12,
    Icon: IoCalendarClearOutline,
    bg: "bg-primary",
    text: "text-white",
    muted: "text-white/80",
    badge: "bg-white/20",
  },
  {
    label: "Trabajos",
    description: "Ofertas de trabajo publicadas",
    count: 5,
    Icon: MdOutlineWorkOutline,
    bg: "bg-secondary",
    text: "text-white",
    muted: "text-white/80",
    badge: "bg-white/20",
  },
  {
    label: "Reservas",
    description: "Refugio municipal",
    count: 28,
    Icon: ImCalendar,
    bg: "bg-tertiary",
    text: "text-neutral",
    muted: "text-secondary-500",
    badge: "bg-white/70",
  },
];

const activity = [
  {
    title: "Nuevo bando municipal publicado",
    description: "Corte de calle Mayor por obras de asfaltado el próximo",
    time: "Hace 2h",
    Icon: IoMegaphoneOutline,
    badge: "bg-tertiary-200 text-secondary-600",
  },
  {
    title: "Avería reportada: Fuga de agua",
    description: "Sector Norte, Plaza del Sol. Brigada en camino.",
    time: "Hace 4h",
    Icon: IoWaterOutline,
    badge: "bg-secondary-500 text-white",
  },
  {
    title: "Reserva aprobada",
    description: "Pabellón Polideportivo Central. Club de Baloncesto.",
    time: "Hace 5h",
    Icon: IoCheckmarkCircleOutline,
    badge: "bg-primary text-white",
  },
];

export default function Home() {
  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-headline text-headline mb-1">Buenos días, Pablo</h1>
          <p className="font-body text-body text-secondary-500">
            Aquí tienes el estado actual del municipio.
          </p>
        </div>
        <Weather />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`flex flex-col gap-4 rounded-2xl p-5 ${stat.bg}`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.badge} ${stat.text}`}
              >
                <stat.Icon className="h-4 w-4" />
              </span>
              <span className={`font-headline text-headline ${stat.text}`}>
                {stat.count}
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
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-headline">Actividad Reciente</h2>
        </div>

        <ul className="mt-4 flex flex-col">
          {activity.map((item, index) => (
            <li
              key={item.title}
              className={`flex items-start gap-3.5 py-4 ${
                index < activity.length - 1 ? "border-b border-tertiary-200" : ""
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.badge}`}
              >
                <item.Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-label text-label text-neutral">
                  {item.title}
                </p>
                <p className="font-body text-xs text-secondary-500">
                  {item.description}
                </p>
              </div>
              <span className="font-body text-xs whitespace-nowrap text-secondary-500">
                {item.time}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}