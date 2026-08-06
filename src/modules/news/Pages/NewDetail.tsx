import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  IoCalendarClearOutline,
  IoImageOutline,
  IoInformationCircleOutline,
  IoPencilOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
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

  useEffect(() => {
    if (!id) return;
    dispatch(getNewsByIdThunk(Number(id)));
    return () => {
      dispatch(clearNewsId());
    };
  }, [dispatch, id]);

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
              src={newsItem.image}
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
              {newsItem.uploadDate}
            </span>

            <h1 className="mt-3 font-headline text-headline">
              {newsItem.title}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
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
