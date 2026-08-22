import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { GrHomeRounded } from "react-icons/gr";
import { IoCalendarClearOutline } from "react-icons/io5";
import { MdOutlineWorkOutline } from "react-icons/md";
import { ImCalendar } from "react-icons/im";
import { TbNews } from "react-icons/tb";

const ICON_CLASS = "h-5 w-5 shrink-0";

const sections: { to: string; label: string; icon: ReactNode }[] = [
  {
    to: "/",
    label: "Inicio",
    icon: <GrHomeRounded className={ICON_CLASS} />,
  },
  {
    to: "/noticias",
    label: "Noticias",
    icon: <TbNews className={ICON_CLASS} />,
  },
  {
    to: "/eventos",
    label: "Eventos",
    icon: <IoCalendarClearOutline className={ICON_CLASS} />,
  },
  {
    to: "/ofertas",
    label: "Trabajos",
    icon: <MdOutlineWorkOutline className={ICON_CLASS} />,
  },
  {
    to: "/reservas",
    label: "Reservas",
    icon: <ImCalendar className={ICON_CLASS} />,
  },
];

export default function MenuSide() {
  return (
    <nav
      className="flex h-full flex-col gap-5 border-b border-tertiary-200 bg-white px-3.5 py-5 md:border-r md:border-b-0"    >
      <div className="flex items-center gap-2 px-1.5">
        <img
          src="/Logo.png"
          alt=""
          className="h-9 w-9 rounded-lg object-contain"
        />
        <span className="font-headline text-[0.9375rem] font-bold">
          Gestión Municipal
        </span>
      </div>

      <ul className="flex list-none flex-col gap-0.5 p-0">
        {sections.map((section) => (
          <li key={section.to}>
            <NavLink
              to={section.to}
              end={section.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-label text-label transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-neutral-700 hover:bg-tertiary-100"
                }`
              }
            >
              {section.icon}
              {section.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
