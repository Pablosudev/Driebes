import {
  IoCalendarClearOutline,
  IoImageOutline,
  IoInformationCircleOutline,
} from "react-icons/io5";

export default function NewDetail() {
  const uploadDate = "20 Sep, 2023";
  const title = "El Ayuntamiento inaugura el nuevo parque municipal";
  const description =
    "El nuevo parque municipal abre sus puertas a los vecinos con más de 5.000 metros cuadrados de zonas verdes, áreas infantiles y espacios para el deporte. La obra forma parte del plan de renovación de espacios públicos impulsado este año.";

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl">
        <div className="flex h-80 items-center justify-center bg-tertiary-200">
          <IoImageOutline className="h-10 w-10 text-tertiary-500" />
        </div>

        <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white p-5 shadow-md">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 font-label text-xs text-primary-700">
            <IoCalendarClearOutline className="h-3.5 w-3.5" />
            {uploadDate}
          </span>

          <h1 className="mt-3 font-headline text-headline">{title}</h1>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-6">
        <div className="flex items-center gap-2">
          <IoInformationCircleOutline className="h-5 w-5 text-primary" />
          <h2 className="font-headline text-headline">Sobre la Noticia</h2>
        </div>

        <p className="mt-4 font-body text-body">{description}</p>
      </div>
    </>
  );
}