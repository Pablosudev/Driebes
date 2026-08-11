import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatEventWhatsApp } from "../modules/events/utils/formatEventWhatsApp";
import type { EventInterface } from "../modules/events/Interfaces/EventsInterface";

const SITIO = "https://villa.example";
const API = "http://api.villa.example";

const evento = (overrides: Partial<EventInterface> = {}): EventInterface => ({
  id: 7,
  title: "Fiesta de Verano",
  description: "Celebración organizada por el Ayuntamiento.",
  image: null,
  creationDate: "2026-08-01T10:00:00.000Z",
  eventDate: "2026-08-22T18:00:00.000Z",
  category: "Festivo",
  ...overrides,
});

beforeEach(() => {
  vi.stubEnv("VITE_API_URL", API);
  // Sin web publica configurada: es el estado por defecto del proyecto y hace
  // los tests independientes del .env de cada maquina.
  vi.stubEnv("VITE_PUBLIC_SITE_URL", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("formatEventWhatsApp", () => {
  it("compone el mensaje del evento", () => {
    expect(formatEventWhatsApp(evento())).toBe(
      [
        "Fiesta de Verano",
        "",
        "Celebración organizada por el Ayuntamiento.",
        "",
        "22 de agosto de 2026",
        "Categoría: Festivo",
      ].join("\n"),
    );
  });

  it("usa la fecha del evento y no la de creacion", () => {
    const message = formatEventWhatsApp(evento());

    expect(message).toContain("22 de agosto de 2026");
    expect(message).not.toContain("1 de agosto de 2026");
  });

  it("escribe la categoria tal y como viene de la API", () => {
    expect(formatEventWhatsApp(evento({ category: "Deportivo" }))).toContain(
      "Categoría: Deportivo",
    );
    expect(formatEventWhatsApp(evento({ category: "Religioso" }))).toContain(
      "Categoría: Religioso",
    );
  });

  it("omite la categoria generica, que no aporta nada al vecino", () => {
    expect(formatEventWhatsApp(evento({ category: "Otro" }))).toBe(
      [
        "Fiesta de Verano",
        "",
        "Celebración organizada por el Ayuntamiento.",
        "",
        "22 de agosto de 2026",
      ].join("\n"),
    );
  });

  it("añade el enlace publico cuando hay web configurada", () => {
    vi.stubEnv("VITE_PUBLIC_SITE_URL", SITIO);

    expect(formatEventWhatsApp(evento())).toBe(
      [
        "Fiesta de Verano",
        "",
        "Celebración organizada por el Ayuntamiento.",
        "",
        "22 de agosto de 2026",
        "Categoría: Festivo",
        "",
        "Más información:",
        "https://villa.example/eventos/7",
      ].join("\n"),
    );
  });

  it("no añade enlace si no hay web publica configurada", () => {
    const message = formatEventWhatsApp(evento());

    expect(message).not.toContain("Más información");
    expect(message).not.toContain("http");
  });

  it("no duplica la barra si la web configurada acaba en barra", () => {
    vi.stubEnv("VITE_PUBLIC_SITE_URL", `${SITIO}/`);

    expect(formatEventWhatsApp(evento())).toContain(
      "https://villa.example/eventos/7",
    );
  });

  it("comparte la imagen como URL absoluta de la API", () => {
    expect(
      formatEventWhatsApp(evento({ image: "/uploads/events/cartel.png" })),
    ).toBe(
      [
        "Fiesta de Verano",
        "",
        "Celebración organizada por el Ayuntamiento.",
        "",
        "22 de agosto de 2026",
        "Categoría: Festivo",
        "",
        "http://api.villa.example/uploads/events/cartel.png",
      ].join("\n"),
    );
  });

  it("pone la imagen antes del enlace publico", () => {
    // WhatsApp solo previsualiza el primer enlace del mensaje: si va delante el
    // de la web, el vecino no llega a ver el cartel.
    vi.stubEnv("VITE_PUBLIC_SITE_URL", SITIO);

    const message = formatEventWhatsApp(
      evento({ image: "/uploads/events/cartel.png" }),
    );

    expect(message.indexOf("cartel.png")).toBeLessThan(
      message.indexOf("/eventos/7"),
    );
  });

  it("omite la imagen si el evento no tiene", () => {
    expect(formatEventWhatsApp(evento({ image: null }))).not.toContain(
      "uploads",
    );
  });

  it("recorta los espacios sobrantes del titulo y la descripcion", () => {
    expect(
      formatEventWhatsApp(
        evento({ title: "  Fiesta de Verano  ", description: "Texto.\n\n  " }),
      ),
    ).toBe(
      [
        "Fiesta de Verano",
        "",
        "Texto.",
        "",
        "22 de agosto de 2026",
        "Categoría: Festivo",
      ].join("\n"),
    );
  });

  it("no empieza ni acaba con espacios ni saltos de linea", () => {
    const message = formatEventWhatsApp(evento());

    expect(message).toBe(message.trim());
  });

  it("omite la descripcion vacia sin dejar dos lineas en blanco", () => {
    expect(formatEventWhatsApp(evento({ description: "" }))).toBe(
      ["Fiesta de Verano", "", "22 de agosto de 2026", "Categoría: Festivo"].join(
        "\n",
      ),
    );
  });

  it("omite la fecha si viene vacia", () => {
    expect(formatEventWhatsApp(evento({ eventDate: "" }))).toBe(
      [
        "Fiesta de Verano",
        "",
        "Celebración organizada por el Ayuntamiento.",
        "",
        "Categoría: Festivo",
      ].join("\n"),
    );
  });

  it("nunca escribe undefined ni null en el mensaje", () => {
    const incompleto = {
      ...evento(),
      description: undefined,
      eventDate: undefined,
      category: undefined,
      image: undefined,
    } as unknown as EventInterface;

    expect(formatEventWhatsApp(incompleto)).not.toMatch(/undefined|null/);
  });
});

describe("formatEventWhatsApp - cuando la foto se adjunta", () => {
  // En el movil la imagen viaja como fichero adjunto, asi que repetir su URL
  // en el texto solo ensucia el mensaje.
  const conCartel = evento({ image: "/uploads/events/cartel.png" });

  it("omite la URL de la imagen", () => {
    expect(formatEventWhatsApp(conCartel, { includeImageUrl: false })).toBe(
      [
        "Fiesta de Verano",
        "",
        "Celebración organizada por el Ayuntamiento.",
        "",
        "22 de agosto de 2026",
        "Categoría: Festivo",
      ].join("\n"),
    );
  });

  it("mantiene el enlace a la web publica", () => {
    vi.stubEnv("VITE_PUBLIC_SITE_URL", SITIO);

    const message = formatEventWhatsApp(conCartel, { includeImageUrl: false });

    expect(message).toContain("https://villa.example/eventos/7");
    expect(message).not.toContain("cartel.png");
  });

  it("incluye la URL por defecto, sin pasar opciones", () => {
    expect(formatEventWhatsApp(conCartel)).toContain("cartel.png");
  });
});
