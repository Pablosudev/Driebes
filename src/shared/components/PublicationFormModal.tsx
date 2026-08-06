import { useState } from "react";
import { IoClose, IoImageOutline } from "react-icons/io5";

export type PublicationType = "event" | "news" | "job";

export interface PublicationFormValues {
  title: string;
  description: string;
  image: File | null;
  eventDate: string;
  category: string;
  requirements: string;
  companyName: string;
  phone: string;
  email: string;
}

interface PublicationFormModalProps {
  type: PublicationType;
  mode?: "create" | "edit";
  initialValues?: Partial<PublicationFormValues>;
  onSubmit?: (form: PublicationFormValues) => void | Promise<void>;
  submitting?: boolean;
  onClose: () => void;
}

const MODAL_TITLE: Record<"create" | "edit", Record<PublicationType, string>> = {
  create: {
    event: "Nuevo Evento",
    news: "Nueva Noticia",
    job: "Nueva Oferta de Empleo",
  },
  edit: {
    event: "Editar Evento",
    news: "Editar Noticia",
    job: "Editar Oferta de Empleo",
  },
};

const CATEGORY_OPTIONS = [
  { value: "sports", label: "Deportivo" },
  { value: "festive", label: "Festivo" },
  { value: "religious", label: "Religioso" },
  { value: "other", label: "Otro" },
];

export default function PublicationFormModal({
  type,
  mode = "create",
  initialValues,
  onSubmit,
  submitting = false,
  onClose,
}: PublicationFormModalProps) {
  const [form, setForm] = useState<PublicationFormValues>({
    title: initialValues?.title ?? "",
    description: initialValues?.description ?? "",
    image: initialValues?.image ?? null,
    eventDate: initialValues?.eventDate ?? "",
    category: initialValues?.category ?? CATEGORY_OPTIONS[0].value,
    requirements: initialValues?.requirements ?? "",
    companyName: initialValues?.companyName ?? "",
    phone: initialValues?.phone ?? "",
    email: initialValues?.email ?? "",
  });

  /* Sin onSubmit el envio es solo visual: la conexion con el slice/thunk
     correspondiente a cada tipo se anadira mas adelante. */
  async function handleSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    if (onSubmit) {
      await onSubmit(form);
      return;
    }
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-full w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-headline text-headline">
            {MODAL_TITLE[mode][type]}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-md p-1 text-secondary-400 transition-colors hover:bg-tertiary-100 hover:text-secondary-600"
          >
            <IoClose className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          {type !== "job" && (
            <label className="flex flex-col gap-1.5">
              <span className="font-label text-label text-secondary-600">
                Imagen
              </span>
              <label className="flex h-32 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-tertiary-300 bg-tertiary-100 text-secondary-500 transition-colors hover:bg-tertiary-200">
                <IoImageOutline className="h-6 w-6" />
                <span className="font-body text-xs">
                  {form.image ? form.image.name : "Subir imagen"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) =>
                    setForm({
                      ...form,
                      image: event.target.files?.[0] ?? null,
                    })
                  }
                />
              </label>
            </label>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="font-label text-label text-secondary-600">
              Título
            </span>
            <input
              type="text"
              required
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
              className="rounded-lg border border-tertiary-300 px-3 py-2 font-body text-body focus:border-primary focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="font-label text-label text-secondary-600">
              Descripción
            </span>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              className="resize-none rounded-lg border border-tertiary-300 px-3 py-2 font-body text-body focus:border-primary focus:outline-none"
            />
          </label>

          {type === "event" && (
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="font-label text-label text-secondary-600">
                  Fecha del evento
                </span>
                <input
                  type="date"
                  required
                  value={form.eventDate}
                  onChange={(event) =>
                    setForm({ ...form, eventDate: event.target.value })
                  }
                  className="rounded-lg border border-tertiary-300 px-3 py-2 font-body text-body focus:border-primary focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-label text-label text-secondary-600">
                  Categoría
                </span>
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm({ ...form, category: event.target.value })
                  }
                  className="rounded-lg border border-tertiary-300 px-3 py-2 font-body text-body focus:border-primary focus:outline-none"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {type === "job" && (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="font-label text-label text-secondary-600">
                  Requisitos
                </span>
                <textarea
                  rows={3}
                  required
                  value={form.requirements}
                  onChange={(event) =>
                    setForm({ ...form, requirements: event.target.value })
                  }
                  className="resize-none rounded-lg border border-tertiary-300 px-3 py-2 font-body text-body focus:border-primary focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-label text-label text-secondary-600">
                  Empresa
                </span>
                <input
                  type="text"
                  required
                  value={form.companyName}
                  onChange={(event) =>
                    setForm({ ...form, companyName: event.target.value })
                  }
                  className="rounded-lg border border-tertiary-300 px-3 py-2 font-body text-body focus:border-primary focus:outline-none"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="font-label text-label text-secondary-600">
                    Teléfono
                  </span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      setForm({ ...form, phone: event.target.value })
                    }
                    className="rounded-lg border border-tertiary-300 px-3 py-2 font-body text-body focus:border-primary focus:outline-none"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="font-label text-label text-secondary-600">
                    Email
                  </span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm({ ...form, email: event.target.value })
                    }
                    className="rounded-lg border border-tertiary-300 px-3 py-2 font-body text-body focus:border-primary focus:outline-none"
                  />
                </label>
              </div>
            </>
          )}

          <div className="mt-1 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-tertiary-300 bg-white px-4 py-2 font-label text-label text-secondary-600 transition-colors hover:bg-tertiary-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary px-4 py-2 font-label text-label text-white transition-colors hover:bg-primary-600 disabled:opacity-60"
            >
              {submitting
                ? "Guardando..."
                : mode === "edit"
                  ? "Guardar"
                  : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}