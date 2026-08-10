import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import {
  bookingReducer,
  clearBookingId,
} from "../modules/bookings/Features/bookingsSlice";
import {
  createBookingThunk,
  deleteBookingThunk,
  getAllBookingsThunk,
  getBookingByIdThunk,
  updateBookingThunk,
} from "../modules/bookings/Features/bookingsThunks";
import type {
  BookingInput,
  BookingInterface,
  BookingStatus,
} from "../modules/bookings/Interfaces/bookingsInterface";

// ---------------------------------------------------------------------------
// Helpers y fixtures
// ---------------------------------------------------------------------------

const API_URL = "http://api.test";

const bookingFixture: BookingInterface = {
  id: 1,
  name: "Pablo López",
  phone: "600123456",
  startDate: "2026-09-01",
  endDate: "2026-09-05",
  state: "pending",
  notes: "Reserva del salón de actos",
  createDate: "2026-08-03",
};

const otherBookingFixture: BookingInterface = {
  id: 2,
  name: "María Ruiz",
  phone: "611987654",
  startDate: "2026-10-10",
  endDate: "2026-10-12",
  state: "reserved",
  notes: "Reserva del polideportivo",
  createDate: "2026-08-03",
};

const bookingInput: BookingInput = {
  name: "Pablo López",
  phone: "600123456",
  startDate: "2026-09-01",
  endDate: "2026-09-05",
  state: "pending",
  notes: "Reserva del salón de actos",
};

/** Store aislado con solo el slice de bookings, uno nuevo por test. */
const makeStore = () =>
  configureStore({ reducer: { bookingsSlice: bookingReducer } });

/** Estado del slice tal y como lo deja el initialState. */
const initialState = (): BookingStatus =>
  bookingReducer(undefined, { type: "@@test/unknown" });

const okResponse = (body: unknown) =>
  ({ ok: true, status: 200, json: async () => body }) as unknown as Response;

const errorResponse = (body: unknown, status = 400) =>
  ({ ok: false, status, json: async () => body }) as unknown as Response;

/** El fetch mockeado. Se reasigna en cada test desde el beforeEach. */
let fetchMock: ReturnType<typeof vi.fn>;

/** Devuelve las opciones (method, body...) de la n-ésima llamada a fetch. */
const fetchInit = (call = 0): RequestInit =>
  fetchMock.mock.calls[call][1] as RequestInit;

/** Devuelve el cuerpo JSON enviado en la n-ésima llamada a fetch. */
const sentJson = (call = 0): Record<string, unknown> =>
  JSON.parse(fetchInit(call).body as string);

/** Lee una cabecera enviada en la n-ésima llamada a fetch. */
const sentHeader = (name: string, call = 0): string | null =>
  new Headers(fetchInit(call).headers).get(name);

