import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  IoCalendarClearOutline,
  IoImageOutline,
  IoInformationCircleOutline,
  IoPencilOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { mediaUrl } from "../../../shared/apiFetch";
import { shortDateLabel } from "../../../shared/dates";
import { urlToFile } from "../../../shared/files";
import {
  canAttachFiles,
  shareOnWhatsApp,
} from "../../../services/whatsapp/whatsapp.service";
import { formatEventWhatsApp } from "../utils/formatEventWhatsApp";
import WhatsAppNoticeModal from "../../../shared/components/WhatsAppNoticeModal";
import {
  getEventByIdThunk,
  updateEventThunk,
  deleteEventThunk,
} from "../Features/eventsThunks";
import { clearEventId } from "../Features/eventsSlice";
import PublicationFormModal from "../../../shared/components/PublicationFormModal";
import type { PublicationFormValues } from "../../../shared/components/PublicationFormModal";
import type { Category } from "../Interfaces/EventsInterface";

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const event = useAppSelector((state) => state.eventsSlice.eventById);
  const getStatus = useAppSelector(
    (state) => state.eventsSlice.getEventByIdStatus,
  );
  const getError = useAppSelector(
    (state) => state.eventsSlice.getEventByIdError,
  );
  const updateStatus = useAppSelector(
    (state) => state.eventsSlice.updateEventStatus,
  );
  const deleteStatus = useAppSelector(
    (state) => state.eventsSlice.deleteEventStatus,
  );
  const deleteError = useAppSelector(
    (state) => state.eventsSlice.deleteEventError,
  );

  const [isEditing, setIsEditing] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!id) return;
    dispatch(getEventByIdThunk(Number(id)));
    return () => {
      dispatch(clearEventId());
    };
  }, [dispatch, id]);


  useEffect(() => {
    if (!event?.image || !canAttachFiles()) return;

    let cancelled = false;
    urlToFile(mediaUrl(event.image)).then((file) => {
      if (!cancelled) setImageFile(file);
    });

    return () => {
      cancelled = true;
    };
  }, [event?.image]);

  async function handleUpdate(form: PublicationFormValues) {
    if (!event) return;

    const result = await dispatch(
      updateEventThunk({
        id: event.id,
        eventInput: {
          title: form.title,
          description: form.description,
          eventDate: form.eventDate,
          category: form.category as Category,
          image: form.image,
        },
      }),
    );
    if (updateEventThunk.fulfilled.match(result)) setIsEditing(false);
  }

  async function handleDelete() {
    if (!event) return;
    const result = await dispatch(deleteEventThunk(event.id));
    if (deleteEventThunk.fulfilled.match(result)) navigate("/eventos");
  }

  function handleShareWhatsApp() {
    if (!event) return;

    if (event.image && !canAttachFiles()) {
      setShowNotice(true);
      return;
    }
    void share();
  }

  async function share() {
    if (!event) return;

    setShowNotice(false);
    await shareOnWhatsApp(
      formatEventWhatsApp(event, { includeImageUrl: !imageFile }),
      imageFile,
    );
  }

  if (getStatus === "pending") {
    return (
      <p className="font-body text-body text-secondary-500">
        Cargando evento...
      </p>
    );
  }

  if (getStatus === "rejected") {
    return (
      <p className="font-body text-body text-secondary-700">
        {getError ?? "No se ha podido cargar el evento."}
      </p>
    );
  }

  if (!event) return null;

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl">
        <div className="flex h-80 items-center justify-center bg-tertiary-200">
          {event.image ? (
            <img
              src={mediaUrl(event.image)}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <IoImageOutline className="h-10 w-10 text-tertiary-500" />
          )}
        </div>

        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 rounded-2xl bg-white p-5 shadow-md">
          <div>
            <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 font-label text-xs text-primary-700">
              {event.category}
            </span>

            <h1 className="mt-3 font-headline text-headline">{event.title}</h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="flex items-center gap-2 rounded-lg bg-whatsapp px-4 py-2 font-label text-label text-white transition-colors hover:bg-whatsapp-600"
            >
              <FaWhatsapp className="h-4.5 w-4.5" />
              Compartir por WhatsApp
            </button>

            <button
              type="button"
              onClick={() => setIsEditing(true)}
              aria-label="Editar evento"
              className="rounded-md p-2 text-secondary-400 transition-colors hover:bg-tertiary-100 hover:text-secondary-600"
            >
              <IoPencilOutline className="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteStatus === "pending"}
              aria-label="Eliminar evento"
              className="rounded-md p-2 text-secondary-400 transition-colors hover:bg-tertiary-100 hover:text-secondary-700 disabled:opacity-60"
            >
              <IoTrashOutline className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>

      {deleteStatus === "rejected" && deleteError && (
        <p className="mt-4 font-body text-body text-secondary-700">
          {deleteError}
        </p>
      )}

      <div className="mt-6 flex gap-6">
        <div className="flex-2 rounded-2xl bg-white p-6">
          <div className="flex items-center gap-2">
            <IoInformationCircleOutline className="h-5 w-5 text-primary" />
            <h2 className="font-headline text-headline">Sobre el Evento</h2>
          </div>

          <p className="mt-4 font-body text-body">{event.description}</p>
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
              <p className="font-label text-label">
                {shortDateLabel(event.creationDate)}
              </p>
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
              <p className="font-label text-label">
                {shortDateLabel(event.eventDate)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {showNotice && (
        <WhatsAppNoticeModal
          onConfirm={share}
          onClose={() => setShowNotice(false)}
        />
      )}

      {isEditing && (
        <PublicationFormModal
          type="event"
          mode="edit"
          initialValues={{
            title: event.title,
            description: event.description,
            /* <input type="date"> necesita "YYYY-MM-DD"; la API devuelve ISO. */
            eventDate: event.eventDate.slice(0, 10),
            category: event.category,
          }}
          submitting={updateStatus === "pending"}
          onSubmit={handleUpdate}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  );
}