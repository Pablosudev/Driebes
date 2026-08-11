import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  IoBusinessOutline,
  IoCalendarClearOutline,
  IoCallOutline,
  IoImageOutline,
  IoInformationCircleOutline,
  IoPencilOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { FaWhatsapp } from "react-icons/fa";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { shareOnWhatsApp } from "../../../services/whatsapp/whatsapp.service";
import { formatJobWhatsApp } from "../utils/formatJobWhatsApp";
import {
  getJobsByIdThunk,
  updateJobThunk,
  deleteJobsThunk,
} from "../Features/jobsThunks";
import { clearJobId } from "../Features/jobsSlice";
import PublicationFormModal from "../../../shared/components/PublicationFormModal";
import type { PublicationFormValues } from "../../../shared/components/PublicationFormModal";

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const job = useAppSelector((state) => state.jobsSlice.jobById);
  const getStatus = useAppSelector(
    (state) => state.jobsSlice.getJobByIdStatus,
  );
  const getError = useAppSelector((state) => state.jobsSlice.getJobByIdError);
  const updateStatus = useAppSelector(
    (state) => state.jobsSlice.updateJobStatus,
  );
  const deleteStatus = useAppSelector(
    (state) => state.jobsSlice.deleteJobStatus,
  );
  const deleteError = useAppSelector((state) => state.jobsSlice.deleteJobError);

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!id) return;
    dispatch(getJobsByIdThunk(Number(id)));
    return () => {
      dispatch(clearJobId());
    };
  }, [dispatch, id]);

  async function handleUpdate(form: PublicationFormValues) {
    if (!job) return;

    const result = await dispatch(
      updateJobThunk({
        id: job.id,
        jobData: {
          title: form.title,
          description: form.description,
          requirements: form.requirements,
          companyName: form.companyName,
          phone: form.phone || null,
          email: form.email || null,
        },
      }),
    );
    if (updateJobThunk.fulfilled.match(result)) setIsEditing(false);
  }

  async function handleDelete() {
    if (!job) return;
    const result = await dispatch(deleteJobsThunk(job.id));
    if (deleteJobsThunk.fulfilled.match(result)) navigate("/ofertas");
  }

  // Sin aviso ni fichero adjunto: las ofertas no tienen imagen, asi que se
  // comparten igual desde el ordenador que desde el movil.
  function handleShareWhatsApp() {
    if (!job) return;
    void shareOnWhatsApp(formatJobWhatsApp(job));
  }

  if (getStatus === "pending") {
    return (
      <p className="font-body text-body text-secondary-500">
        Cargando oferta...
      </p>
    );
  }

  if (getStatus === "rejected") {
    return (
      <p className="font-body text-body text-secondary-700">
        {getError ?? "No se ha podido cargar la oferta."}
      </p>
    );
  }

  if (!job) return null;

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl">
        <div className="flex h-80 items-center justify-center bg-tertiary-200">
          <IoImageOutline className="h-10 w-10 text-tertiary-500" />
        </div>

        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 rounded-2xl bg-white p-5 shadow-md">
          <div>
            <span className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 font-label text-xs text-primary-700">
              {job.companyName}
            </span>

            <h1 className="mt-3 font-headline text-headline">{job.title}</h1>
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
              aria-label="Editar oferta"
              className="rounded-md p-2 text-secondary-400 transition-colors hover:bg-tertiary-100 hover:text-secondary-600"
            >
              <IoPencilOutline className="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteStatus === "pending"}
              aria-label="Eliminar oferta"
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
            <h2 className="font-headline text-headline">Sobre la Oferta</h2>
          </div>

          <p className="mt-4 font-body text-body">{job.description}</p>

          <p className="mt-4 font-body text-body text-secondary-400">
            {job.requirements}
          </p>
        </div>

        <div className="flex w-72 shrink-0 flex-col gap-3">
          <div className="flex items-center gap-3 rounded-xl bg-tertiary-100 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              <IoBusinessOutline className="h-5 w-5" />
            </span>
            <div>
              <p className="font-body text-xs text-secondary-500">Empresa</p>
              <p className="font-label text-label">{job.companyName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-tertiary-100 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tertiary-300 text-secondary-600">
              <IoCallOutline className="h-5 w-5" />
            </span>
            <div>
              <p className="font-body text-xs text-secondary-500">Contacto</p>
              <p className="font-label text-label">{job.phone ?? job.email}</p>
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
              <p className="font-label text-label">{job.createDate}</p>
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <PublicationFormModal
          type="job"
          mode="edit"
          initialValues={{
            title: job.title,
            description: job.description,
            requirements: job.requirements,
            companyName: job.companyName,
            phone: job.phone ?? "",
            email: job.email ?? "",
          }}
          submitting={updateStatus === "pending"}
          onSubmit={handleUpdate}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  );
}
