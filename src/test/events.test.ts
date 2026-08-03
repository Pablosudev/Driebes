import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import {
  clearEventId,
  eventReducer,
} from "../modules/events/Features/eventsSlice";
import {
  createEventThunk,
  deleteEventThunk,
  getEventByIdThunk,
  getEventsThunk,
  updateEventThunk,
} from "../modules/events/Features/eventsThunks";
import type {
  EventFormInput,
  EventInterface,
  EventStatus,
} from "../modules/events/Interfaces/EventsInterface";

// ---------------------------------------------------------------------------
// Helpers y fixtures
// ---------------------------------------------------------------------------

const API_URL = "http://api.test";

const eventFixture: EventInterface = {
  id: 1,
  title: "Fiestas patronales",
  description: "Programa completo de las fiestas del municipio",
  image: "/uploads/events/cartel.png",
  creationDate: "2026-08-03",
  eventDate: "2026-09-08",
  category: "festive",
};

const otherEventFixture: EventInterface = {
  id: 2,
  title: "Carrera popular",
  description: "Circuito urbano de 10 km",
  image: null,
  creationDate: "2026-08-03",
  eventDate: "2026-10-19",
  category: "sports",
};

/** Formulario sin imagen: el caso mas comun al editar. */
const eventFormInput: EventFormInput = {
  title: "Fiestas patronales",
  description: "Programa completo de las fiestas del municipio",
  eventDate: "2026-09-08",
  category: "festive",
  image: null,
};

const makeImage = () =>
  new File(["contenido del cartel"], "cartel.png", { type: "image/png" });

/** Store aislado con solo el slice de events, uno nuevo por test. */
const makeStore = () =>
  configureStore({ reducer: { eventsSlice: eventReducer } });

/** Estado del slice tal y como lo deja el initialState. */
const initialState = (): EventStatus =>
  eventReducer(undefined, { type: "@@test/unknown" });

const okResponse = (body: unknown) =>
  ({ ok: true, status: 200, json: async () => body }) as unknown as Response;

const errorResponse = (body: unknown, status = 400) =>
  ({ ok: false, status, json: async () => body }) as unknown as Response;

/** El fetch mockeado. Se reasigna en cada test desde el beforeEach. */
let fetchMock: ReturnType<typeof vi.fn>;

/** Devuelve las opciones (method, body...) de la n-ésima llamada a fetch. */
const fetchInit = (call = 0): RequestInit =>
  fetchMock.mock.calls[call][1] as RequestInit;

/** Devuelve el FormData enviado en la n-ésima llamada a fetch. */
const sentFormData = (call = 0): FormData => fetchInit(call).body as FormData;

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

describe("eventSlice - estado inicial", () => {
  it("arranca sin eventos y con todos los status en idle", () => {
    expect(initialState()).toEqual({
      events: [],
      eventById: null,
      getEventsStatus: "idle",
      getEventsError: undefined,
      getEventByIdStatus: "idle",
      getEventByIdError: undefined,
      createEventStatus: "idle",
      createEventError: undefined,
      updateEventStatus: "idle",
      updateEventError: undefined,
      deleteEventStatus: "idle",
      deleteEventError: undefined,
    });
  });
});

describe("eventSlice - clearEventId", () => {
  it("limpia el evento seleccionado", () => {
    const previous: EventStatus = {
      ...initialState(),
      eventById: eventFixture,
    };

    const state = eventReducer(previous, clearEventId());

    expect(state.eventById).toBeNull();
  });

  it("no toca el listado de eventos", () => {
    const previous: EventStatus = {
      ...initialState(),
      events: [eventFixture, otherEventFixture],
      eventById: eventFixture,
    };

    const state = eventReducer(previous, clearEventId());

    expect(state.events).toEqual([eventFixture, otherEventFixture]);
  });
});

// ---------------------------------------------------------------------------
// getEventsThunk
// ---------------------------------------------------------------------------

