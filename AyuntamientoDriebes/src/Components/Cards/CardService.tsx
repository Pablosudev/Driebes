import { useState } from "react";
import { CgFileDocument } from "react-icons/cg";
import { FaRegTrashCan } from "react-icons/fa6";
import { IoBusOutline } from "react-icons/io5";
import { LuCalendarCheck2 } from "react-icons/lu";
import { MdOutlineMedicalInformation } from "react-icons/md";
import Services from "../../data/services.json";
import CalendaryModal from "../CalendaryModal";

const IconsCard = {
  administracion: <CgFileDocument />,
  residuos: <FaRegTrashCan />,
  medico: <MdOutlineMedicalInformation />,
  transporte: <IoBusOutline />,
  reserva: <LuCalendarCheck2 />,
};

function getAccent(category: string) {
  switch (category) {
    case "residuos":
      return "bg-emerald-100 text-emerald-700";
    case "medico":
      return "bg-sky-100 text-sky-700";
    case "transporte":
      return "bg-stone-200 text-stone-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
}

export default function CardService() {
  const [isReservationOpen, setIsReservationOpen] = useState(false);

  return (
    <>
      <div className="grid gap-4 sm:gap-5 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
        {Services.map((service) => {
          const iconRender =
            IconsCard[service.category as keyof typeof IconsCard] ??
            <CgFileDocument />;
          const accent = getAccent(service.category);

          return (
            <article
              key={service.id}
              className="tourism-panel flex h-full flex-col rounded-[1.5rem] border border-white/70 p-5 text-left shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 sm:rounded-[1.75rem] sm:p-6 md:rounded-[2rem] md:p-7 md:hover:-translate-y-2 md:hover:shadow-[0_28px_80px_rgba(120,53,15,0.16)]"
            >
              <div
                className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-2xl sm:mb-5 sm:h-12 sm:w-12 md:mb-6 md:h-14 md:w-14 md:rounded-2xl md:text-3xl ${accent}`}
              >
                {iconRender}
              </div>

              <div className="min-h-0 md:min-h-[4.5rem]">
                <h3 className="tourism-display text-2xl leading-tight text-stone-900 md:text-3xl">
                  {service.title}
                </h3>
              </div>

              <div className="mt-2 min-h-0 md:mt-0 md:min-h-[5rem]">
                <p className="text-sm leading-6 text-stone-700 sm:text-base sm:leading-7">
                  {service.description}
                </p>
              </div>

              <ul className="mt-3 flex-1 space-y-2 text-sm text-stone-700 sm:mt-4 sm:text-base md:space-y-3">
                {service.servicios.map((servicio, index) => (
                  <li key={index} className="flex items-start gap-2.5 md:gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600 md:h-2 md:w-2" />
                    <span>{servicio}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 border-t border-stone-200/80 pt-4 text-xs leading-6 text-stone-700 sm:text-sm md:mt-6 md:pt-5 md:leading-7">
                <p>
                  <strong className="font-semibold text-stone-900">
                    Contacto:
                  </strong>{" "}
                  {service.contacto}
                </p>
                <p>
                  <strong className="font-semibold text-stone-900">
                    Horario:
                  </strong>{" "}
                  {service.horario}
                </p>
              </div>

              {service.category === "reserva" && service.actionLabel && (
                <button
                  type="button"
                  onClick={() => setIsReservationOpen(true)}
                  className="mt-4 inline-flex items-center justify-center rounded-full border border-amber-600 bg-amber-600 px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.14em] text-stone-950 transition hover:-translate-y-0.5 hover:bg-amber-500 md:mt-5"
                >
                  {service.actionLabel}
                </button>
              )}
            </article>
          );
        })}
      </div>

      {isReservationOpen && (
        <CalendaryModal onClose={() => setIsReservationOpen(false)} />
      )}
    </>
  );
}
