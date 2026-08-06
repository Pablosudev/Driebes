import {
  IoBusinessOutline,
  IoCalendarClearOutline,
  IoCallOutline,
  IoImageOutline,
  IoInformationCircleOutline,
} from "react-icons/io5";

export default function JobDetail() {
  const description =
    "Buscamos un/a desarrollador/a Frontend para incorporarse al equipo de Transformación Digital del Ayuntamiento. La persona seleccionada participará en el diseño y desarrollo de nuevas herramientas para la ciudadanía.";
  const requirements =
    "Se requiere experiencia previa con React y TypeScript, conocimientos de control de versiones con Git y capacidad para trabajar en equipo. Se valorará experiencia en el sector público.";
  const companyName = "Ayuntamiento de la Ciudad";
  const phone = "912 345 678";
  const email = "empleo@ayuntamiento.es";
  const createDate = "10 Ago, 2024";

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl">
        <div className="flex h-80 items-center justify-center bg-tertiary-200">
          <IoImageOutline className="h-10 w-10 text-tertiary-500" />
        </div>

        <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white p-5 shadow-md">
          <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 font-label text-xs text-primary-700">
            Tecnología
          </span>

          <h1 className="mt-3 font-headline text-headline">
            Desarrollador/a Frontend Municipal
          </h1>
        </div>
      </div>

      <div className="mt-6 flex gap-6">
        <div className="flex-2 rounded-2xl bg-white p-6">
          <div className="flex items-center gap-2">
            <IoInformationCircleOutline className="h-5 w-5 text-primary" />
            <h2 className="font-headline text-headline">Sobre la Oferta</h2>
          </div>

          <p className="mt-4 font-body text-body">{description}</p>

          <p className="mt-4 font-body text-body text-secondary-400">
            {requirements}
          </p>
        </div>

        <div className="flex w-72 shrink-0 flex-col gap-3">
          <div className="flex items-center gap-3 rounded-xl bg-tertiary-100 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              <IoBusinessOutline className="h-5 w-5" />
            </span>
            <div>
              <p className="font-body text-xs text-secondary-500">Empresa</p>
              <p className="font-label text-label">{companyName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-tertiary-100 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tertiary-300 text-secondary-600">
              <IoCallOutline className="h-5 w-5" />
            </span>
            <div>
              <p className="font-body text-xs text-secondary-500">Contacto</p>
              <p className="font-label text-label">{phone ?? email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-tertiary-100 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tertiary-300 text-secondary-600">
              <IoCalendarClearOutline className="h-5 w-5" />
            </span>
            <div>
              <p className="font-body text-xs text-secondary-500">
                Fecha de creación
              </p>
              <p className="font-label text-label">{createDate}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
