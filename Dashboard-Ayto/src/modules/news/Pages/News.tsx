import { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { MdAdd } from "react-icons/md";
import PublicationCard from "../../../shared/components/PublicationCard";
import PublicationFormModal from "../../../shared/components/PublicationFormModal";
import type { PublicationFormValues } from "../../../shared/components/PublicationFormModal";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { createNewsThunk, getNewsThunk } from "../Features/newsThunks";



export default function News() {

  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dispatch = useAppDispatch();
  const news = useAppSelector((state) => state.newsSlice.news);
  const status = useAppSelector((state) => state.newsSlice.getAllNewsStatus);
  const error = useAppSelector((state) => state.newsSlice.getAllNewsError);
  const createStatus = useAppSelector(
    (state) => state.newsSlice.createNewsStatus,
  );
  const createError = useAppSelector(
    (state) => state.newsSlice.createNewsError,
  );

  useEffect(() => {
    dispatch(getNewsThunk());
  }, [dispatch]);

  async function handleCreate(form: PublicationFormValues) {
    const result = await dispatch(
      createNewsThunk({
        title: form.title,
        description: form.description,
        image: form.image,
      }),
    );
    if (createNewsThunk.fulfilled.match(result)) setIsModalOpen(false);
  }

  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-headline text-headline mb-1">
            Noticias del municipio.
          </h1>
          <p className="font-body text-body text-secondary-500">
            Gestiona y supervisa todas las actividades y eventos programados en
            el municipio.
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
            Añadir Noticia
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
          {news.map((newsItem) => (
            <PublicationCard
              key={newsItem.id}
              image={newsItem.image}
              status="PUBLICADO"
              date={newsItem.uploadDate}
              title={newsItem.title}
              description={newsItem.description}
              onClick={() => navigate(`/noticias/${newsItem.id}`)}
            />
          ))}
        </div>
      </div>

      {isModalOpen && (
        <PublicationFormModal
          type="news"
          submitting={createStatus === "pending"}
          onSubmit={handleCreate}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
