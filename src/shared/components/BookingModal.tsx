import { useEffect, useState } from "react";
import { IoAdd, IoClose } from "react-icons/io5";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  createBookingThunk,
  updateBookingThunk,
} from "../../modules/bookings/Features/bookingsThunks";
import type {
  AllBookings,
  BookingInterface,
  BookingState,
} from "../../modules/bookings/Interfaces/bookingsInterface";

// 'free' no se ofrece: es un estado calculado (dia sin reserva), la API no lo persiste.
const STATES = [
  { value: "pending", label: "Pendiente" },
  { value: "reserved", label: "Reservada" },
];


function toInputValue(isoDate: string) {
  return isoDate.slice(0, 16);
}

interface BookingModalProps {
  date: string;
  bookings: AllBookings;
  onClose: () => void;
}

export default function BookingModal({
  date,
  bookings,
  onClose,
}: BookingModalProps) {
  const dispatch = useAppDispatch();
  const updateStatus = useAppSelector(
    (state) => state.bookingsSlice.updateBookingsStatus,
  );
  const updateError = useAppSelector(
    (state) => state.bookingsSlice.updateBookingsError,
  );
  const createStatus = useAppSelector(
    (state) => state.bookingsSlice.createBookingsStatus,
  );
  const createError = useAppSelector(
    (state) => state.bookingsSlice.createBookingsError,
  );

  
  const [selected, setSelected] = useState<BookingInterface | null>(
    bookings.length === 1 ? bookings[0] : null,
  );
  const [isCreating, setIsCreating] = useState(bookings.length === 0);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    startDate: `${date}T09:00`,
    endDate: `${date}T10:00`,
    state: "pending",
    notes: "",
  });

  useEffect(() => {
    if (!selected) return;
    setForm({
      name: selected.name,
      phone: selected.phone,
      startDate: toInputValue(selected.startDate),
      endDate: toInputValue(selected.endDate),
      state: selected.state,
      notes: selected.notes ?? "",
    });
  }, [selected]);

  function startCreate() {
    setSelected(null);
    setIsCreating(true);
    setForm({
      name: "",
      phone: "",
      startDate: `${date}T09:00`,
      endDate: `${date}T10:00`,
      state: "pending",
      notes: "",
    });
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const formattedDate = new Date(`${date}T00:00:00`).toLocaleDateString(
    "es-ES",
    { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  );

  const sending =
    isCreating ? createStatus === "pending" : updateStatus === "pending";

  async function handleSubmit(event: React.SyntheticEvent) {
    event.preventDefault();

    const booking = {
      name: form.name,
      phone: form.phone,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      state: form.state as BookingState,
      notes: form.notes,
    };

  
    if (isCreating) {
      const result = await dispatch(createBookingThunk(booking));
      if (createBookingThunk.fulfilled.match(result)) onClose();
      return;
    }

    if (!selected) return;
    const result = await dispatch(
      updateBookingThunk({ id: selected.id, booking }),
    );
    if (updateBookingThunk.fulfilled.match(result)) onClose();
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
          <div>
            <h2 className="font-headline text-headline">
              {isCreating ? "Nueva reserva" : "Reservas"}
            </h2>
            <p className="font-body text-xs text-secondary-500 first-letter:uppercase">
              {formattedDate}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-md p-1 text-secondary-400 transition-colors hover:bg-tertiary-100 hover:text-secondary-600"
          >
            <IoClose className="h-5 w-5" />
          </button>
        </div>

        {/* Con reservas ya existentes hay que ofrecer la creacion de forma
            explicita; si el dia esta libre el formulario ya sale en blanco. */}
        {bookings.length > 0 && !isCreating && (
          <button
            type="button"
            onClick={startCreate}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-tertiary-300 px-4 py-2 font-label text-label text-secondary-600 transition-colors hover:bg-tertiary-100 hover:text-primary"
          >
            <IoAdd className="h-4 w-4" />
            Nueva reserva
          </button>
        )}

        {bookings.length > 1 && !isCreating && (
          <ul className="mt-4 flex flex-col gap-2">
            {bookings.map((booking) => (
              <li key={booking.id}>
                <button
                  type="button"
                  onClick={() => setSelected(booking)}
                  className={`w-full rounded-lg border px-3 py-2 text-left font-label text-label transition-colors ${
                    selected?.id === booking.id
                      ? "border-primary bg-primary-50 text-primary-700"
                      : "border-tertiary-300 text-secondary-600 hover:bg-tertiary-100"
                  }`}
                >
                  {booking.name}
                </button>
              </li>
            ))}
          </ul>
        )}

        {(selected || isCreating) && (
          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="font-label text-label text-secondary-600">
                Nombre
              </span>
              <input
                type="text"
                required
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                className="rounded-lg border border-tertiary-300 px-3 py-2 font-body text-body focus:border-primary focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-label text-label text-secondary-600">
                Teléfono
              </span>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(event) =>
                  setForm({ ...form, phone: event.target.value })
                }
                className="rounded-lg border border-tertiary-300 px-3 py-2 font-body text-body focus:border-primary focus:outline-none"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="font-label text-label text-secondary-600">
                  Entrada
                </span>
                <input
                  type="datetime-local"
                  required
                  value={form.startDate}
                  onChange={(event) =>
                    setForm({ ...form, startDate: event.target.value })
                  }
                  className="rounded-lg border border-tertiary-300 px-3 py-2 font-body text-xs focus:border-primary focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-label text-label text-secondary-600">
                  Salida
                </span>
                <input
                  type="datetime-local"
                  required
                  value={form.endDate}
                  onChange={(event) =>
                    setForm({ ...form, endDate: event.target.value })
                  }
                  className="rounded-lg border border-tertiary-300 px-3 py-2 font-body text-xs focus:border-primary focus:outline-none"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="font-label text-label text-secondary-600">
                Estado
              </span>
              <select
                value={form.state}
                onChange={(event) =>
                  setForm({ ...form, state: event.target.value })
                }
                className="rounded-lg border border-tertiary-300 px-3 py-2 font-body text-body focus:border-primary focus:outline-none"
              >
                {STATES.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-label text-label text-secondary-600">
                Notas
              </span>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(event) =>
                  setForm({ ...form, notes: event.target.value })
                }
                className="resize-none rounded-lg border border-tertiary-300 px-3 py-2 font-body text-body focus:border-primary focus:outline-none"
              />
            </label>

            {isCreating
              ? createStatus === "rejected" &&
                createError && (
                  <p className="font-body text-xs text-secondary-700">
                    {createError}
                  </p>
                )
              : updateStatus === "rejected" &&
                updateError && (
                  <p className="font-body text-xs text-secondary-700">
                    {updateError}
                  </p>
                )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-tertiary-300 bg-white px-4 py-2 font-label text-label text-secondary-600 transition-colors hover:bg-tertiary-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={sending}
                className="rounded-lg bg-primary px-4 py-2 font-label text-label text-white transition-colors hover:bg-primary-600 disabled:opacity-60"
              >
                {sending
                  ? "Guardando..."
                  : isCreating
                    ? "Crear reserva"
                    : "Guardar"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}