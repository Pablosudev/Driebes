import { useEffect, useState } from "react";
import { MdAdd } from "react-icons/md";
import PublicationCard from "../../../shared/components/PublicationCard";
import PublicationFormModal from "../../../shared/components/PublicationFormModal";
import type { PublicationFormValues } from "../../../shared/components/PublicationFormModal";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { createJobThunk, getJobsThunk } from "../Features/jobsThunks";
export default function Jobs() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dispatch = useAppDispatch();
  const jobs = useAppSelector((state) => state.jobsSlice.jobs);
  const status = useAppSelector((state) => state.jobsSlice.getJobsStatus);
  const error = useAppSelector((state) => state.jobsSlice.getJobsError);
  const createStatus = useAppSelector(
    (state) => state.jobsSlice.createJobStatus,
  );
  const createError = useAppSelector((state) => state.jobsSlice.createJobError);

  useEffect(() => {
    dispatch(getJobsThunk());
  }, [dispatch]);

  async function handleCreate(form: PublicationFormValues) {
    const result = await dispatch(
      createJobThunk({
        title: form.title,
        description: form.description,
        requirements: form.requirements,
        companyName: form.companyName,
        /* Telefono y email son opcionales: el input vacio viaja como null. */
        phone: form.phone || null,
        email: form.email || null,
      }),
    );
    if (createJobThunk.fulfilled.match(result)) setIsModalOpen(false);
  }

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

        {createStatus === "rejected" && createError && (
          <p className="mb-4 font-body text-body text-secondary-700">
            {createError}
          </p>
        )}

        <div className="flex flex-wrap gap-4">
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
          submitting={createStatus === "pending"}
          onSubmit={handleCreate}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