beforeEach(() => {
  vi.stubEnv("VITE_API_URL", API_URL);
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  // apiFetch lee el token de localStorage: cada test arranca sin sesion.
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// Estado inicial y reducers sincronos
// ---------------------------------------------------------------------------

describe("bookingSlice - estado inicial", () => {
  it("arranca sin reservas y con todos los status en idle", () => {
    expect(initialState()).toEqual({
      bookings: [],
      bookingsById: null,
      getAllBookingsStatus: "idle",
      getAllBookingsError: undefined,
      getBookingsByIdStatus: "idle",
      getBookingsByIdError: undefined,
      createBookingsStatus: "idle",
      createBookingsError: undefined,
      updateBookingsStatus: "idle",
      updateBookingsError: undefined,
      deleteBookingsStatus: "idle",
      deleteBookingsError: undefined,
    });
  });
});

describe("bookingSlice - clearBookingId", () => {
  it("limpia la reserva seleccionada", () => {
    const previous: BookingStatus = {
      ...initialState(),
      bookingsById: bookingFixture,
    };

    const state = bookingReducer(previous, clearBookingId());

    expect(state.bookingsById).toBeNull();
  });

  it("no toca el listado de reservas", () => {
    const previous: BookingStatus = {
      ...initialState(),
      bookings: [bookingFixture, otherBookingFixture],
      bookingsById: bookingFixture,
    };

    const state = bookingReducer(previous, clearBookingId());

    expect(state.bookings).toEqual([bookingFixture, otherBookingFixture]);
  });
});

// ---------------------------------------------------------------------------
// getAllBookingsThunk
// ---------------------------------------------------------------------------

describe("getAllBookingsThunk", () => {
  it("pide el listado a GET /bookings", async () => {
    fetchMock.mockResolvedValue(okResponse([bookingFixture]));

    await makeStore().dispatch(getAllBookingsThunk());

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/bookings`);
  });

  it("pasa a pending mientras la peticion esta en vuelo", () => {
    const state = bookingReducer(
      initialState(),
      getAllBookingsThunk.pending("req-id", undefined),
    );

    expect(state.getAllBookingsStatus).toBe("pending");
  });

  it("guarda las reservas recibidas al resolverse", async () => {
    fetchMock.mockResolvedValue(
      okResponse([bookingFixture, otherBookingFixture]),
    );
    const store = makeStore();

    await store.dispatch(getAllBookingsThunk());
    const state = store.getState().bookingsSlice;

    expect(state.getAllBookingsStatus).toBe("fulfilled");
    expect(state.bookings).toEqual([bookingFixture, otherBookingFixture]);
    expect(state.getAllBookingsError).toBeUndefined();
  });

  it("usa el mensaje de error del backend cuando la respuesta no es ok", async () => {
    fetchMock.mockResolvedValue(
      errorResponse({ error: "No hay reservas disponibles" }, 404),
    );
    const store = makeStore();

    await store.dispatch(getAllBookingsThunk());
    const state = store.getState().bookingsSlice;

    expect(state.getAllBookingsStatus).toBe("rejected");
    expect(state.getAllBookingsError).toBe("No hay reservas disponibles");
    expect(state.bookings).toEqual([]);
  });

  it("cae en el mensaje por defecto si el backend no manda error", async () => {
    fetchMock.mockResolvedValue(errorResponse({}, 500));
    const store = makeStore();

    await store.dispatch(getAllBookingsThunk());

    expect(store.getState().bookingsSlice.getAllBookingsError).toBe(
      "Error al obtener todas las reservas.",
    );
  });

  it("rechaza con mensaje de conexion si fetch lanza", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const store = makeStore();

    await store.dispatch(getAllBookingsThunk());
    const state = store.getState().bookingsSlice;

    expect(state.getAllBookingsStatus).toBe("rejected");
    expect(state.getAllBookingsError).toBe(
      "Error al obtener todas las reservas",
    );
  });

  it("limpia un error previo cuando el reintento va bien", () => {
    const previous: BookingStatus = {
      ...initialState(),
      getAllBookingsStatus: "rejected",
      getAllBookingsError: "Error anterior",
    };

    const state = bookingReducer(
      previous,
      getAllBookingsThunk.fulfilled([bookingFixture], "req-id", undefined),
    );

    expect(state.getAllBookingsStatus).toBe("fulfilled");
    expect(state.getAllBookingsError).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getBookingByIdThunk
// ---------------------------------------------------------------------------

describe("getBookingByIdThunk", () => {
  it("pide la reserva a GET /bookings/:id", async () => {
    fetchMock.mockResolvedValue(okResponse(bookingFixture));

    await makeStore().dispatch(getBookingByIdThunk(7));

    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/bookings/7`);
  });

  it("pasa a pending mientras la peticion esta en vuelo", () => {
    const state = bookingReducer(
      initialState(),
      getBookingByIdThunk.pending("req-id", 1),
    );

    expect(state.getBookingsByIdStatus).toBe("pending");
  });

  it("guarda la reserva recibida en bookingsById", async () => {
    fetchMock.mockResolvedValue(okResponse(bookingFixture));
    const store = makeStore();

    await store.dispatch(getBookingByIdThunk(1));
    const state = store.getState().bookingsSlice;

    expect(state.getBookingsByIdStatus).toBe("fulfilled");
    expect(state.bookingsById).toEqual(bookingFixture);
    expect(state.getBookingsByIdError).toBeUndefined();
  });

  it("usa el mensaje de error del backend cuando la reserva no existe", async () => {
    fetchMock.mockResolvedValue(
      errorResponse({ error: "Reserva no encontrada" }, 404),
    );
    const store = makeStore();

    await store.dispatch(getBookingByIdThunk(99));
    const state = store.getState().bookingsSlice;

    expect(state.getBookingsByIdStatus).toBe("rejected");
    expect(state.getBookingsByIdError).toBe("Reserva no encontrada");
    expect(state.bookingsById).toBeNull();
  });

  it("cae en el mensaje por defecto si el backend no manda error", async () => {
    fetchMock.mockResolvedValue(errorResponse({}, 500));
    const store = makeStore();

    await store.dispatch(getBookingByIdThunk(1));

    expect(store.getState().bookingsSlice.getBookingsByIdError).toBe(
      "Error al obtener una única reserva.",
    );
  });

  it("rechaza con mensaje de conexion si fetch lanza", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const store = makeStore();

    await store.dispatch(getBookingByIdThunk(1));

    expect(store.getState().bookingsSlice.getBookingsByIdError).toBe(
      "Error al obtener una única reserva",
    );
  });
});

