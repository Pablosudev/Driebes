import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { getAllBookingsThunk } from "../Features/bookingsThunks";
import BookingCalendar from "../../../shared/components/BookingCalendar";

export default function Bookings() {
  const dispatch = useAppDispatch();
  const bookings = useAppSelector((state) => state.bookingsSlice.bookings);
  const status = useAppSelector(
    (state) => state.bookingsSlice.getAllBookingsStatus,
  );
  const error = useAppSelector(
    (state) => state.bookingsSlice.getAllBookingsError,
  );

  useEffect(() => {
    dispatch(getAllBookingsThunk());
  }, [dispatch]);

  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-headline text-headline mb-1">
            Calendario de Reservas
          </h1>
          <p className="font-body text-body text-secondary-500">
            Refugio Municipal
          </p>
        </div>
      </div>

      <div className="mt-6">
        {status === "rejected" && error && (
          <p className="mb-4 font-body text-body text-secondary-700">{error}</p>
        )}
        <BookingCalendar bookings={bookings} />
      </div>
    </>
  );
}