import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import EventDetail from "../modules/events/Pages/EventDetail";
import { eventReducer } from "../modules/events/Features/eventsSlice";

const AVISO = "la publicación deberá hacerse a través del móvil";

const evento = {
  id: 7,
  title: "Fiesta de Verano",
  description: "Celebración organizada por el Ayuntamiento.",
  image: "/uploads/events/cartel.png",
  creationDate: "2026-08-01T10:00:00.000Z",
  eventDate: "2026-08-22T18:00:00.000Z",
  category: "Festivo",
};

let openMock: ReturnType<typeof vi.fn>;
let fetchMock: ReturnType<typeof vi.fn>;

/** Simula el tipo de puntero: `coarse` es el dedo, o sea un movil. */
const stubPointer = (coarse: boolean) =>
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: coarse && query.includes("coarse"),
    media: query,
  }));

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

/** Un movil capaz de adjuntar el cartel. Devuelve el `navigator.share` espiado. */
const enMovil = () => {
  const share = vi.fn(async (_data: unknown) => {});
  stubPointer(true);
  stubWebShare({ canShare: () => true, share });
  return share;
};

beforeEach(() => {
  vi.stubEnv("VITE_API_URL", "http://api.test");
  vi.stubEnv("VITE_PUBLIC_SITE_URL", "");
  // Sirve tanto el evento (json) como su cartel (blob).
  fetchMock = vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => evento,
    blob: async () => new Blob(["imagen"], { type: "image/png" }),
  }));
  vi.stubGlobal("fetch", fetchMock);
  openMock = vi.fn();
  vi.stubGlobal("open", openMock);
  // Por defecto, escritorio: no se puede adjuntar.
  stubPointer(false);
  stubWebShare();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  stubWebShare();
});

const renderDetail = () =>
  render(
    <Provider store={configureStore({ reducer: { eventsSlice: eventReducer } })}>
      <MemoryRouter initialEntries={["/eventos/7"]}>
        <Routes>
          <Route path="/eventos/:id" element={<EventDetail />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

/** Pulsa el boton de compartir, ya con el evento cargado. */
const pulsarCompartir = async () =>
  userEvent.click(
    await screen.findByRole("button", { name: "Compartir por WhatsApp" }),
  );

describe("EventDetail - compartir desde un equipo que no adjunta el cartel", () => {
  it("avisa de que la publicacion debe hacerse desde el movil", async () => {
    renderDetail();
    await pulsarCompartir();

    expect(screen.getByRole("dialog")).toHaveTextContent(AVISO);
  });

  it("no abre WhatsApp mientras el aviso sigue abierto", async () => {
    renderDetail();
    await pulsarCompartir();

    expect(openMock).not.toHaveBeenCalled();
  });

  it("abre WhatsApp con el mensaje del evento al continuar", async () => {
    renderDetail();
    await pulsarCompartir();
    await userEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(openMock).toHaveBeenCalledTimes(1);
    const message = decodeURIComponent(openMock.mock.calls[0][0] as string);
    expect(message).toContain("Fiesta de Verano");
    expect(message).toContain("22 de agosto de 2026");
  });

  it("incluye la URL del cartel en el mensaje, ya que no se adjunta", async () => {
    renderDetail();
    await pulsarCompartir();
    await userEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(decodeURIComponent(openMock.mock.calls[0][0] as string)).toContain(
      "http://api.test/uploads/events/cartel.png",
    );
  });

  it("cierra el aviso al continuar", async () => {
    renderDetail();
    await pulsarCompartir();
    await userEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("no comparte nada si se cancela el aviso", async () => {
    renderDetail();
    await pulsarCompartir();
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(openMock).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("cierra el aviso con la tecla Escape sin compartir", async () => {
    renderDetail();
    await pulsarCompartir();
    await userEvent.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(openMock).not.toHaveBeenCalled();
  });

  it("no avisa si el evento no tiene cartel que perder", async () => {
    // Sin imagen, compartir desde el ordenador da el mismo resultado que desde
    // el movil: el aviso solo estorbaria.
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ...evento, image: null }),
    });
    renderDetail();
    await pulsarCompartir();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(openMock).toHaveBeenCalledTimes(1);
  });
});

describe("EventDetail - fechas", () => {
  it("muestra creacion y evento en dia/mes/año, no en ISO", async () => {
    renderDetail();

    expect(await screen.findByText("01/08/2026")).toBeInTheDocument();
    expect(screen.getByText("22/08/2026")).toBeInTheDocument();
    expect(screen.queryByText(/2026-08-\d\dT/)).not.toBeInTheDocument();
  });
});

describe("EventDetail - compartir desde un movil", () => {
  it("adjunta el cartel sin mostrar el aviso", async () => {
    const share = enMovil();
    renderDetail();
    await screen.findByRole("button", { name: "Compartir por WhatsApp" });
    // La imagen se descarga al cargar el evento, antes del clic: hacerlo dentro
    // del gesto invalidaria el permiso de compartir en Safari.
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    await pulsarCompartir();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(share).toHaveBeenCalledTimes(1);
    expect(openMock).not.toHaveBeenCalled();
  });

  it("manda el cartel y el texto juntos, sin repetir la URL de la imagen", async () => {
    const share = enMovil();
    renderDetail();
    await screen.findByRole("button", { name: "Compartir por WhatsApp" });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    await pulsarCompartir();

    const shared = share.mock.calls[0][0] as { files: File[]; text: string };
    expect(shared.files[0]).toBeInstanceOf(File);
    expect(shared.files[0].name).toBe("cartel.png");
    expect(shared.text).toContain("Fiesta de Verano");
    expect(shared.text).not.toContain("cartel.png");
  });
});