// ---------------------------------------------------------------------------
// createBookingThunk
// ---------------------------------------------------------------------------

describe("createBookingThunk", () => {
  it("hace POST a /bookings", async () => {
    fetchMock.mockResolvedValue(okResponse(bookingFixture));

    await makeStore().dispatch(createBookingThunk(bookingInput));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/bookings`);
    expect(fetchInit().method).toBe("POST");
  });

  // La API solo monta express.json() en /bookings: con FormData el body llega
  // vacio al servidor y la creacion responde un 500.
  it("envia el formulario como JSON con los nombres de campo de la API", async () => {
    fetchMock.mockResolvedValue(okResponse(bookingFixture));

    await makeStore().dispatch(createBookingThunk(bookingInput));

    expect(sentHeader("Content-Type")).toBe("application/json");
    expect(sentJson()).toEqual({
      name: bookingInput.name,
      phone: bookingInput.phone,
      startDate: bookingInput.startDate,
      endDate: bookingInput.endDate,
      notes: bookingInput.notes,
    });
  });

  it("pasa a pending mientras la peticion esta en vuelo", () => {
    const state = bookingReducer(
      initialState(),
      createBookingThunk.pending("req-id", bookingInput),
    );

    expect(state.createBookingsStatus).toBe("pending");
  });

  it("devuelve la reserva creada resuelta, no una promesa", async () => {
    fetchMock.mockResolvedValue(okResponse(bookingFixture));

    const action = await makeStore().dispatch(createBookingThunk(bookingInput));

    expect(action.payload).toEqual(bookingFixture);
    expect(action.payload).not.toBeInstanceOf(Promise);
  });

  it("guarda la reserva creada y la añade al listado", async () => {
    fetchMock
      .mockResolvedValueOnce(okResponse([otherBookingFixture]))
      .mockResolvedValueOnce(okResponse(bookingFixture));
    const store = makeStore();

    await store.dispatch(getAllBookingsThunk());
    await store.dispatch(createBookingThunk(bookingInput));
    const state = store.getState().bookingsSlice;

    expect(state.createBookingsStatus).toBe("fulfilled");
    expect(state.bookingsById).toEqual(bookingFixture);
    expect(state.bookings).toEqual([otherBookingFixture, bookingFixture]);
    expect(state.createBookingsError).toBeUndefined();
  });

  it("usa el mensaje de error del backend cuando la validacion falla", async () => {
    fetchMock.mockResolvedValue(
      errorResponse({ error: "Las fechas se solapan con otra reserva" }, 409),
    );
    const store = makeStore();

    await store.dispatch(createBookingThunk(bookingInput));
    const state = store.getState().bookingsSlice;

    expect(state.createBookingsStatus).toBe("rejected");
    expect(state.createBookingsError).toBe(
      "Las fechas se solapan con otra reserva",
    );
  });

  it("no añade nada al listado si la creacion falla", async () => {
    fetchMock.mockResolvedValue(errorResponse({ error: "Datos invalidos" }));
    const store = makeStore();

    await store.dispatch(createBookingThunk(bookingInput));

    expect(store.getState().bookingsSlice.bookings).toEqual([]);
  });

  it("cae en el mensaje por defecto si el backend no manda error", async () => {
    fetchMock.mockResolvedValue(errorResponse({}, 500));
    const store = makeStore();

    await store.dispatch(createBookingThunk(bookingInput));

    expect(store.getState().bookingsSlice.createBookingsError).toBe(
      "Error al crear la reserva.",
    );
  });

  it("rechaza con mensaje de conexion si fetch lanza", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const store = makeStore();

    await store.dispatch(createBookingThunk(bookingInput));

    expect(store.getState().bookingsSlice.createBookingsError).toBe(
      "Error al crear una nueva reserva.",
    );
  });
});

// ---------------------------------------------------------------------------
// updateBookingThunk
// ---------------------------------------------------------------------------

describe("updateBookingThunk", () => {
  it("hace PUT a /bookings/:id en plural", async () => {
    fetchMock.mockResolvedValue(okResponse(bookingFixture));

    await makeStore().dispatch(
      updateBookingThunk({ id: 1, booking: bookingInput }),
    );

    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/bookings/1`);
    expect(fetchInit().method).toBe("PUT");
  });

  it("envia el formulario como JSON con los nombres de campo de la API", async () => {
    fetchMock.mockResolvedValue(okResponse(bookingFixture));

    await makeStore().dispatch(
      updateBookingThunk({ id: 1, booking: bookingInput }),
    );

    expect(sentHeader("Content-Type")).toBe("application/json");
    expect(sentJson()).toEqual({
      name: bookingInput.name,
      phone: bookingInput.phone,
      startDate: bookingInput.startDate,
      endDate: bookingInput.endDate,
      state: bookingInput.state,
      notes: bookingInput.notes,
    });
  });

  it("pasa a pending mientras la peticion esta en vuelo", () => {
    const state = bookingReducer(
      initialState(),
      updateBookingThunk.pending("req-id", { id: 1, booking: bookingInput }),
    );

    expect(state.updateBookingsStatus).toBe("pending");
  });

  it("reemplaza en el listado la reserva editada dejando el resto igual", () => {
    const previous: BookingStatus = {
      ...initialState(),
      bookings: [bookingFixture, otherBookingFixture],
    };
    const edited: BookingInterface = {
      ...bookingFixture,
      state: "reserved",
      notes: "Confirmada por telefono",
    };

    const state = bookingReducer(
      previous,
      updateBookingThunk.fulfilled(edited, "req-id", {
        id: edited.id,
        booking: bookingInput,
      }),
    );

    expect(state.updateBookingsStatus).toBe("fulfilled");
    expect(state.bookingsById).toEqual(edited);
    expect(state.bookings).toEqual([edited, otherBookingFixture]);
    expect(state.updateBookingsError).toBeUndefined();
  });

  it("no añade la reserva al listado si no estaba cargada", () => {
    const edited: BookingInterface = { ...bookingFixture, id: 42 };

    const state = bookingReducer(
      initialState(),
      updateBookingThunk.fulfilled(edited, "req-id", {
        id: 42,
        booking: bookingInput,
      }),
    );

    expect(state.bookings).toEqual([]);
    expect(state.bookingsById).toEqual(edited);
  });

  it("usa el mensaje de error del backend cuando la edicion falla", async () => {
    fetchMock.mockResolvedValue(
      errorResponse({ error: "La reserva ya esta cancelada" }, 409),
    );
    const store = makeStore();

    await store.dispatch(updateBookingThunk({ id: 1, booking: bookingInput }));
    const state = store.getState().bookingsSlice;

    expect(state.updateBookingsStatus).toBe("rejected");
    expect(state.updateBookingsError).toBe("La reserva ya esta cancelada");
  });

  it("cae en el mensaje por defecto si el backend no manda error", async () => {
    fetchMock.mockResolvedValue(errorResponse({}, 500));
    const store = makeStore();

    await store.dispatch(updateBookingThunk({ id: 1, booking: bookingInput }));

    expect(store.getState().bookingsSlice.updateBookingsError).toBe(
      "Error al editar la reserva.",
    );
  });

  it("rechaza con mensaje de conexion si fetch lanza", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const store = makeStore();

    await store.dispatch(updateBookingThunk({ id: 1, booking: bookingInput }));

    expect(store.getState().bookingsSlice.updateBookingsError).toBe(
      "Error al actualizar la reserva",
    );
  });
});

