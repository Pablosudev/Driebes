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
import { formatNewsWhatsApp } from "../utils/formatNewsWhatsApp";
import WhatsAppNoticeModal from "../../../shared/components/WhatsAppNoticeModal";
import {
  getNewsByIdThunk,
  updateNewsThunk,
  deleteNewsThunk,
} from "../Features/newsThunks";
import { clearNewsId } from "../Features/newsSlice";
import PublicationFormModal from "../../../shared/components/PublicationFormModal";
import type { PublicationFormValues } from "../../../shared/components/PublicationFormModal";

export default function NewDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const newsItem = useAppSelector((state) => state.newsSlice.newsById);
  const getStatus = useAppSelector(
    (state) => state.newsSlice.getNewsByIdStatus,
  );
  const getError = useAppSelector((state) => state.newsSlice.getNewsByIdError);
  const updateStatus = useAppSelector(
    (state) => state.newsSlice.updateNewsStatus,
  );
  const deleteStatus = useAppSelector(
    (state) => state.newsSlice.deleteNewsStatus,
  );
  const deleteError = useAppSelector(
    (state) => state.newsSlice.deleteNewsError,
  );

  const [isEditing, setIsEditing] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!id) return;
    dispatch(getNewsByIdThunk(Number(id)));
    return () => {
      dispatch(clearNewsId());
    };
  }, [dispatch, id]);

  /*
   * La foto se descarga al cargar la noticia y no al pulsar el boton: Safari
   * invalida el gesto del usuario si se hace un await antes de compartir, y el
   * panel no llegaria a abrirse.
   */
  useEffect(() => {
    if (!newsItem?.image || !canAttachFiles()) return;

    let cancelled = false;
    urlToFile(mediaUrl(newsItem.image)).then((file) => {
      if (!cancelled) setImageFile(file);
    });

    return () => {
      cancelled = true;
    };
  }, [newsItem?.image]);

  async function handleUpdate(form: PublicationFormValues) {
    if (!newsItem) return;

    const result = await dispatch(
      updateNewsThunk({
        id: newsItem.id,
        newFormInput: {
          title: form.title,
          description: form.description,
          image: form.image,
        },
      }),
    );
    if (updateNewsThunk.fulfilled.match(result)) setIsEditing(false);
  }

  async function handleDelete() {
    if (!newsItem) return;
    const result = await dispatch(deleteNewsThunk(newsItem.id));
    if (deleteNewsThunk.fulfilled.match(result)) navigate("/noticias");
  }

  function handleShareWhatsApp() {
    if (!newsItem) return;

    // El aviso solo aplica si hay foto y este equipo no puede adjuntarla.
    if (newsItem.image && !canAttachFiles()) {
      setShowNotice(true);
      return;
    }
    void share();
  }

  async function share() {
    if (!newsItem) return;

    setShowNotice(false);
    await shareOnWhatsApp(
      formatNewsWhatsApp(newsItem, { includeImageUrl: !imageFile }),
      imageFile,
    );
  }

  if (getStatus === "pending") {
    return (
      <p className="font-body text-body text-secondary-500">
        Cargando noticia...
      </p>
    );
  }

  if (getStatus === "rejected") {
    return (
      <p className="font-body text-body text-secondary-700">
        {getError ?? "No se ha podido cargar la noticia."}
      </p>
    );
  }

  if (!newsItem) return null;

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl">
        <div className="flex h-80 items-center justify-center bg-tertiary-200">
          {newsItem.image ? (
            <img
              src={mediaUrl(newsItem.image)}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <IoImageOutline className="h-10 w-10 text-tertiary-500" />
          )}
        </div>

        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 rounded-2xl bg-white p-5 shadow-md">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 font-label text-xs text-primary-700">
              <IoCalendarClearOutline className="h-3.5 w-3.5" />
              {shortDateLabel(newsItem.uploadDate)}
            </span>

            <h1 className="mt-3 font-headline text-headline">
              {newsItem.title}
            </h1>
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
              aria-label="Editar noticia"
              className="rounded-md p-2 text-secondary-400 transition-colors hover:bg-tertiary-100 hover:text-secondary-600"
            >
              <IoPencilOutline className="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteStatus === "pending"}
              aria-label="Eliminar noticia"
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

      <div className="mt-6 rounded-2xl bg-white p-6">
        <div className="flex items-center gap-2">
          <IoInformationCircleOutline className="h-5 w-5 text-primary" />
          <h2 className="font-headline text-headline">Sobre la Noticia</h2>
        </div>

        <p className="mt-4 font-body text-body">{newsItem.description}</p>
      </div>

      {showNotice && (
        <WhatsAppNoticeModal
          onConfirm={share}
          onClose={() => setShowNotice(false)}
        />
      )}

      {isEditing && (
        <PublicationFormModal
          type="news"
          mode="edit"
          initialValues={{
            title: newsItem.title,
            description: newsItem.description,
          }}
          submitting={updateStatus === "pending"}
          onSubmit={handleUpdate}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  );
}
