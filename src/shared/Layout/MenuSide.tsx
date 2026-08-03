import { NavLink } from "react-router-dom";

const sections = [
  { to: "/news", label: "Noticias" },
  { to: "/events", label: "Eventos" },
  { to: "/bookings", label: "Reservas" },
  { to: "/jobs", label: "Empleo" },
];

const baseLink =
  "block rounded-md px-3 py-2 text-sm transition focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-600";

const inactiveLink =
  "font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100";

const activeLink =
  "font-semibold bg-brand-50 text-brand-700 dark:bg-slate-700 dark:text-brand-300";

export default function MenuSide() {
  return (
    <nav
      className="border-b border-slate-200 bg-white px-3.5 py-5 md:border-r md:border-b-0 dark:border-slate-700 dark:bg-slate-800"
      aria-label="Secciones del dashboard"
    >
      <ul className="flex list-none flex-row flex-wrap gap-0.5 p-0 md:flex-col">
        {sections.map((section) => (
          <li key={section.to}>
            {/* NavLink resuelve el estado activo por nosotros. */}
            <NavLink
              to={section.to}
              className={({ isActive }) =>
                `${baseLink} ${isActive ? activeLink : inactiveLink}`
              }
            >
              {section.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
