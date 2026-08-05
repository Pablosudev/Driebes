import { FaChevronDown } from "react-icons/fa";
import { MdAdd } from "react-icons/md";
import PublicationCard from "../../../shared/components/PublicationCard";

export default function Bookings() {
  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-headline text-headline mb-1">
            Calendario de Reservas
          </h1>
          <p className="font-body text-body text-secondary-500">
            Refugio Municipal - Agosto 2026
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-tertiary-300 bg-white px-4 py-2 font-label text-label text-secondary-600 transition-colors hover:bg-tertiary-100">
            <FaChevronDown className="h-3.5 w-3.5 shrink-0" />
            Filtrar
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-label text-label text-white transition-colors hover:bg-primary-600">
            <MdAdd className="h-4 w-4 shrink-0" />
            Nuevo Evento
          </button>
        </div>
      </div>

      <div className="mt-6">
        <PublicationCard
          image={null}
          status="PUBLICADO"
          date="15 Oct, 2023"
          title="Maratón Anual de la Ciudad 2023"
          description="Evento deportivo principal recorriendo las avenidas históricas del centro de la ciudad."
          location="Plaza Mayor"
        />
      </div>
    </>
  );
}