describe("getEventsThunk", () => {
  it("pide el listado a GET /events", async () => {
    fetchMock.mockResolvedValue(okResponse([eventFixture]));

    await makeStore().dispatch(getEventsThunk());

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/events`);
  });

  it("pasa a pending mientras la peticion esta en vuelo", () => {
    const state = eventReducer(
      initialState(),
      getEventsThunk.pending("req-id", undefined),
    );

    expect(state.getEventsStatus).toBe("pending");
  });

  it("guarda los eventos recibidos al resolverse", async () => {
    fetchMock.mockResolvedValue(okResponse([eventFixture, otherEventFixture]));
    const store = makeStore();

    await store.dispatch(getEventsThunk());
    const state = store.getState().eventsSlice;

    expect(state.getEventsStatus).toBe("fulfilled");
    expect(state.events).toEqual([eventFixture, otherEventFixture]);
    expect(state.getEventsError).toBeUndefined();
  });

  it("usa el mensaje de error del backend cuando la respuesta no es ok", async () => {
    fetchMock.mockResolvedValue(
      errorResponse({ error: "No hay eventos publicados" }, 404),
    );
    const store = makeStore();

    await store.dispatch(getEventsThunk());
    const state = store.getState().eventsSlice;

    expect(state.getEventsStatus).toBe("rejected");
    expect(state.getEventsError).toBe("No hay eventos publicados");
    expect(state.events).toEqual([]);
  });

  it("cae en el mensaje por defecto si el backend no manda error", async () => {
    fetchMock.mockResolvedValue(errorResponse({}, 500));
    const store = makeStore();

    await store.dispatch(getEventsThunk());

    expect(store.getState().eventsSlice.getEventsError).toBe(
      "Error al obtener todos los eventos",
    );
  });

  it("rechaza si fetch lanza", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const store = makeStore();

    await store.dispatch(getEventsThunk());
    const state = store.getState().eventsSlice;

    expect(state.getEventsStatus).toBe("rejected");
    expect(state.getEventsError).toBe("Error al obtener todos los eventos");
  });

  it("limpia un error previo cuando el reintento va bien", () => {
    const previous: EventStatus = {
      ...initialState(),
      getEventsStatus: "rejected",
      getEventsError: "Error anterior",
    };

    const state = eventReducer(
      previous,
      getEventsThunk.fulfilled([eventFixture], "req-id", undefined),
    );

    expect(state.getEventsStatus).toBe("fulfilled");
    expect(state.getEventsError).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getEventByIdThunk
// ---------------------------------------------------------------------------

describe("getEventByIdThunk", () => {
  it("pide el evento a GET /events/:id", async () => {
    fetchMock.mockResolvedValue(okResponse(eventFixture));

    await makeStore().dispatch(getEventByIdThunk(7));

    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/events/7`);
  });

  it("pasa a pending mientras la peticion esta en vuelo", () => {
    const state = eventReducer(
      initialState(),
      getEventByIdThunk.pending("req-id", 1),
    );

    expect(state.getEventByIdStatus).toBe("pending");
  });

  it("guarda el evento recibido en eventById", async () => {
    fetchMock.mockResolvedValue(okResponse(eventFixture));
    const store = makeStore();

    await store.dispatch(getEventByIdThunk(1));
    const state = store.getState().eventsSlice;

    expect(state.getEventByIdStatus).toBe("fulfilled");
    expect(state.eventById).toEqual(eventFixture);
    expect(state.getEventByIdError).toBeUndefined();
  });

  it("usa el mensaje de error del backend cuando el evento no existe", async () => {
    fetchMock.mockResolvedValue(
      errorResponse({ error: "Evento no encontrado" }, 404),
    );
    const store = makeStore();

    await store.dispatch(getEventByIdThunk(99));
    const state = store.getState().eventsSlice;

    expect(state.getEventByIdStatus).toBe("rejected");
    expect(state.getEventByIdError).toBe("Evento no encontrado");
    expect(state.eventById).toBeNull();
  });

  it("cae en el mensaje por defecto si el backend no manda error", async () => {
    fetchMock.mockResolvedValue(errorResponse({}, 500));
    const store = makeStore();

    await store.dispatch(getEventByIdThunk(1));

    expect(store.getState().eventsSlice.getEventByIdError).toBe(
      "Error al obtener el evento por id",
    );
  });

  it("rechaza si fetch lanza", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const store = makeStore();

    await store.dispatch(getEventByIdThunk(1));

    expect(store.getState().eventsSlice.getEventByIdError).toBe(
      "Error al obtener el evento por id",
    );
  });
});

