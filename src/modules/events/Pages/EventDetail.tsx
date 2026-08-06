import {
  IoCalendarClearOutline,
  IoImageOutline,
  IoInformationCircleOutline,
} from "react-icons/io5";

export default function EventDetail() {
  const category = "Deportivo";
  const title = "Maratón Anual de la Ciudad 2023";
  const description =
    "Únase a nosotros para una jornada deportiva única. El Maratón Anual de la Ciudad 2023 recorre las avenidas históricas del centro, reuniendo a corredores locales e internacionales en una fiesta del deporte y la convivencia vecinal.";
  const creationDate = "2 Sep, 2023";
  const eventDate = "15 Oct, 2023";

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl">
        <div className="flex h-80 items-center justify-center bg-tertiary-200">
          <IoImageOutline className="h-10 w-10 text-tertiary-500" />
        </div>

        <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white p-5 shadow-md">
          <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 font-label text-xs text-primary-700">
            {category}
          </span>

          <h1 className="mt-3 font-headline text-headline">{title}</h1>
        </div>
      </div>

      <div className="mt-6 flex gap-6">
        <div className="flex-2 rounded-2xl bg-white p-6">
          <div className="flex items-center gap-2">
            <IoInformationCircleOutline className="h-5 w-5 text-primary" />
            <h2 className="font-headline text-headline">Sobre el Evento</h2>
          </div>

          <p className="mt-4 font-body text-body">{description}</p>
        </div>

        <div className="flex w-72 shrink-0 flex-col gap-3">
          <div className="flex items-center gap-3 rounded-xl bg-tertiary-100 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              <IoCalendarClearOutline className="h-5 w-5" />
            </span>
            <div>
              <p className="font-body text-xs text-secondary-500">
                Fecha de creación
              </p>
              <p className="font-label text-label">{creationDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-tertiary-100 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tertiary-300 text-secondary-600">
              <IoCalendarClearOutline className="h-5 w-5" />
            </span>
            <div>
              <p className="font-body text-xs text-secondary-500">
                Fecha del evento
              </p>
              <p className="font-label text-label">{eventDate}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}