import { describe, expect, it } from "vitest";
import { longDateLabel } from "../shared/dates";

describe("longDateLabel", () => {
  it("escribe la fecha en texto largo en castellano", () => {
    expect(longDateLabel("2026-08-22T18:00:00.000Z")).toBe(
      "22 de agosto de 2026",
    );
  });

  it("acepta una fecha sin hora", () => {
    expect(longDateLabel("2026-09-08")).toBe("8 de septiembre de 2026");
  });

  it("no rellena con cero el dia del mes", () => {
    expect(longDateLabel("2026-01-05")).toBe("5 de enero de 2026");
  });

  it("no desplaza de dia las fechas de ultima hora", () => {
    // 2026-08-31T23:00Z cae en septiembre en hora local (UTC+2): debe seguir
    // siendo 31 de agosto, el dia que muestra la aplicacion.
    expect(longDateLabel("2026-08-31T23:00:00.000Z")).toBe(
      "31 de agosto de 2026",
    );
  });

  it("no desplaza de dia las fechas de primera hora", () => {
    expect(longDateLabel("2026-08-01T00:30:00.000Z")).toBe(
      "1 de agosto de 2026",
    );
  });

  it("devuelve cadena vacia si no hay fecha", () => {
    // Los formatters de WhatsApp la usan directamente: nunca debe colar un
    // "Invalid Date" ni un "undefined" en el mensaje.
    expect(longDateLabel("")).toBe("");
  });

  it("devuelve cadena vacia si la fecha no es valida", () => {
    expect(longDateLabel("no es una fecha")).toBe("");
  });
});