// ---------------------------------------------------------------------------
// createEventThunk
// ---------------------------------------------------------------------------

describe("createEventThunk", () => {
  it("hace POST a /events", async () => {
    fetchMock.mockResolvedValue(okResponse(eventFixture));

    await makeStore().dispatch(createEventThunk(eventFormInput));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/events`);
    expect(fetchInit().method).toBe("POST");
  });

  it("envia los cuatro campos de texto como FormData", async () => {
    fetchMock.mockResolvedValue(okResponse(eventFixture));

    await makeStore().dispatch(createEventThunk(eventFormInput));
    const formData = sentFormData();

    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get("title")).toBe(eventFormInput.title);
    expect(formData.get("description")).toBe(eventFormInput.description);
    expect(formData.get("eventDate")).toBe(eventFormInput.eventDate);
    expect(formData.get("category")).toBe(eventFormInput.category);
  });

  it("adjunta la imagen cuando el formulario trae fichero", async () => {
    fetchMock.mockResolvedValue(okResponse(eventFixture));
    const image = makeImage();

    await makeStore().dispatch(
      createEventThunk({ ...eventFormInput, image }),
    );
    const sent = sentFormData().get("image");

    expect(sent).toBeInstanceOf(File);
    expect((sent as File).name).toBe("cartel.png");
  });

  it("omite el campo image cuando no hay fichero", async () => {
    fetchMock.mockResolvedValue(okResponse(eventFixture));

    await makeStore().dispatch(
      createEventThunk({ ...eventFormInput, image: null }),
    );

    expect(sentFormData().has("image")).toBe(false);
  });

  it("pasa a pending mientras la peticion esta en vuelo", () => {
    const state = eventReducer(
      initialState(),
      createEventThunk.pending("req-id", eventFormInput),
    );

    expect(state.createEventStatus).toBe("pending");
  });

  it("guarda el evento creado y lo añade al listado", async () => {
    fetchMock
      .mockResolvedValueOnce(okResponse([otherEventFixture]))
      .mockResolvedValueOnce(okResponse(eventFixture));
    const store = makeStore();

    await store.dispatch(getEventsThunk());
    await store.dispatch(createEventThunk(eventFormInput));
    const state = store.getState().eventsSlice;

    expect(state.createEventStatus).toBe("fulfilled");
    expect(state.eventById).toEqual(eventFixture);
    expect(state.events).toEqual([otherEventFixture, eventFixture]);
    expect(state.createEventError).toBeUndefined();
  });

  it("usa el mensaje de error del backend cuando la validacion falla", async () => {
    fetchMock.mockResolvedValue(
      errorResponse({ error: "La categoria no es valida" }, 400),
    );
    const store = makeStore();

    await store.dispatch(createEventThunk(eventFormInput));
    const state = store.getState().eventsSlice;

    expect(state.createEventStatus).toBe("rejected");
    expect(state.createEventError).toBe("La categoria no es valida");
  });

  it("no añade nada al listado si la creacion falla", async () => {
    fetchMock.mockResolvedValue(errorResponse({ error: "Datos invalidos" }));
    const store = makeStore();

    await store.dispatch(createEventThunk(eventFormInput));

    expect(store.getState().eventsSlice.events).toEqual([]);
  });

  it("cae en el mensaje por defecto si el backend no manda error", async () => {
    fetchMock.mockResolvedValue(errorResponse({}, 500));
    const store = makeStore();

    await store.dispatch(createEventThunk(eventFormInput));

    expect(store.getState().eventsSlice.createEventError).toBe(
      "Error al crear el evento",
    );
  });

  it("rechaza si fetch lanza", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const store = makeStore();

    await store.dispatch(createEventThunk(eventFormInput));

    expect(store.getState().eventsSlice.createEventError).toBe(
      "Error al crear el evento",
    );
  });
});

// ---------------------------------------------------------------------------
// updateEventThunk
// ---------------------------------------------------------------------------

describe("updateEventThunk", () => {
  it("hace PUT a /events/:id", async () => {
    fetchMock.mockResolvedValue(okResponse(eventFixture));

    await makeStore().dispatch(
      updateEventThunk({ id: 1, eventInput: eventFormInput }),
    );

    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/events/1`);
    expect(fetchInit().method).toBe("PUT");
  });

  it("envia los cuatro campos de texto como FormData", async () => {
    fetchMock.mockResolvedValue(okResponse(eventFixture));

    await makeStore().dispatch(
      updateEventThunk({ id: 1, eventInput: eventFormInput }),
    );
    const formData = sentFormData();

    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get("title")).toBe(eventFormInput.title);
    expect(formData.get("description")).toBe(eventFormInput.description);
    expect(formData.get("eventDate")).toBe(eventFormInput.eventDate);
    expect(formData.get("category")).toBe(eventFormInput.category);
  });

  it("adjunta la imagen cuando se sube una nueva", async () => {
    fetchMock.mockResolvedValue(okResponse(eventFixture));
    const image = makeImage();

    await makeStore().dispatch(
      updateEventThunk({ id: 1, eventInput: { ...eventFormInput, image } }),
    );
    const sent = sentFormData().get("image");

    expect(sent).toBeInstanceOf(File);
    expect((sent as File).name).toBe("cartel.png");
  });

  // Caracteriza el contrato actual: sin fichero no se manda el campo, y el
  // backend hace `input.image ?? existing.image`, o sea conserva la que habia.
  // Hoy no existe forma de dejar un evento sin imagen desde el dashboard.
  it("omite el campo image cuando no hay fichero, conservando la imagen previa", async () => {
    fetchMock.mockResolvedValue(okResponse(eventFixture));

    await makeStore().dispatch(
      updateEventThunk({
        id: 1,
        eventInput: { ...eventFormInput, image: null },
      }),
    );

    expect(sentFormData().has("image")).toBe(false);
  });

  it("pasa a pending mientras la peticion esta en vuelo", () => {
    const state = eventReducer(
      initialState(),
      updateEventThunk.pending("req-id", {
        id: 1,
        eventInput: eventFormInput,
      }),
    );

    expect(state.updateEventStatus).toBe("pending");
  });

  it("reemplaza en el listado el evento editado dejando el resto igual", () => {
    const previous: EventStatus = {
      ...initialState(),
      events: [eventFixture, otherEventFixture],
    };
    const edited: EventInterface = {
      ...eventFixture,
      title: "Fiestas patronales 2026",
      category: "other",
    };

    const state = eventReducer(
      previous,
      updateEventThunk.fulfilled(edited, "req-id", {
        id: edited.id,
        eventInput: eventFormInput,
      }),
    );

    expect(state.updateEventStatus).toBe("fulfilled");
    expect(state.eventById).toEqual(edited);
    expect(state.events).toEqual([edited, otherEventFixture]);
    expect(state.updateEventError).toBeUndefined();
  });

  it("no añade el evento al listado si no estaba cargado", () => {
    const edited: EventInterface = { ...eventFixture, id: 42 };

    const state = eventReducer(
      initialState(),
      updateEventThunk.fulfilled(edited, "req-id", {
        id: 42,
        eventInput: eventFormInput,
      }),
    );

    expect(state.events).toEqual([]);
    expect(state.eventById).toEqual(edited);
  });

  it("usa el mensaje de error del backend cuando la edicion falla", async () => {
    fetchMock.mockResolvedValue(
      errorResponse({ error: "Evento no encontrado" }, 404),
    );
    const store = makeStore();

    await store.dispatch(
      updateEventThunk({ id: 1, eventInput: eventFormInput }),
    );
    const state = store.getState().eventsSlice;

    expect(state.updateEventStatus).toBe("rejected");
    expect(state.updateEventError).toBe("Evento no encontrado");
  });

  it("cae en el mensaje por defecto si el backend no manda error", async () => {
    fetchMock.mockResolvedValue(errorResponse({}, 500));
    const store = makeStore();

    await store.dispatch(
      updateEventThunk({ id: 1, eventInput: eventFormInput }),
    );

    expect(store.getState().eventsSlice.updateEventError).toBe(
      "Error al actualizar el evento",
    );
  });

  it("rechaza si fetch lanza", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const store = makeStore();

    await store.dispatch(
      updateEventThunk({ id: 1, eventInput: eventFormInput }),
    );

    expect(store.getState().eventsSlice.updateEventError).toBe(
      "Error al actualizar el evento",
    );
  });
});

