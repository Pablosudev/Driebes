import { describe, expect, it } from "vitest";
import { activeBookings } from "../modules/bookings/Features/bookingsSelectors";
import { todayKey } from "../shared/dates";
import type {
  BookingInterface,
  BookingState,
} from "../modules/bookings/Interfaces/bookingsInterface";

/** Reserva minima: para estos tests solo importan el estado y las fechas. */
const reserva = (
  id: number,
  state: BookingState,
  day: string,
): BookingInterface => ({
  id,
  name: `Reserva ${id}`,
  phone: "600000000",
  startDate: `${day}T09:00:00.000Z`,
  endDate: `${day}T13:00:00.000Z`,
  state,
  notes: null,
  createDate: "2026-08-01T00:00:00.000Z",
});

const HOY = "2026-08-10";

describe("todayKey", () => {
  it("formatea el dia como YYYY-MM-DD rellenando con ceros", () => {
    expect(todayKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("activeBookings", () => {
  it("cuenta las pendientes y las reservadas que aun no han pasado", () => {
    const bookings = [
      reserva(1, "pending", "2026-08-15"),
      reserva(2, "reserved", "2026-09-01"),
    ];

    expect(activeBookings(bookings, HOY)).toHaveLength(2);
  });

  it("descarta las reservas cuya fecha de salida ya paso", () => {
    const bookings = [
      reserva(1, "reserved", "2026-08-09"),
      reserva(2, "pending", "2026-07-20"),
      reserva(3, "pending", "2026-08-15"),
    ];

    expect(activeBookings(bookings, HOY).map((b) => b.id)).toEqual([3]);
  });

  it("mantiene activa la reserva que termina hoy", () => {
    const bookings = [reserva(1, "reserved", HOY)];

    expect(activeBookings(bookings, HOY)).toHaveLength(1);
  });

  it("descarta el estado calculado 'free' aunque la fecha sea futura", () => {
    const bookings = [
      reserva(1, "free", "2026-12-01"),
      reserva(2, "reserved", "2026-12-01"),
    ];

    expect(activeBookings(bookings, HOY).map((b) => b.id)).toEqual([2]);
  });

  it("no cuenta una reserva de varios dias que ya termino", () => {
    const multiDia: BookingInterface = {
      ...reserva(1, "reserved", "2026-08-01"),
      startDate: "2026-08-01T09:00:00.000Z",
      endDate: "2026-08-05T13:00:00.000Z",
    };

    expect(activeBookings([multiDia], HOY)).toEqual([]);
  });

  it("cuenta una reserva de varios dias que esta en curso", () => {
    const enCurso: BookingInterface = {
      ...reserva(1, "reserved", "2026-08-08"),
      startDate: "2026-08-08T09:00:00.000Z",
      endDate: "2026-08-12T13:00:00.000Z",
    };

    expect(activeBookings([enCurso], HOY)).toHaveLength(1);
  });

  it("devuelve una lista vacia si no hay reservas", () => {
    expect(activeBookings([], HOY)).toEqual([]);
  });
});
