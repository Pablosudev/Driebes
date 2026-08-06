import { useEffect, useState } from "react";
import { MdAdd } from "react-icons/md";
import PublicationCard from "../../../shared/components/PublicationCard";
import PublicationFormModal from "../../../shared/components/PublicationFormModal";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getJobsThunk } from "../Features/jobsThunks";
export default function Jobs() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dispatch = useAppDispatch();
  const jobs = useAppSelector((state) => state.jobsSlice.jobs);
  const status = useAppSelector((state) => state.jobsSlice.getJobsStatus);
  const error = useAppSelector((state) => state.jobsSlice.getJobsError);

  useEffect(() => {
    dispatch(getJobsThunk());
  }, [dispatch]);

  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-headline text-headline mb-1">
            Ofertas de trabajo
          </h1>
          <p className="font-body text-body text-secondary-500">
            Añade y supervisa ofertas de trabajo para que cualquiera pueda
            consultarlas desde la web del ayuntamiento.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-label text-label text-white transition-colors hover:bg-primary-600"
          >
            <MdAdd className="h-4 w-4 shrink-0" />
            Nueva oferta de empleo
          </button>
        </div>
      </div>

      <div className="mt-6">
        {status === "rejected" && error && (
          <p className="mb-4 font-body text-body text-secondary-700">{error}</p>
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
            onClick={() => navigate(`/ofertas/${1}`)}
          />

          {jobs.map((job) => (
            <PublicationCard
              key={job.id}
              image={null}
              status="PUBLICADO"
              date={job.createDate}
              title={job.title}
              description={job.description}
              onClick={() => navigate(`/ofertas/${job.id}`)}
            />
          ))}
        </div>
      </div>

      {isModalOpen && (
        <PublicationFormModal
          type="job"
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
