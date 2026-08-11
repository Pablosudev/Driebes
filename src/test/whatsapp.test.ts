import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildWhatsAppUrl,
  canAttachFiles,
  shareOnWhatsApp,
} from "../services/whatsapp/whatsapp.service";

/** El `window.open` mockeado. Se reasigna en cada test desde el beforeEach. */
let openMock: ReturnType<typeof vi.fn>;

/**
 * Simula el tipo de puntero del dispositivo. `coarse` es el dedo: es lo que
 * distingue un movil de un equipo con raton.
 */
const stubPointer = (coarse: boolean) =>
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: coarse && query.includes("coarse"),
    media: query,
  }));

/** Coloca (o quita) el soporte de compartir del navegador. */
const stubWebShare = (support?: {
  canShare?: (data: unknown) => boolean;
  share?: (data: unknown) => Promise<void>;
}) => {
  Object.defineProperty(navigator, "canShare", {
    value: support?.canShare,
    configurable: true,
  });
  Object.defineProperty(navigator, "share", {
    value: support?.share,
    configurable: true,
  });
};

/** Un movil con WhatsApp como destino de compartir. */
const movilCompatible = (share = vi.fn(async () => {})) => {
  stubPointer(true);
  stubWebShare({ canShare: () => true, share });
  return share;
};

const imagen = () =>
  new File(["contenido"], "plaza.png", { type: "image/png" });

beforeEach(() => {
  openMock = vi.fn();
  vi.stubGlobal("open", openMock);
  // Por defecto, un equipo de escritorio sin soporte de compartir ficheros.
  stubPointer(false);
  stubWebShare();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  stubWebShare();
});

/** El valor del parametro `text` tal y como viaja en la URL, sin decodificar. */
const textParam = (url: string): string => url.slice(url.indexOf("?text=") + 6);

/** La URL con la que se abrio la n-esima pestaña. */
const openedUrl = (call = 0): string => openMock.mock.calls[call][0] as string;

describe("buildWhatsAppUrl", () => {
  it("apunta a wa.me sin destinatario para que el usuario elija el grupo", () => {
    expect(buildWhatsAppUrl("Hola")).toBe("https://wa.me/?text=Hola");
  });

  it("codifica los espacios y los simbolos del mensaje", () => {
    expect(buildWhatsAppUrl("Fiestas & Ferias")).toBe(
      "https://wa.me/?text=Fiestas%20%26%20Ferias",
    );
  });

  it("codifica los saltos de linea", () => {
    expect(textParam(buildWhatsAppUrl("Linea 1\nLinea 2"))).toBe(
      "Linea%201%0ALinea%202",
    );
  });

  it("codifica la almohadilla para que no corte el mensaje", () => {
    // Sin codificar, todo lo que va tras '#' se convierte en fragmento de la
    // URL y WhatsApp nunca lo recibe.
    expect(buildWhatsAppUrl("Feria #verano")).toBe(
      "https://wa.me/?text=Feria%20%23verano",
    );
  });

  it("codifica el prefijo internacional de los telefonos", () => {
    // Un '+' literal en la query se interpreta como espacio al decodificar.
    expect(buildWhatsAppUrl("+34600123456")).toBe(
      "https://wa.me/?text=%2B34600123456",
    );
  });

  it("devuelve el mensaje intacto al decodificar la URL", () => {
    const message = [
      "Fiesta & Feria",
      "",
      "22 de agosto de 2026",
      "#fiestas 100% de aforo · +34600123456",
    ].join("\n");

    expect(decodeURIComponent(textParam(buildWhatsAppUrl(message)))).toBe(
      message,
    );
  });
});

