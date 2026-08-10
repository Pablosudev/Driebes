import { describe, expect, it } from "vitest";
import { buildReminders } from "../shared/reminders";
import { dayLabel, dayRange } from "../shared/dates";
import type { EventInterface } from "../modules/events/Interfaces/EventsInterface";
import type {
  BookingInterface,
  BookingState,
} from "../modules/bookings/Interfaces/bookingsInterface";

const HOY = "2026-08-10";

const evento = (id: number, day: string, hora = "18:00"): EventInterface => ({
  id,
  title: `Evento ${id}`,
  description: "Descripcion",
  image: null,
  creationDate: "2026-08-01T10:00:00.000Z",
  eventDate: `${day}T${hora}:00.000Z`,
  category: "festive",
});

const reserva = (
  id: number,
  startDay: string,
  endDay: string = startDay,
  state: BookingState = "pending",
): BookingInterface => ({
  id,
  name: `Titular ${id}`,
  phone: "600000000",
  startDate: `${startDay}T09:00:00.000Z`,
  endDate: `${endDay}T13:00:00.000Z`,
  state,
  notes: null,
  createDate: "2026-08-01T10:00:00.000Z",
});

const vacio = { events: [], bookings: [] };

describe("dayRange y dayLabel", () => {
  it("genera dias consecutivos cruzando el cambio de mes", () => {
    expect(dayRange("2026-08-30", 3)).toEqual([
      "2026-08-30",
      "2026-08-31",
      "2026-09-01",
    ]);
  });

  it("etiqueta hoy y mañana con su nombre", () => {
    expect(dayLabel(HOY, HOY)).toBe("Hoy");
    expect(dayLabel("2026-08-11", HOY)).toBe("Mañana");
  });

  it("usa el dia de la semana para el resto", () => {
    expect(dayLabel("2026-08-13", HOY)).toBe("Jueves, 13 de agosto");
  });
});

describe("buildReminders", () => {
  it("no devuelve nada si no hay eventos ni reservas", () => {
    expect(buildReminders(vacio, HOY)).toEqual({ groups: [], pendingLater: [] });
  });

  it("agrupa lo de hoy bajo la etiqueta 'Hoy'", () => {
    const reminders = buildReminders(
      { events: [evento(1, HOY)], bookings: [reserva(1, HOY)] },
      HOY,
    );

    expect(reminders.groups).toHaveLength(1);
    expect(reminders.groups[0].label).toBe("Hoy");
    expect(reminders.groups[0].items).toHaveLength(2);
  });

  it("omite los dias sin nada previsto", () => {
    const reminders = buildReminders(
      { events: [evento(1, "2026-08-13")], bookings: [] },
      HOY,
    );

    expect(reminders.groups.map((g) => g.day)).toEqual(["2026-08-13"]);
  });

  it("descarta lo anterior a hoy", () => {
    const reminders = buildReminders(
      { events: [evento(1, "2026-08-09")], bookings: [reserva(1, "2026-08-01")] },
      HOY,
    );

    expect(reminders.groups).toEqual([]);
  });

  it("descarta lo que cae mas alla de la ventana", () => {
    const reminders = buildReminders(
      { events: [evento(1, "2026-09-15")], bookings: [] },
      HOY,
    );

    expect(reminders.groups).toEqual([]);
  });

  it("repite una reserva de varios dias en cada dia que ocupa", () => {
    const reminders = buildReminders(
      { events: [], bookings: [reserva(1, HOY, "2026-08-12")] },
      HOY,
    );

    expect(reminders.groups.map((g) => g.day)).toEqual([
      "2026-08-10",
      "2026-08-11",
      "2026-08-12",
    ]);
  });

  it("ordena por hora dentro de cada dia", () => {
    const reminders = buildReminders(
      { events: [evento(1, HOY, "08:00")], bookings: [reserva(1, HOY)] },
      HOY,
    );

    expect(reminders.groups[0].items.map((i) => i.hour)).toEqual([
      "08:00",
      "09:00",
    ]);
  });

  it("marca como pendiente la reserva sin confirmar", () => {
    const reminders = buildReminders(
      {
        events: [],
        bookings: [reserva(1, HOY, HOY, "pending"), reserva(2, HOY, HOY, "reserved")],
      },
      HOY,
    );
    const items = reminders.groups[0].items;

    expect(items.find((i) => i.key === "booking-1")?.pending).toBe(true);
    expect(items.find((i) => i.key === "booking-2")?.pending).toBe(false);
  });

  it("saca aparte las pendientes cuya fecha queda fuera de la ventana", () => {
    const reminders = buildReminders(
      { events: [], bookings: [reserva(1, "2026-09-20", "2026-09-20", "pending")] },
      HOY,
    );

    expect(reminders.groups).toEqual([]);
    expect(reminders.pendingLater.map((i) => i.key)).toEqual(["booking-1"]);
  });

  it("no saca aparte las ya confirmadas fuera de la ventana", () => {
    const reminders = buildReminders(
      { events: [], bookings: [reserva(1, "2026-09-20", "2026-09-20", "reserved")] },
      HOY,
    );

    expect(reminders.pendingLater).toEqual([]);
  });

  it("no duplica en 'pendientes' una reserva que ya sale en la ventana", () => {
    const reminders = buildReminders(
      { events: [], bookings: [reserva(1, HOY, HOY, "pending")] },
      HOY,
    );

    expect(reminders.groups[0].items).toHaveLength(1);
    expect(reminders.pendingLater).toEqual([]);
  });
});