import { describe, expect, it } from "vitest";
import { hasPassed, longDateLabel, shortDateLabel } from "../shared/dates";

describe("hasPassed", () => {
  const HOY = "2026-08-11";

  it("es true si el dia ya paso", () => {
    expect(hasPassed("2026-08-10T18:00:00.000Z", HOY)).toBe(true);
  });

  it("es false el mismo dia, que todavia esta en curso", () => {
    expect(hasPassed("2026-08-11T09:00:00.000Z", HOY)).toBe(false);
  });

  it("es false si el dia esta por llegar", () => {
    expect(hasPassed("2026-08-12T09:00:00.000Z", HOY)).toBe(false);
  });

  it("no adelanta el final por las horas de la noche", () => {
    // 2026-08-11T23:00Z es el 12 en hora local (UTC+2). El dia que muestra la
    // aplicacion sigue siendo el 11, asi que no ha terminado.
    expect(hasPassed("2026-08-11T23:00:00.000Z", HOY)).toBe(false);
  });

  it("cuenta como pasado el dia anterior aunque fuese de noche", () => {
    expect(hasPassed("2026-08-10T23:00:00.000Z", HOY)).toBe(true);
  });

  it("es false si no hay fecha", () => {
    expect(hasPassed("", HOY)).toBe(false);
  });

  it("es false si la fecha no es valida", () => {
    // Ante la duda, no se marca como finalizado: es menos dañino que dar por
    // terminado un evento que aun no ha ocurrido.
    expect(hasPassed("no es una fecha", HOY)).toBe(false);
  });
});

describe("shortDateLabel", () => {
  it("escribe la fecha como dia/mes/año", () => {
    expect(shortDateLabel("2026-09-08T18:00:00.000Z")).toBe("08/09/2026");
  });

  it("acepta una fecha sin hora", () => {
    expect(shortDateLabel("2026-01-05")).toBe("05/01/2026");
  });

  it("rellena con cero el dia y el mes", () => {
    expect(shortDateLabel("2026-01-05")).toBe("05/01/2026");
  });

  it("no desplaza de dia las fechas de ultima hora", () => {
    // 2026-08-31T23:00Z cae en septiembre en hora local (UTC+2): debe seguir
    // siendo 31 de agosto, el dia que muestra la aplicacion.
    expect(shortDateLabel("2026-08-31T23:00:00.000Z")).toBe("31/08/2026");
  });

  it("devuelve cadena vacia si no hay fecha", () => {
    expect(shortDateLabel("")).toBe("");
  });

  it("devuelve cadena vacia si la fecha no es valida", () => {
    expect(shortDateLabel("no es una fecha")).toBe("");
  });
});

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