describe("canAttachFiles", () => {
  it("es false en un equipo con raton aunque el navegador admita ficheros", () => {
    // En escritorio el panel del sistema puede no ofrecer WhatsApp, y el
    // navegador no tiene forma de saberlo: mejor no prometer lo que no cumple.
    stubPointer(false);
    stubWebShare({ canShare: () => true, share: async () => {} });

    expect(canAttachFiles()).toBe(false);
  });

  it("es false en un movil sin soporte de compartir", () => {
    stubPointer(true);
    stubWebShare();

    expect(canAttachFiles()).toBe(false);
  });

  it("es false si el navegador rechaza compartir ficheros", () => {
    stubPointer(true);
    stubWebShare({ canShare: () => false, share: async () => {} });

    expect(canAttachFiles()).toBe(false);
  });

  it("es true en un movil que admite ficheros", () => {
    movilCompatible();

    expect(canAttachFiles()).toBe(true);
  });
});

describe("shareOnWhatsApp - sin imagen", () => {
  it("abre la URL de WhatsApp en una pestaña nueva", async () => {
    await shareOnWhatsApp("Hola vecinos");

    expect(openMock).toHaveBeenCalledWith(
      "https://wa.me/?text=Hola%20vecinos",
      "_blank",
    );
  });

  it("abre una sola pestaña por llamada", async () => {
    await shareOnWhatsApp("Hola vecinos");

    expect(openMock).toHaveBeenCalledTimes(1);
  });

  it("comparte el mensaje ya codificado", async () => {
    const message = "Obras en la Plaza Mayor\n\nDos semanas";

    await shareOnWhatsApp(message);

    expect(decodeURIComponent(textParam(openedUrl()))).toBe(message);
  });

  it("no abre WhatsApp si el mensaje esta vacio", async () => {
    await shareOnWhatsApp("");

    expect(openMock).not.toHaveBeenCalled();
  });

  it("no abre WhatsApp si el mensaje son solo espacios", async () => {
    await shareOnWhatsApp("   \n  ");

    expect(openMock).not.toHaveBeenCalled();
  });
});

describe("shareOnWhatsApp - con imagen", () => {
  it("adjunta la imagen junto al texto en un movil compatible", async () => {
    const share = movilCompatible();
    const file = imagen();

    await shareOnWhatsApp("Obras en la Plaza Mayor", file);

    expect(share).toHaveBeenCalledWith({
      files: [file],
      text: "Obras en la Plaza Mayor",
    });
  });

  it("no abre wa.me cuando ha podido adjuntar la imagen", async () => {
    movilCompatible();

    await shareOnWhatsApp("Obras en la Plaza Mayor", imagen());

    expect(openMock).not.toHaveBeenCalled();
  });

  it("cae a wa.me en un equipo que no puede adjuntar", async () => {
    stubPointer(false);
    const share = vi.fn(async () => {});
    stubWebShare({ canShare: () => true, share });

    await shareOnWhatsApp("Obras en la Plaza Mayor", imagen());

    expect(share).not.toHaveBeenCalled();
    expect(openMock).toHaveBeenCalledTimes(1);
  });

  it("cae a wa.me si no se ha podido cargar la imagen", async () => {
    movilCompatible();

    await shareOnWhatsApp("Obras en la Plaza Mayor", null);

    expect(openMock).toHaveBeenCalledTimes(1);
  });

  it("cae a wa.me si el panel de compartir falla", async () => {
    movilCompatible(
      vi.fn(async () => {
        throw new DOMException("no permitido", "NotAllowedError");
      }),
    );

    await shareOnWhatsApp("Obras en la Plaza Mayor", imagen());

    expect(openMock).toHaveBeenCalledTimes(1);
  });

  it("no insiste con wa.me si el usuario cancela el panel", async () => {
    // AbortError significa que ha decidido no compartir: abrirle WhatsApp
    // despues seria ignorar lo que acaba de pedir.
    movilCompatible(
      vi.fn(async () => {
        throw new DOMException("cancelado", "AbortError");
      }),
    );

    await shareOnWhatsApp("Obras en la Plaza Mayor", imagen());

    expect(openMock).not.toHaveBeenCalled();
  });

  it("no comparte nada si el mensaje esta vacio", async () => {
    const share = movilCompatible();

    await shareOnWhatsApp("", imagen());

    expect(share).not.toHaveBeenCalled();
    expect(openMock).not.toHaveBeenCalled();
  });
});