// ---------------------------------------------------------------------------
// deleteEventThunk
// ---------------------------------------------------------------------------

describe("deleteEventThunk", () => {
  it("hace DELETE a /events/:id", async () => {
    fetchMock.mockResolvedValue(okResponse(undefined));

    await makeStore().dispatch(deleteEventThunk(3));

    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/events/3`);
    expect(fetchInit().method).toBe("DELETE");
  });

  it("devuelve el id borrado como payload", async () => {
    fetchMock.mockResolvedValue(okResponse(undefined));

    const action = await makeStore().dispatch(deleteEventThunk(3));

    expect(action.payload).toBe(3);
  });

  // La API responde 204 sin cuerpo, asi que el thunk no debe parsear el body.
  it("resuelve bien un 204 sin cuerpo", async () => {
    const noContent = {
      ok: true,
      status: 204,
      json: async () => {
        throw new SyntaxError("Unexpected end of JSON input");
      },
    } as unknown as Response;
    fetchMock.mockResolvedValue(noContent);
    const store = makeStore();

    await store.dispatch(deleteEventThunk(1));
    const state = store.getState().eventsSlice;

    expect(state.deleteEventStatus).toBe("fulfilled");
    expect(state.deleteEventError).toBeUndefined();
  });

  it("pasa a pending mientras la peticion esta en vuelo", () => {
    const state = eventReducer(
      initialState(),
      deleteEventThunk.pending("req-id", 1),
    );

    expect(state.deleteEventStatus).toBe("pending");
  });

  it("saca del listado solo el evento borrado", () => {
    const previous: EventStatus = {
      ...initialState(),
      events: [eventFixture, otherEventFixture],
    };

    const state = eventReducer(
      previous,
      deleteEventThunk.fulfilled(eventFixture.id, "req-id", 1),
    );

    expect(state.deleteEventStatus).toBe("fulfilled");
    expect(state.events).toEqual([otherEventFixture]);
  });

  it("limpia eventById si era el evento borrado", () => {
    const previous: EventStatus = {
      ...initialState(),
      events: [eventFixture],
      eventById: eventFixture,
    };

    const state = eventReducer(
      previous,
      deleteEventThunk.fulfilled(eventFixture.id, "req-id", 1),
    );

    expect(state.eventById).toBeNull();
  });

  it("mantiene eventById si el borrado era otro evento", () => {
    const previous: EventStatus = {
      ...initialState(),
      events: [eventFixture, otherEventFixture],
      eventById: otherEventFixture,
    };

    const state = eventReducer(
      previous,
      deleteEventThunk.fulfilled(eventFixture.id, "req-id", 1),
    );

    expect(state.eventById).toEqual(otherEventFixture);
  });

  it("usa el mensaje de error del backend cuando el borrado falla", async () => {
    fetchMock.mockResolvedValue(
      errorResponse({ error: "Evento no encontrado" }, 404),
    );
    const store = makeStore();

    await store.dispatch(deleteEventThunk(1));
    const state = store.getState().eventsSlice;

    expect(state.deleteEventStatus).toBe("rejected");
    expect(state.deleteEventError).toBe("Evento no encontrado");
  });

  it("no toca el listado si el borrado falla", async () => {
    fetchMock
      .mockResolvedValueOnce(okResponse([eventFixture, otherEventFixture]))
      .mockResolvedValueOnce(errorResponse({ error: "Conflicto" }, 409));
    const store = makeStore();

    await store.dispatch(getEventsThunk());
    await store.dispatch(deleteEventThunk(1));

    expect(store.getState().eventsSlice.events).toEqual([
      eventFixture,
      otherEventFixture,
    ]);
  });

  it("cae en el mensaje por defecto si el backend no manda error", async () => {
    fetchMock.mockResolvedValue(errorResponse({}, 500));
    const store = makeStore();

    await store.dispatch(deleteEventThunk(1));

    expect(store.getState().eventsSlice.deleteEventError).toBe(
      "Error al eliminar el evento",
    );
  });

  it("rechaza si fetch lanza", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const store = makeStore();

    await store.dispatch(deleteEventThunk(1));

    expect(store.getState().eventsSlice.deleteEventError).toBe(
      "Error al eliminar el evento",
    );
  });
});

// ---------------------------------------------------------------------------
// Aislamiento entre operaciones
// ---------------------------------------------------------------------------

describe("eventSlice - aislamiento entre operaciones", () => {
  it("un fallo al crear no ensucia el status del listado", async () => {
    fetchMock
      .mockResolvedValueOnce(okResponse([eventFixture]))
      .mockResolvedValueOnce(errorResponse({ error: "Datos invalidos" }));
    const store = makeStore();

    await store.dispatch(getEventsThunk());
    await store.dispatch(createEventThunk(eventFormInput));
    const state = store.getState().eventsSlice;

    expect(state.createEventStatus).toBe("rejected");
    expect(state.getEventsStatus).toBe("fulfilled");
    expect(state.getEventsError).toBeUndefined();
  });

  it("cada thunk tiene su propio prefijo de accion", () => {
    const prefixes = [
      getEventsThunk.pending.type,
      getEventByIdThunk.pending.type,
      createEventThunk.pending.type,
      updateEventThunk.pending.type,
      deleteEventThunk.pending.type,
    ];

    expect(new Set(prefixes).size).toBe(prefixes.length);
  });
});

// ---------------------------------------------------------------------------
// Autenticacion
// ---------------------------------------------------------------------------

describe("events - cabecera Authorization", () => {
  it("adjunta el token cuando hay sesion guardada", async () => {
    localStorage.setItem("dashboard.token", "token-de-prueba");
    fetchMock.mockResolvedValue(okResponse([eventFixture]));

    await makeStore().dispatch(getEventsThunk());

    expect(sentHeader("Authorization")).toBe("Bearer token-de-prueba");
  });

  it("no manda Authorization si no hay sesion", async () => {
    fetchMock.mockResolvedValue(okResponse([eventFixture]));

    await makeStore().dispatch(getEventsThunk());

    expect(sentHeader("Authorization")).toBeNull();
  });

  // Con FormData no se debe fijar Content-Type: lo pone el navegador con el
  // boundary del multipart.
  it("no fija Content-Type al enviar FormData", async () => {
    localStorage.setItem("dashboard.token", "token-de-prueba");
    fetchMock.mockResolvedValue(okResponse(eventFixture));

    await makeStore().dispatch(createEventThunk(eventFormInput));

    expect(sentHeader("Authorization")).toBe("Bearer token-de-prueba");
    expect(sentHeader("Content-Type")).toBeNull();
  });
});
