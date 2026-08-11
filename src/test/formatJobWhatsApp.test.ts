import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatJobWhatsApp } from "../modules/jobs/utils/formatJobWhatsApp";
import type { JobInterface } from "../modules/jobs/Interfaces/JobsInterfaces";

const SITIO = "https://villa.example";

const oferta = (overrides: Partial<JobInterface> = {}): JobInterface => ({
  id: 3,
  title: "Auxiliar administrativo",
  description: "Apoyo administrativo en el registro municipal.",
  requirements: "Ciclo formativo de grado medio y manejo de ofimática.",
  companyName: "Ayuntamiento de la Villa",
  phone: "600123456",
  email: "empleo@villa.example",
  createDate: "2026-08-05T08:00:00.000Z",
  ...overrides,
});

beforeEach(() => {
  // Sin web publica configurada: es el estado por defecto del proyecto y hace
  // los tests independientes del .env de cada maquina.
  vi.stubEnv("VITE_PUBLIC_SITE_URL", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("formatJobWhatsApp", () => {
  it("compone el mensaje de la oferta", () => {
    expect(formatJobWhatsApp(oferta())).toBe(
      [
        "Auxiliar administrativo",
        "",
        "Empresa: Ayuntamiento de la Villa",
        "",
        "Apoyo administrativo en el registro municipal.",
        "",
        "Requisitos:",
        "Ciclo formativo de grado medio y manejo de ofimática.",
        "",
        "Teléfono: 600123456",
        "Email: empleo@villa.example",
      ].join("\n"),
    );
  });

  it("añade el enlace publico cuando hay web configurada", () => {
    vi.stubEnv("VITE_PUBLIC_SITE_URL", SITIO);

    expect(formatJobWhatsApp(oferta())).toContain(
      ["", "Más información:", "https://villa.example/ofertas/3"].join("\n"),
    );
  });

  it("no añade enlace si no hay web publica configurada", () => {
    const message = formatJobWhatsApp(oferta());

    expect(message).not.toContain("Más información");
    expect(message).not.toContain("http");
  });

  it("no duplica la barra si la web configurada acaba en barra", () => {
    vi.stubEnv("VITE_PUBLIC_SITE_URL", `${SITIO}/`);

    expect(formatJobWhatsApp(oferta())).toContain(
      "https://villa.example/ofertas/3",
    );
  });

  it("comparte solo el telefono si no hay email", () => {
    const message = formatJobWhatsApp(oferta({ email: null }));

    expect(message).toContain("Teléfono: 600123456");
    expect(message).not.toContain("Email:");
  });

  it("comparte solo el email si no hay telefono", () => {
    const message = formatJobWhatsApp(oferta({ phone: null }));

    expect(message).toContain("Email: empleo@villa.example");
    expect(message).not.toContain("Teléfono:");
  });

  it("omite el contacto entero si no hay telefono ni email", () => {
    expect(formatJobWhatsApp(oferta({ phone: null, email: null }))).toBe(
      [
        "Auxiliar administrativo",
        "",
        "Empresa: Ayuntamiento de la Villa",
        "",
        "Apoyo administrativo en el registro municipal.",
        "",
        "Requisitos:",
        "Ciclo formativo de grado medio y manejo de ofimática.",
      ].join("\n"),
    );
  });

  it("omite los requisitos si vienen vacios", () => {
    const message = formatJobWhatsApp(oferta({ requirements: "" }));

    expect(message).not.toContain("Requisitos:");
    expect(message).toContain("Apoyo administrativo en el registro municipal.");
  });

  it("omite la empresa si viene vacia", () => {
    const message = formatJobWhatsApp(oferta({ companyName: "" }));

    expect(message).not.toContain("Empresa:");
    expect(message).toContain("Auxiliar administrativo");
  });

  it("no incluye la fecha de creacion de la oferta", () => {
    // Es un dato de gestion interna: al vecino no le dice nada.
    const message = formatJobWhatsApp(oferta());

    expect(message).not.toContain("5 de agosto de 2026");
  });

  it("recorta los espacios sobrantes de cada campo", () => {
    expect(
      formatJobWhatsApp(
        oferta({
          title: "  Auxiliar administrativo  ",
          companyName: " Ayuntamiento de la Villa ",
          description: "Apoyo administrativo en el registro municipal.\n\n",
          requirements:
            "  Ciclo formativo de grado medio y manejo de ofimática.",
          phone: " 600123456 ",
          email: "empleo@villa.example  ",
        }),
      ),
    ).toBe(formatJobWhatsApp(oferta()));
  });

  it("no empieza ni acaba con espacios ni saltos de linea", () => {
    const message = formatJobWhatsApp(oferta());

    expect(message).toBe(message.trim());
  });

  it("nunca escribe undefined ni null en el mensaje", () => {
    const incompleta = {
      ...oferta(),
      description: undefined,
      requirements: undefined,
      companyName: undefined,
      phone: undefined,
      email: undefined,
    } as unknown as JobInterface;

    expect(formatJobWhatsApp(incompleta)).not.toMatch(/undefined|null/);
  });
});
