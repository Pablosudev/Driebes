import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import Home from "../modules/Home";
import { eventReducer } from "../modules/events/Features/eventsSlice";
import { jobReducer } from "../modules/jobs/Features/jobsSlice";
import { bookingReducer } from "../modules/bookings/Features/bookingsSlice";
import { newsReducer } from "../modules/news/Features/newsSlice";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeStore = () =>
  configureStore({
    reducer: {
      eventsSlice: eventReducer,
      jobsSlice: jobReducer,
      bookingsSlice: bookingReducer,
      newsSlice: newsReducer,
    },
  });

const renderHome = () =>
  render(
    <Provider store={makeStore()}>
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    </Provider>,
  );

/** El enlace de una tarjeta, localizado por su aria-label. */
const tarjeta = (label: string) =>
  screen.getByRole("link", { name: `Ver ${label}` });

beforeEach(() => {
  vi.stubEnv("VITE_API_URL", "http://api.test");
  // El Home pide los tres listados al montar; aqui solo interesan los enlaces.
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => [],
    })),
  );
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Home - tarjetas de resumen", () => {
  it("enlaza cada tarjeta con su seccion", () => {
    renderHome();

    expect(tarjeta("Eventos")).toHaveAttribute("href", "/eventos");
    expect(tarjeta("Trabajos")).toHaveAttribute("href", "/ofertas");
    expect(tarjeta("Reservas")).toHaveAttribute("href", "/reservas");
  });

  it("pinta las tres tarjetas como enlaces navegables", () => {
    renderHome();

    expect(screen.getAllByRole("link")).toHaveLength(3);
  });
});