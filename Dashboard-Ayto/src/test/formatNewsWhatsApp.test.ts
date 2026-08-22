import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatNewsWhatsApp } from "../modules/news/utils/formatNewsWhatsApp";
import type { NewsInterface } from "../modules/news/Interfaces/newsInterface";

const SITIO = "https://villa.example";
const API = "http://api.villa.example";

const noticia = (overrides: Partial<NewsInterface> = {}): NewsInterface => ({
  id: 12,
  title: "Obras en la Plaza Mayor",
  description: "El acceso peatonal permanecerá cerrado durante dos semanas.",
  image: null,
  uploadDate: "2026-08-10T09:00:00.000Z",
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

describe("formatNewsWhatsApp", () => {
  it("compone el mensaje de la noticia", () => {
    expect(formatNewsWhatsApp(noticia())).toBe(
      [
        "Obras en la Plaza Mayor",
        "",
        "El acceso peatonal permanecerá cerrado durante dos semanas.",
        "",
        "10 de agosto de 2026",
      ].join("\n"),
    );
  });

  it("añade el enlace publico cuando hay web configurada", () => {
    vi.stubEnv("VITE_PUBLIC_SITE_URL", SITIO);

    expect(formatNewsWhatsApp(noticia())).toBe(
      [
        "Obras en la Plaza Mayor",
        "",
        "El acceso peatonal permanecerá cerrado durante dos semanas.",
        "",
        "10 de agosto de 2026",
        "",
        "Más información:",
        "https://villa.example/noticias/12",
      ].join("\n"),
    );
  });

  it("no añade enlace si no hay web publica configurada", () => {
    const message = formatNewsWhatsApp(noticia());

    expect(message).not.toContain("Más información");
    expect(message).not.toContain("http");
  });

  it("no duplica la barra si la web configurada acaba en barra", () => {
    vi.stubEnv("VITE_PUBLIC_SITE_URL", `${SITIO}/`);

    expect(formatNewsWhatsApp(noticia())).toContain(
      "https://villa.example/noticias/12",
    );
  });

  it("escribe la fecha de publicacion en texto largo", () => {
    expect(formatNewsWhatsApp(noticia({ uploadDate: "2026-12-01" }))).toContain(
      "1 de diciembre de 2026",
    );
  });

  it("recorta los espacios sobrantes del titulo y la descripcion", () => {
    expect(
      formatNewsWhatsApp(
        noticia({ title: "  Obras  ", description: "  Dos semanas.\n" }),
      ),
    ).toBe(["Obras", "", "Dos semanas.", "", "10 de agosto de 2026"].join("\n"));
  });

  it("no empieza ni acaba con espacios ni saltos de linea", () => {
    const message = formatNewsWhatsApp(noticia());

    expect(message).toBe(message.trim());
  });

  it("omite la descripcion vacia sin dejar dos lineas en blanco", () => {
    expect(formatNewsWhatsApp(noticia({ description: "" }))).toBe(
      ["Obras en la Plaza Mayor", "", "10 de agosto de 2026"].join("\n"),
    );
  });

  it("omite la fecha si viene vacia", () => {
    expect(formatNewsWhatsApp(noticia({ uploadDate: "" }))).toBe(
      [
        "Obras en la Plaza Mayor",
        "",
        "El acceso peatonal permanecerá cerrado durante dos semanas.",
      ].join("\n"),
    );
  });

  it("comparte la imagen como URL absoluta de la API", () => {
    // wa.me no permite adjuntar ficheros: la imagen viaja como enlace para que
    // WhatsApp la previsualice.
    expect(
      formatNewsWhatsApp(noticia({ image: "/uploads/news/plaza.png" })),
    ).toBe(
      [
        "Obras en la Plaza Mayor",
        "",
        "El acceso peatonal permanecerá cerrado durante dos semanas.",
        "",
        "10 de agosto de 2026",
        "",
        "http://api.villa.example/uploads/news/plaza.png",
      ].join("\n"),
    );
  });

  it("no vuelve a prefijar la imagen si ya es una URL absoluta", () => {
    expect(
      formatNewsWhatsApp(noticia({ image: "https://cdn.example/plaza.png" })),
    ).toContain("https://cdn.example/plaza.png");
  });

  it("omite la imagen si la noticia no tiene", () => {
    expect(formatNewsWhatsApp(noticia({ image: null }))).not.toContain(
      "uploads",
    );
  });

  it("pone la imagen antes del enlace publico", () => {
    // WhatsApp solo previsualiza el primer enlace del mensaje: si va delante el
    // de la web, el vecino no llega a ver la foto.
    vi.stubEnv("VITE_PUBLIC_SITE_URL", SITIO);

    const message = formatNewsWhatsApp(
      noticia({ image: "/uploads/news/plaza.png" }),
    );

    expect(message.indexOf("plaza.png")).toBeLessThan(
      message.indexOf("/noticias/12"),
    );
  });

  it("nunca escribe undefined ni null en el mensaje", () => {
    const incompleta = {
      ...noticia(),
      description: undefined,
      uploadDate: undefined,
      image: undefined,
    } as unknown as NewsInterface;

    expect(formatNewsWhatsApp(incompleta)).not.toMatch(/undefined|null/);
  });
});

describe("formatNewsWhatsApp - cuando la foto se adjunta", () => {
  // En el movil la imagen viaja como fichero adjunto, asi que repetir su URL
  // en el texto solo ensucia el mensaje.
  const conFoto = noticia({ image: "/uploads/news/plaza.png" });

  it("omite la URL de la imagen", () => {
    expect(formatNewsWhatsApp(conFoto, { includeImageUrl: false })).toBe(
      [
        "Obras en la Plaza Mayor",
        "",
        "El acceso peatonal permanecerá cerrado durante dos semanas.",
        "",
        "10 de agosto de 2026",
      ].join("\n"),
    );
  });

  it("mantiene el enlace a la web publica", () => {
    vi.stubEnv("VITE_PUBLIC_SITE_URL", SITIO);

    const message = formatNewsWhatsApp(conFoto, { includeImageUrl: false });

    expect(message).toContain("https://villa.example/noticias/12");
    expect(message).not.toContain("plaza.png");
  });

  it("incluye la URL por defecto, sin pasar opciones", () => {
    expect(formatNewsWhatsApp(conFoto)).toContain("plaza.png");
  });
});
