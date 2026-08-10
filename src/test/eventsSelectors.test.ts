import { describe, expect, it } from "vitest";
import {
  currentMonthKey,
  eventsInMonth,
} from "../modules/events/Features/eventsSelectors";
import type { EventInterface } from "../modules/events/Interfaces/EventsInterface";

/** Evento minimo: solo importa la fecha para estos tests. */
const evento = (id: number, eventDate: string): EventInterface => ({
  id,
  title: `Evento ${id}`,
  description: "Descripcion",
  image: null,
  creationDate: "2026-01-01T00:00:00.000Z",
  eventDate,
  category: "other",
});

describe("currentMonthKey", () => {
  it("formatea el mes como YYYY-MM", () => {
    expect(currentMonthKey(new Date(2026, 7, 10))).toBe("2026-08");
  });

  it("rellena con cero los meses de un digito", () => {
    expect(currentMonthKey(new Date(2026, 0, 31))).toBe("2026-01");
  });
});

describe("eventsInMonth", () => {
  const events = [
    evento(1, "2026-08-01T00:00:00.000Z"),
    evento(2, "2026-08-31T23:00:00.000Z"),
    evento(3, "2026-09-01T10:00:00.000Z"),
    evento(4, "2026-07-31T22:00:00.000Z"),
    evento(5, "2025-08-15T10:00:00.000Z"),
  ];

  it("devuelve solo los eventos del mes pedido", () => {
    expect(eventsInMonth(events, "2026-08").map((e) => e.id)).toEqual([1, 2]);
  });

  it("no mezcla el mismo mes de otro año", () => {
    expect(eventsInMonth(events, "2025-08").map((e) => e.id)).toEqual([5]);
  });

  it("devuelve una lista vacia si no hay eventos ese mes", () => {
    expect(eventsInMonth(events, "2026-12")).toEqual([]);
  });

  it("no desplaza de mes los eventos del primer o ultimo dia", () => {
    // 2026-08-31T23:00Z cae en septiembre en hora local (UTC+2): debe seguir
    // contando como agosto, que es el dia que muestra la aplicacion.
    expect(eventsInMonth(events, "2026-09").map((e) => e.id)).toEqual([3]);
  });
});
