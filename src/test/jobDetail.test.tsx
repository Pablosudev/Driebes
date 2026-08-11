import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import JobDetail from "../modules/jobs/Pages/JobDetail";
import { jobReducer } from "../modules/jobs/Features/jobsSlice";

const oferta = {
  id: 3,
  title: "Auxiliar administrativo",
  description: "Apoyo administrativo en el registro municipal.",
  requirements: "Ciclo formativo de grado medio y manejo de ofimática.",
  companyName: "Ayuntamiento de la Villa",
  phone: "600123456",
  email: "empleo@villa.example",
  createDate: "2026-08-05T08:00:00.000Z",
};

let openMock: ReturnType<typeof vi.fn>;

/** Un movil capaz de adjuntar ficheros, para comprobar que aqui da igual. */
const enMovil = () => {
  const share = vi.fn(async (_data: unknown) => {});
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("coarse"),
    media: query,
  }));
  Object.defineProperty(navigator, "canShare", {
    value: () => true,
    configurable: true,
  });
  Object.defineProperty(navigator, "share", { value: share, configurable: true });
  return share;
};

beforeEach(() => {
  vi.stubEnv("VITE_API_URL", "http://api.test");
  vi.stubEnv("VITE_PUBLIC_SITE_URL", "");
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: true, status: 200, json: async () => oferta })),
  );
  openMock = vi.fn();
  vi.stubGlobal("open", openMock);
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
  }));
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  Reflect.deleteProperty(navigator, "canShare");
  Reflect.deleteProperty(navigator, "share");
});

const renderDetail = () =>
  render(
    <Provider store={configureStore({ reducer: { jobsSlice: jobReducer } })}>
      <MemoryRouter initialEntries={["/ofertas/3"]}>
        <Routes>
          <Route path="/ofertas/:id" element={<JobDetail />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

/** Pulsa el boton de compartir, ya con la oferta cargada. */
const pulsarCompartir = async () =>
  userEvent.click(
    await screen.findByRole("button", { name: "Compartir por WhatsApp" }),
  );

/** El mensaje que se ha enviado a WhatsApp, ya decodificado. */
const mensajeCompartido = (): string =>
  decodeURIComponent(openMock.mock.calls[0][0] as string);

describe("JobDetail - compartir por WhatsApp", () => {
  it("abre WhatsApp con el mensaje de la oferta", async () => {
    renderDetail();
    await pulsarCompartir();

    expect(openMock).toHaveBeenCalledTimes(1);
    expect(mensajeCompartido()).toContain("Auxiliar administrativo");
    expect(mensajeCompartido()).toContain("Empresa: Ayuntamiento de la Villa");
  });

  it("comparte sin ningun aviso previo", async () => {
    // Las ofertas no tienen imagen: compartir desde el ordenador da el mismo
    // resultado que desde el movil, asi que el aviso no aplica.
    renderDetail();
    await pulsarCompartir();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("comparte igual desde un movil, sin intentar adjuntar nada", async () => {
    const share = enMovil();
    renderDetail();
    await pulsarCompartir();

    expect(share).not.toHaveBeenCalled();
    expect(openMock).toHaveBeenCalledTimes(1);
  });

  it("incluye los datos de contacto de la oferta", async () => {
    renderDetail();
    await pulsarCompartir();

    expect(mensajeCompartido()).toContain("Teléfono: 600123456");
    expect(mensajeCompartido()).toContain("Email: empleo@villa.example");
  });
});
