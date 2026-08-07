import { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { MdAdd } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import PublicationCard from "../../../shared/components/PublicationCard";
import PublicationFormModal from "../../../shared/components/PublicationFormModal";
import type { PublicationFormValues } from "../../../shared/components/PublicationFormModal";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { createEventThunk, getEventsThunk } from "../Features/eventsThunks";
import type { Category } from "../Interfaces/EventsInterface";

export default function Events() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dispatch = useAppDispatch();
  const events = useAppSelector((state) => state.eventsSlice.events);
  const status = useAppSelector((state) => state.eventsSlice.getEventsStatus);
  const error = useAppSelector((state) => state.eventsSlice.getEventsError);
  const createStatus = useAppSelector(
    (state) => state.eventsSlice.createEventStatus,
  );
  const createError = useAppSelector(
    (state) => state.eventsSlice.createEventError,
  );

  useEffect(() => {
    dispatch(getEventsThunk());
  }, [dispatch]);

  async function handleCreate(form: PublicationFormValues) {
    const result = await dispatch(
      createEventThunk({
        title: form.title,
        description: form.description,
        eventDate: form.eventDate,
        category: form.category as Category,
        image: form.image,
      }),
    );
    if (createEventThunk.fulfilled.match(result)) setIsModalOpen(false);
  }

  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-headline text-headline mb-1">
            Eventos Municipales
          </h1>
          <p className="font-body text-body text-secondary-500">
            Gestiona y supervisa todos los eventos del municipio.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-tertiary-300 bg-white px-4 py-2 font-label text-label text-secondary-600 transition-colors hover:bg-tertiary-100">
            <FaChevronDown className="h-3.5 w-3.5 shrink-0" />
            Filtrar
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-label text-label text-white transition-colors hover:bg-primary-600"
          >
            <MdAdd className="h-4 w-4 shrink-0" />
            Nuevo Evento
          </button>
        </div>
      </div>

      <div className="mt-6">
        {status === "rejected" && error && (
          <p className="mb-4 font-body text-body text-secondary-700">{error}</p>
        )}

        {createStatus === "rejected" && createError && (
          <p className="mb-4 font-body text-body text-secondary-700">
            {createError}
          </p>
        )}

        <div className="flex flex-wrap gap-4">
          {/* Tarjeta falseada: se mantiene mientras seguimos maquetando. */}
          <PublicationCard
            image={null}
            status="PUBLICADO"
            date="15 Oct, 2023"
            title="Maratón Anual de la Ciudad 2023"
            description="Evento deportivo principal recorriendo las avenidas históricas del centro de la ciudad."
            location="Plaza Mayor"
            onClick={() => navigate(`/eventos/${1}`)}
          />

          {events.map((event) => (
            <PublicationCard
              key={event.id}
              image={event.image}
              status="PUBLICADO"
              date={event.eventDate}
              title={event.title}
              description={event.description}
              onClick={() => navigate(`/eventos/${event.id}`)}
            />
          ))}
        </div>
      </div>

      {isModalOpen && (
        <PublicationFormModal
          type="event"
          submitting={createStatus === "pending"}
          onSubmit={handleCreate}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