// ---------------------------------------------------------------------------
// deleteBookingThunk
// ---------------------------------------------------------------------------

describe("deleteBookingThunk", () => {
  it("hace DELETE a /bookings/:id", async () => {
    fetchMock.mockResolvedValue(okResponse(undefined));

    await makeStore().dispatch(deleteBookingThunk(3));

    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/bookings/3`);
    expect(fetchInit().method).toBe("DELETE");
  });

  it("devuelve el id borrado como payload", async () => {
    fetchMock.mockResolvedValue(okResponse(undefined));

    const action = await makeStore().dispatch(deleteBookingThunk(3));

    expect(action.payload).toBe(3);
  });

  it("no intenta parsear el cuerpo, asi un 204 sin body se resuelve bien", async () => {
    const noContent = {
      ok: true,
      status: 204,
      json: async () => {
        throw new SyntaxError("Unexpected end of JSON input");
      },
    } as unknown as Response;
    fetchMock.mockResolvedValue(noContent);
    const store = makeStore();

    await store.dispatch(deleteBookingThunk(1));
    const state = store.getState().bookingsSlice;

    expect(state.deleteBookingsStatus).toBe("fulfilled");
    expect(state.deleteBookingsError).toBeUndefined();
  });

  it("pasa a pending mientras la peticion esta en vuelo", () => {
    const state = bookingReducer(
      initialState(),
      deleteBookingThunk.pending("req-id", 1),
    );

    expect(state.deleteBookingsStatus).toBe("pending");
  });

  it("saca del listado solo la reserva borrada", () => {
    const previous: BookingStatus = {
      ...initialState(),
      bookings: [bookingFixture, otherBookingFixture],
    };

    const state = bookingReducer(
      previous,
      deleteBookingThunk.fulfilled(bookingFixture.id, "req-id", 1),
    );

    expect(state.deleteBookingsStatus).toBe("fulfilled");
    expect(state.bookings).toEqual([otherBookingFixture]);
  });

  it("limpia bookingsById si era la reserva borrada", () => {
    const previous: BookingStatus = {
      ...initialState(),
      bookings: [bookingFixture],
      bookingsById: bookingFixture,
    };

    const state = bookingReducer(
      previous,
      deleteBookingThunk.fulfilled(bookingFixture.id, "req-id", 1),
    );

    expect(state.bookingsById).toBeNull();
  });

  it("mantiene bookingsById si la borrada era otra reserva", () => {
    const previous: BookingStatus = {
      ...initialState(),
      bookings: [bookingFixture, otherBookingFixture],
      bookingsById: otherBookingFixture,
    };

    const state = bookingReducer(
      previous,
      deleteBookingThunk.fulfilled(bookingFixture.id, "req-id", 1),
    );

    expect(state.bookingsById).toEqual(otherBookingFixture);
  });

  it("usa el mensaje de error del backend cuando el borrado falla", async () => {
    fetchMock.mockResolvedValue(
      errorResponse({ error: "No se puede borrar una reserva activa" }, 409),
    );
    const store = makeStore();

    await store.dispatch(deleteBookingThunk(1));
    const state = store.getState().bookingsSlice;

    expect(state.deleteBookingsStatus).toBe("rejected");
    expect(state.deleteBookingsError).toBe(
      "No se puede borrar una reserva activa",
    );
  });

  it("no toca el listado si el borrado falla", async () => {
    fetchMock
      .mockResolvedValueOnce(okResponse([bookingFixture, otherBookingFixture]))
      .mockResolvedValueOnce(errorResponse({ error: "Conflicto" }, 409));
    const store = makeStore();

    await store.dispatch(getAllBookingsThunk());
    await store.dispatch(deleteBookingThunk(1));

    expect(store.getState().bookingsSlice.bookings).toEqual([
      bookingFixture,
      otherBookingFixture,
    ]);
  });

  it("cae en el mensaje por defecto si el backend no manda error", async () => {
    fetchMock.mockResolvedValue(errorResponse({}, 500));
    const store = makeStore();

    await store.dispatch(deleteBookingThunk(1));

    expect(store.getState().bookingsSlice.deleteBookingsError).toBe(
      "Error al intentar eliminar la reserva.",
    );
  });

  it("rechaza con mensaje de conexion si fetch lanza", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const store = makeStore();

    await store.dispatch(deleteBookingThunk(1));

    expect(store.getState().bookingsSlice.deleteBookingsError).toBe(
      "Error al intentar eliminar la reserva.",
    );
  });
});

// ---------------------------------------------------------------------------
// Aislamiento entre operaciones
// ---------------------------------------------------------------------------

describe("bookingSlice - aislamiento entre operaciones", () => {
  it("un fallo al crear no ensucia el status del listado", async () => {
    fetchMock
      .mockResolvedValueOnce(okResponse([bookingFixture]))
      .mockResolvedValueOnce(errorResponse({ error: "Datos invalidos" }));
    const store = makeStore();

    await store.dispatch(getAllBookingsThunk());
    await store.dispatch(createBookingThunk(bookingInput));
    const state = store.getState().bookingsSlice;

    expect(state.createBookingsStatus).toBe("rejected");
    expect(state.getAllBookingsStatus).toBe("fulfilled");
    expect(state.getAllBookingsError).toBeUndefined();
  });

  it("cada thunk tiene su propio prefijo de accion", () => {
    const prefixes = [
      getAllBookingsThunk.pending.type,
      getBookingByIdThunk.pending.type,
      createBookingThunk.pending.type,
      updateBookingThunk.pending.type,
      deleteBookingThunk.pending.type,
    ];

    expect(new Set(prefixes).size).toBe(prefixes.length);
  });
});

// ---------------------------------------------------------------------------
// Autenticacion
// ---------------------------------------------------------------------------

describe("bookings - cabecera Authorization", () => {
  it("adjunta el token cuando hay sesion guardada", async () => {
    localStorage.setItem("dashboard.token", "token-de-prueba");
    fetchMock.mockResolvedValue(okResponse([bookingFixture]));

    await makeStore().dispatch(getAllBookingsThunk());

    expect(sentHeader("Authorization")).toBe("Bearer token-de-prueba");
  });

  it("no manda Authorization si no hay sesion", async () => {
    fetchMock.mockResolvedValue(okResponse([bookingFixture]));

    await makeStore().dispatch(getAllBookingsThunk());

    expect(sentHeader("Authorization")).toBeNull();
  });

  it("adjunta el token tambien en las mutaciones", async () => {
    localStorage.setItem("dashboard.token", "token-de-prueba");
    fetchMock.mockResolvedValue(okResponse(bookingFixture));

    await makeStore().dispatch(createBookingThunk(bookingInput));

    expect(sentHeader("Authorization")).toBe("Bearer token-de-prueba");
  });
});
