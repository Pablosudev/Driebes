import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import NewDetail from "../modules/news/Pages/NewDetail";
import { newsReducer } from "../modules/news/Features/newsSlice";

const AVISO = "la publicación deberá hacerse a través del móvil";

const noticia = {
  id: 12,
  title: "Obras en la Plaza Mayor",
  description: "El acceso peatonal permanecerá cerrado durante dos semanas.",
  image: "/uploads/news/plaza.png",
  uploadDate: "2026-08-10T09:00:00.000Z",
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

/** Un movil capaz de adjuntar la foto. Devuelve el `navigator.share` espiado. */
const enMovil = () => {
  const share = vi.fn(async (_data: unknown) => {});
  stubPointer(true);
  stubWebShare({ canShare: () => true, share });
  return share;
};

beforeEach(() => {
  vi.stubEnv("VITE_API_URL", "http://api.test");
  vi.stubEnv("VITE_PUBLIC_SITE_URL", "");
  // Sirve tanto la noticia (json) como su imagen (blob).
  fetchMock = vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => noticia,
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
    <Provider store={configureStore({ reducer: { newsSlice: newsReducer } })}>
      <MemoryRouter initialEntries={["/noticias/12"]}>
        <Routes>
          <Route path="/noticias/:id" element={<NewDetail />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

/** Pulsa el boton de compartir, ya con la noticia cargada. */
const pulsarCompartir = async () =>
  userEvent.click(
    await screen.findByRole("button", { name: "Compartir por WhatsApp" }),
  );

describe("NewDetail - compartir desde un equipo que no adjunta la foto", () => {
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

  it("abre WhatsApp con el mensaje de la noticia al continuar", async () => {
    renderDetail();
    await pulsarCompartir();
    await userEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(openMock).toHaveBeenCalledTimes(1);
    expect(decodeURIComponent(openMock.mock.calls[0][0] as string)).toContain(
      "Obras en la Plaza Mayor",
    );
  });

  it("incluye la URL de la foto en el mensaje, ya que no se adjunta", async () => {
    renderDetail();
    await pulsarCompartir();
    await userEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(decodeURIComponent(openMock.mock.calls[0][0] as string)).toContain(
      "http://api.test/uploads/news/plaza.png",
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

  it("permite volver a compartir despues de cancelar", async () => {
    renderDetail();
    await pulsarCompartir();
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    await pulsarCompartir();
    await userEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(openMock).toHaveBeenCalledTimes(1);
  });

  it("no avisa si la noticia no tiene foto que perder", async () => {
    // Sin imagen, compartir desde el ordenador da el mismo resultado que desde
    // el movil: el aviso solo estorbaria.
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ...noticia, image: null }),
    });
    renderDetail();
    await pulsarCompartir();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(openMock).toHaveBeenCalledTimes(1);
  });
});

describe("NewDetail - compartir desde un movil", () => {
  it("adjunta la foto sin mostrar el aviso", async () => {
    const share = enMovil();
    renderDetail();
    await screen.findByRole("button", { name: "Compartir por WhatsApp" });
    // La imagen se descarga al cargar la noticia, antes del clic: hacerlo
    // dentro del gesto invalidaria el permiso de compartir en Safari.
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    await pulsarCompartir();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(share).toHaveBeenCalledTimes(1);
    expect(openMock).not.toHaveBeenCalled();
  });

  it("manda la foto y el texto juntos, sin repetir la URL de la imagen", async () => {
    const share = enMovil();
    renderDetail();
    await screen.findByRole("button", { name: "Compartir por WhatsApp" });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    await pulsarCompartir();

    const shared = share.mock.calls[0][0] as { files: File[]; text: string };
    expect(shared.files[0]).toBeInstanceOf(File);
    expect(shared.files[0].name).toBe("plaza.png");
    expect(shared.text).toContain("Obras en la Plaza Mayor");
    expect(shared.text).not.toContain("plaza.png");
  });

  it("comparte igualmente si la foto no se ha podido descargar", async () => {
    // Ya esta en el movil: avisarle de que use el movil no tendria sentido.
    // Se comparte por la via de siempre, con la URL de la foto en el texto.
    enMovil();
    fetchMock.mockImplementation(async (input: string) =>
      String(input).includes("/uploads")
        ? { ok: false, status: 404 }
        : { ok: true, status: 200, json: async () => noticia },
    );
    renderDetail();
    await pulsarCompartir();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(openMock).toHaveBeenCalledTimes(1);
    expect(decodeURIComponent(openMock.mock.calls[0][0] as string)).toContain(
      "plaza.png",
    );
  });
});
