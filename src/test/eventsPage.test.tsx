import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import Events from "../modules/events/Pages/Events";
import { eventReducer } from "../modules/events/Features/eventsSlice";

const eventos = [
  {
    id: 1,
    title: "Fiesta de Verano",
    description: "Celebración organizada por el Ayuntamiento.",
    image: null,
    creationDate: "2026-08-01T10:00:00.000Z",
    eventDate: "2026-09-08T18:00:00.000Z",
    category: "Festivo",
  },
  {
    id: 2,
    title: "Carrera popular",
    description: "Circuito urbano de 10 km.",
    image: null,
    creationDate: "2026-08-01T10:00:00.000Z",
    eventDate: "2026-10-19T09:00:00.000Z",
    category: "Deportivo",
  },
  // Fechas deliberadamente lejanas para que el resultado no dependa del dia en
  // que se ejecuten los tests.
  {
    id: 3,
    title: "Procesión del año pasado",
    description: "Ya celebrada.",
    image: null,
    creationDate: "2020-01-01T10:00:00.000Z",
    eventDate: "2020-05-15T19:00:00.000Z",
    category: "Religioso",
  },
];

beforeEach(() => {
  vi.stubEnv("VITE_API_URL", "http://api.test");
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: true, status: 200, json: async () => eventos })),
  );
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const renderEvents = () =>
  render(
    <Provider store={configureStore({ reducer: { eventsSlice: eventReducer } })}>
      <MemoryRouter>
        <Events />
      </MemoryRouter>
    </Provider>,
  );

describe("Events - la etiqueta de cada tarjeta", () => {
  it("muestra la categoria del evento en lugar de PUBLICADO", async () => {
    renderEvents();

    expect(await screen.findByText("Festivo")).toBeInTheDocument();
    expect(screen.getByText("Deportivo")).toBeInTheDocument();
    expect(screen.queryByText("PUBLICADO")).not.toBeInTheDocument();
  });

  it("muestra la fecha del evento como dia/mes/año", async () => {
    renderEvents();

    expect(await screen.findByText("08/09/2026")).toBeInTheDocument();
    expect(screen.getByText("19/10/2026")).toBeInTheDocument();
  });
});

describe("Events - los eventos ya celebrados", () => {
  it("marca como finalizado solo el evento cuya fecha ha pasado", async () => {
    renderEvents();
    await screen.findByText("Procesión del año pasado");

    expect(screen.getAllByText("Finalizado")).toHaveLength(1);
  });

  it("no marca los eventos que estan por llegar", async () => {
    renderEvents();
    const pasado = await screen.findByText("Procesión del año pasado");
    const futuro = screen.getByText("Carrera popular");

    expect(pasado.closest("article")).toHaveTextContent("Finalizado");
    expect(futuro.closest("article")).not.toHaveTextContent("Finalizado");
  });
});
