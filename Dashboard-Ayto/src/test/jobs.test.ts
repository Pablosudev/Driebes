import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { clearJobId, jobReducer } from "../modules/jobs/Features/jobsSlice";
import {
  createJobThunk,
  deleteJobsThunk,
  getJobsByIdThunk,
  getJobsThunk,
  updateJobThunk,
} from "../modules/jobs/Features/jobsThunks";
import type {
  JobInputInterface,
  JobInterface,
  JobStatus,
} from "../modules/jobs/Interfaces/JobsInterfaces";

// ---------------------------------------------------------------------------
// Helpers y fixtures
// ---------------------------------------------------------------------------

const API_URL = "http://api.test";

const jobFixture: JobInterface = {
  id: 1,
  title: "Auxiliar administrativo",
  description: "Apoyo en la gestion de expedientes municipales",
  requirements: "Grado medio en administracion y 2 años de experiencia",
  companyName: "Ayuntamiento",
  phone: "600123456",
  email: "rrhh@ayuntamiento.es",
  createDate: "2026-08-03",
};

const otherJobFixture: JobInterface = {
  id: 2,
  title: "Socorrista de piscina municipal",
  description: "Vigilancia de la piscina durante la temporada de verano",
  requirements: "Titulo de socorrismo en vigor",
  companyName: "Ayuntamiento",
  phone: null,
  email: null,
  createDate: "2026-08-03",
};

const jobInput: JobInputInterface = {
  title: "Auxiliar administrativo",
  description: "Apoyo en la gestion de expedientes municipales",
  requirements: "Grado medio en administracion y 2 años de experiencia",
  companyName: "Ayuntamiento",
  phone: "600123456",
  email: "rrhh@ayuntamiento.es",
};

/** Store aislado con solo el slice de jobs, uno nuevo por test. */
const makeStore = () => configureStore({ reducer: { jobsSlice: jobReducer } });

/** Estado del slice tal y como lo deja el initialState. */
const initialState = (): JobStatus =>
  jobReducer(undefined, { type: "@@test/unknown" });

const okResponse = (body: unknown) =>
  ({ ok: true, status: 200, json: async () => body }) as unknown as Response;

const errorResponse = (body: unknown, status = 400) =>
  ({ ok: false, status, json: async () => body }) as unknown as Response;

/** El fetch mockeado. Se reasigna en cada test desde el beforeEach. */
let fetchMock: ReturnType<typeof vi.fn>;

/** Devuelve las opciones (method, headers, body...) de la n-ésima llamada. */
const fetchInit = (call = 0): RequestInit =>
  fetchMock.mock.calls[call][1] as RequestInit;

/**
 * Devuelve el cuerpo JSON enviado en la n-ésima llamada a fetch.
 *
 * Las ofertas no llevan imagen, asi que viajan como JSON y no como multipart:
 * el router de la API lee `req.body` sin parser de multipart.
 */
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

describe("jobSlice - estado inicial", () => {
  it("arranca sin ofertas y con todos los status en idle", () => {
    expect(initialState()).toEqual({
      jobs: [],
      jobById: null,
      getJobsStatus: "idle",
      getJobsError: undefined,
      getJobByIdStatus: "idle",
      getJobByIdError: undefined,
      createJobStatus: "idle",
      createJobError: undefined,
      updateJobStatus: "idle",
      updateJobError: undefined,
      deleteJobStatus: "idle",
      deleteJobError: undefined,
    });
  });

  // El campo estaba tipado como la tupla vacia `[]`, lo que impedia guardar
  // cualquier listado. Este test fija que acepta ofertas de verdad.
  it("admite un listado de ofertas en el campo jobs", () => {
    const state = jobReducer(
      initialState(),
      getJobsThunk.fulfilled([jobFixture, otherJobFixture], "req-id", undefined),
    );

    expect(state.jobs).toHaveLength(2);
  });
});

describe("jobSlice - clearJobId", () => {
  it("limpia la oferta seleccionada", () => {
    const previous: JobStatus = { ...initialState(), jobById: jobFixture };

    const state = jobReducer(previous, clearJobId());

    expect(state.jobById).toBeNull();
  });

  it("no toca el listado de ofertas", () => {
    const previous: JobStatus = {
      ...initialState(),
      jobs: [jobFixture, otherJobFixture],
      jobById: jobFixture,
    };

    const state = jobReducer(previous, clearJobId());

    expect(state.jobs).toEqual([jobFixture, otherJobFixture]);
  });
});

// ---------------------------------------------------------------------------
// getJobsThunk
// ---------------------------------------------------------------------------

describe("getJobsThunk", () => {
  it("pide el listado a GET /jobs", async () => {
    fetchMock.mockResolvedValue(okResponse([jobFixture]));

    await makeStore().dispatch(getJobsThunk());

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/jobs`);
  });

  it("pasa a pending mientras la peticion esta en vuelo", () => {
    const state = jobReducer(
      initialState(),
      getJobsThunk.pending("req-id", undefined),
    );

    expect(state.getJobsStatus).toBe("pending");
  });

  it("guarda las ofertas recibidas al resolverse", async () => {
    fetchMock.mockResolvedValue(okResponse([jobFixture, otherJobFixture]));
    const store = makeStore();

    await store.dispatch(getJobsThunk());
    const state = store.getState().jobsSlice;

    expect(state.getJobsStatus).toBe("fulfilled");
    expect(state.jobs).toEqual([jobFixture, otherJobFixture]);
    expect(state.getJobsError).toBeUndefined();
  });

  it("usa el mensaje de error del backend cuando la respuesta no es ok", async () => {
    fetchMock.mockResolvedValue(
      errorResponse({ error: "No hay ofertas publicadas" }, 404),
    );
    const store = makeStore();

    await store.dispatch(getJobsThunk());
    const state = store.getState().jobsSlice;

    expect(state.getJobsStatus).toBe("rejected");
    expect(state.getJobsError).toBe("No hay ofertas publicadas");
    expect(state.jobs).toEqual([]);
  });

  // Los thunks de jobs leen `error`, no `message`: si el backend devolviera
  // `{ message }` el mensaje se perderia y caeriamos en el texto por defecto.
  it("cae en el mensaje por defecto si el backend no manda el campo error", async () => {
    fetchMock.mockResolvedValue(errorResponse({ message: "Otro campo" }, 500));
    const store = makeStore();

    await store.dispatch(getJobsThunk());

    expect(store.getState().jobsSlice.getJobsError).toBe(
      "Error al obtener todos los trabajos",
    );
  });

  it("rechaza con el mensaje de conexion si fetch lanza", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const store = makeStore();

    await store.dispatch(getJobsThunk());
    const state = store.getState().jobsSlice;

    expect(state.getJobsStatus).toBe("rejected");
    expect(state.getJobsError).toBe("Error al obtener todos los trabajos.");
  });

  it("limpia un error previo cuando el reintento va bien", () => {
    const previous: JobStatus = {
      ...initialState(),
      getJobsStatus: "rejected",
      getJobsError: "Error anterior",
    };

    const state = jobReducer(
      previous,
      getJobsThunk.fulfilled([jobFixture], "req-id", undefined),
    );

    expect(state.getJobsStatus).toBe("fulfilled");
    expect(state.getJobsError).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getJobsByIdThunk
// ---------------------------------------------------------------------------

describe("getJobsByIdThunk", () => {
  it("pide la oferta a GET /jobs/:id", async () => {
    fetchMock.mockResolvedValue(okResponse(jobFixture));

    await makeStore().dispatch(getJobsByIdThunk(7));

    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/jobs/7`);
  });

  it("pasa a pending mientras la peticion esta en vuelo", () => {
    const state = jobReducer(
      initialState(),
      getJobsByIdThunk.pending("req-id", 1),
    );

    expect(state.getJobByIdStatus).toBe("pending");
  });

  it("guarda la oferta recibida en jobById", async () => {
    fetchMock.mockResolvedValue(okResponse(jobFixture));
    const store = makeStore();

    await store.dispatch(getJobsByIdThunk(1));
    const state = store.getState().jobsSlice;

    expect(state.getJobByIdStatus).toBe("fulfilled");
    expect(state.jobById).toEqual(jobFixture);
    expect(state.getJobByIdError).toBeUndefined();
  });

  it("usa el mensaje de error del backend cuando la oferta no existe", async () => {
    fetchMock.mockResolvedValue(
      errorResponse({ error: "Oferta no encontrada" }, 404),
    );
    const store = makeStore();

    await store.dispatch(getJobsByIdThunk(99));
    const state = store.getState().jobsSlice;

    expect(state.getJobByIdStatus).toBe("rejected");
    expect(state.getJobByIdError).toBe("Oferta no encontrada");
    expect(state.jobById).toBeNull();
  });

  it("cae en el mensaje por defecto si el backend no manda error", async () => {
    fetchMock.mockResolvedValue(errorResponse({}, 500));
    const store = makeStore();

    await store.dispatch(getJobsByIdThunk(1));

    expect(store.getState().jobsSlice.getJobByIdError).toBe(
      "Error al obtener el trabajo por ID",
    );
  });

  it("rechaza con el mensaje de conexion si fetch lanza", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const store = makeStore();

    await store.dispatch(getJobsByIdThunk(1));

    expect(store.getState().jobsSlice.getJobByIdError).toBe(
      "Error al obtener el trabajo por ID.",
    );
  });
});

// ---------------------------------------------------------------------------
// createJobThunk
// ---------------------------------------------------------------------------

describe("createJobThunk", () => {
  it("hace POST a /jobs", async () => {
    fetchMock.mockResolvedValue(okResponse(jobFixture));

    await makeStore().dispatch(createJobThunk(jobInput));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/jobs`);
    expect(fetchInit().method).toBe("POST");
  });

  it("envia los seis campos como JSON", async () => {
    fetchMock.mockResolvedValue(okResponse(jobFixture));

    await makeStore().dispatch(createJobThunk(jobInput));

    expect(sentJson()).toEqual({
      title: jobInput.title,
      description: jobInput.description,
      requirements: jobInput.requirements,
      companyName: jobInput.companyName,
      phone: jobInput.phone,
      email: jobInput.email,
    });
  });

  it("declara el Content-Type para que la API parsee el cuerpo", async () => {
    // Sin esta cabecera express.json() no procesa el body y req.body llega
    // vacio, asi que se crearia una oferta sin datos.
    fetchMock.mockResolvedValue(okResponse(jobFixture));

    await makeStore().dispatch(createJobThunk(jobInput));

    expect(sentHeader("Content-Type")).toBe("application/json");
  });

  // phone y email son opcionales. Al ir en JSON llegan como null de verdad, no
  // como la cadena "null" en que los convertiria un FormData.
  it("envia phone y email a null cuando no se rellenan", async () => {
    fetchMock.mockResolvedValue(okResponse(otherJobFixture));

    await makeStore().dispatch(
      createJobThunk({ ...jobInput, phone: null, email: null }),
    );

    expect(sentJson().phone).toBeNull();
    expect(sentJson().email).toBeNull();
    expect(sentJson().title).toBe(jobInput.title);
  });

  it("pasa a pending mientras la peticion esta en vuelo", () => {
    const state = jobReducer(
      initialState(),
      createJobThunk.pending("req-id", jobInput),
    );

    expect(state.createJobStatus).toBe("pending");
  });

  it("guarda la oferta creada y la añade al listado", async () => {
    fetchMock
      .mockResolvedValueOnce(okResponse([otherJobFixture]))
      .mockResolvedValueOnce(okResponse(jobFixture));
    const store = makeStore();

    await store.dispatch(getJobsThunk());
    await store.dispatch(createJobThunk(jobInput));
    const state = store.getState().jobsSlice;

    expect(state.createJobStatus).toBe("fulfilled");
    expect(state.jobById).toEqual(jobFixture);
    expect(state.jobs).toEqual([otherJobFixture, jobFixture]);
    expect(state.createJobError).toBeUndefined();
  });

  it("usa el mensaje de error del backend cuando la validacion falla", async () => {
    fetchMock.mockResolvedValue(
      errorResponse({ error: "Comprueba los campos obligatorios" }, 400),
    );
    const store = makeStore();

    await store.dispatch(createJobThunk(jobInput));
    const state = store.getState().jobsSlice;

    expect(state.createJobStatus).toBe("rejected");
    expect(state.createJobError).toBe("Comprueba los campos obligatorios");
  });

  it("no añade nada al listado si la creacion falla", async () => {
    fetchMock.mockResolvedValue(errorResponse({ error: "Datos invalidos" }));
    const store = makeStore();

    await store.dispatch(createJobThunk(jobInput));

    expect(store.getState().jobsSlice.jobs).toEqual([]);
  });

  it("cae en el mensaje por defecto si el backend no manda error", async () => {
    fetchMock.mockResolvedValue(errorResponse({}, 500));
    const store = makeStore();

    await store.dispatch(createJobThunk(jobInput));

    expect(store.getState().jobsSlice.createJobError).toBe(
      "Error al crear el trabajo",
    );
  });

  it("rechaza con el mensaje de conexion si fetch lanza", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const store = makeStore();

    await store.dispatch(createJobThunk(jobInput));

    expect(store.getState().jobsSlice.createJobError).toBe(
      "Error al crear el trabajo.",
    );
  });
});

// ---------------------------------------------------------------------------
// updateJobThunk
// ---------------------------------------------------------------------------

describe("updateJobThunk", () => {
  it("hace PUT a /jobs/:id", async () => {
    fetchMock.mockResolvedValue(okResponse(jobFixture));

    await makeStore().dispatch(updateJobThunk({ id: 1, jobData: jobInput }));

    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/jobs/1`);
    expect(fetchInit().method).toBe("PUT");
  });

  it("envia los seis campos como JSON", async () => {
    fetchMock.mockResolvedValue(okResponse(jobFixture));

    await makeStore().dispatch(updateJobThunk({ id: 1, jobData: jobInput }));

    expect(sentJson()).toEqual({
      title: jobInput.title,
      description: jobInput.description,
      requirements: jobInput.requirements,
      companyName: jobInput.companyName,
      phone: jobInput.phone,
      email: jobInput.email,
    });
    expect(sentHeader("Content-Type")).toBe("application/json");
  });

  it("envia phone y email a null cuando no se rellenan", async () => {
    fetchMock.mockResolvedValue(okResponse(jobFixture));

    await makeStore().dispatch(
      updateJobThunk({
        id: 1,
        jobData: { ...jobInput, phone: null, email: null },
      }),
    );

    expect(sentJson().phone).toBeNull();
    expect(sentJson().email).toBeNull();
  });

  it("pasa a pending mientras la peticion esta en vuelo", () => {
    const state = jobReducer(
      initialState(),
      updateJobThunk.pending("req-id", { id: 1, jobData: jobInput }),
    );

    expect(state.updateJobStatus).toBe("pending");
  });

  it("reemplaza en el listado la oferta editada dejando el resto igual", () => {
    const previous: JobStatus = {
      ...initialState(),
      jobs: [jobFixture, otherJobFixture],
    };
    const edited: JobInterface = {
      ...jobFixture,
      title: "Auxiliar administrativo (media jornada)",
    };

    const state = jobReducer(
      previous,
      updateJobThunk.fulfilled(edited, "req-id", {
        id: edited.id,
        jobData: jobInput,
      }),
    );

    expect(state.updateJobStatus).toBe("fulfilled");
    expect(state.jobById).toEqual(edited);
    expect(state.jobs).toEqual([edited, otherJobFixture]);
    expect(state.updateJobError).toBeUndefined();
  });

  it("no añade la oferta al listado si no estaba cargada", () => {
    const edited: JobInterface = { ...jobFixture, id: 42 };

    const state = jobReducer(
      initialState(),
      updateJobThunk.fulfilled(edited, "req-id", {
        id: 42,
        jobData: jobInput,
      }),
    );

    expect(state.jobs).toEqual([]);
    expect(state.jobById).toEqual(edited);
  });

  it("usa el mensaje de error del backend cuando la edicion falla", async () => {
    fetchMock.mockResolvedValue(
      errorResponse({ error: "Oferta no encontrada" }, 404),
    );
    const store = makeStore();

    await store.dispatch(updateJobThunk({ id: 1, jobData: jobInput }));
    const state = store.getState().jobsSlice;

    expect(state.updateJobStatus).toBe("rejected");
    expect(state.updateJobError).toBe("Oferta no encontrada");
  });

  it("cae en el mensaje por defecto si el backend no manda error", async () => {
    fetchMock.mockResolvedValue(errorResponse({}, 500));
    const store = makeStore();

    await store.dispatch(updateJobThunk({ id: 1, jobData: jobInput }));

    expect(store.getState().jobsSlice.updateJobError).toBe(
      "Error al actualizar el trabajo",
    );
  });

  it("rechaza con el mensaje de conexion si fetch lanza", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const store = makeStore();

    await store.dispatch(updateJobThunk({ id: 1, jobData: jobInput }));

    expect(store.getState().jobsSlice.updateJobError).toBe(
      "Error al actualizar el trabajo.",
    );
  });
});

// ---------------------------------------------------------------------------
// deleteJobsThunk
// ---------------------------------------------------------------------------

describe("deleteJobsThunk", () => {
  // La URL le faltaba la barra: pedia /jobs1 en vez de /jobs/1.
  it("hace DELETE a /jobs/:id con la barra separadora", async () => {
    fetchMock.mockResolvedValue(okResponse(undefined));

    await makeStore().dispatch(deleteJobsThunk(3));

    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/jobs/3`);
    expect(fetchInit().method).toBe("DELETE");
  });

  it("devuelve el id borrado como payload", async () => {
    fetchMock.mockResolvedValue(okResponse(undefined));

    const action = await makeStore().dispatch(deleteJobsThunk(3));

    expect(action.payload).toBe(3);
  });

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

    await store.dispatch(deleteJobsThunk(1));
    const state = store.getState().jobsSlice;

    expect(state.deleteJobStatus).toBe("fulfilled");
    expect(state.deleteJobError).toBeUndefined();
  });

  it("pasa a pending mientras la peticion esta en vuelo", () => {
    const state = jobReducer(
      initialState(),
      deleteJobsThunk.pending("req-id", 1),
    );

    expect(state.deleteJobStatus).toBe("pending");
  });

  it("saca del listado solo la oferta borrada", () => {
    const previous: JobStatus = {
      ...initialState(),
      jobs: [jobFixture, otherJobFixture],
    };

    const state = jobReducer(
      previous,
      deleteJobsThunk.fulfilled(jobFixture.id, "req-id", 1),
    );

    expect(state.deleteJobStatus).toBe("fulfilled");
    expect(state.jobs).toEqual([otherJobFixture]);
  });

  it("limpia jobById si era la oferta borrada", () => {
    const previous: JobStatus = {
      ...initialState(),
      jobs: [jobFixture],
      jobById: jobFixture,
    };

    const state = jobReducer(
      previous,
      deleteJobsThunk.fulfilled(jobFixture.id, "req-id", 1),
    );

    expect(state.jobById).toBeNull();
  });

  it("mantiene jobById si la borrada era otra oferta", () => {
    const previous: JobStatus = {
      ...initialState(),
      jobs: [jobFixture, otherJobFixture],
      jobById: otherJobFixture,
    };

    const state = jobReducer(
      previous,
      deleteJobsThunk.fulfilled(jobFixture.id, "req-id", 1),
    );

    expect(state.jobById).toEqual(otherJobFixture);
  });

  it("usa el mensaje de error del backend cuando el borrado falla", async () => {
    fetchMock.mockResolvedValue(
      errorResponse({ error: "Oferta no encontrada" }, 404),
    );
    const store = makeStore();

    await store.dispatch(deleteJobsThunk(1));
    const state = store.getState().jobsSlice;

    expect(state.deleteJobStatus).toBe("rejected");
    expect(state.deleteJobError).toBe("Oferta no encontrada");
  });

  it("no toca el listado si el borrado falla", async () => {
    fetchMock
      .mockResolvedValueOnce(okResponse([jobFixture, otherJobFixture]))
      .mockResolvedValueOnce(errorResponse({ error: "Conflicto" }, 409));
    const store = makeStore();

    await store.dispatch(getJobsThunk());
    await store.dispatch(deleteJobsThunk(1));

    expect(store.getState().jobsSlice.jobs).toEqual([
      jobFixture,
      otherJobFixture,
    ]);
  });

  it("cae en el mensaje por defecto si el backend no manda error", async () => {
    fetchMock.mockResolvedValue(errorResponse({}, 500));
    const store = makeStore();

    await store.dispatch(deleteJobsThunk(1));

    expect(store.getState().jobsSlice.deleteJobError).toBe(
      "Error al eliminar la oferta de trabajo.",
    );
  });

  it("rechaza con el mensaje de conexion si fetch lanza", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const store = makeStore();

    await store.dispatch(deleteJobsThunk(1));

    expect(store.getState().jobsSlice.deleteJobError).toBe(
      "Error al eliminar la oferta de trabajo.",
    );
  });
});

// ---------------------------------------------------------------------------
// Aislamiento entre operaciones
// ---------------------------------------------------------------------------

describe("jobSlice - aislamiento entre operaciones", () => {
  it("un fallo al crear no ensucia el status del listado", async () => {
    fetchMock
      .mockResolvedValueOnce(okResponse([jobFixture]))
      .mockResolvedValueOnce(errorResponse({ error: "Datos invalidos" }));
    const store = makeStore();

    await store.dispatch(getJobsThunk());
    await store.dispatch(createJobThunk(jobInput));
    const state = store.getState().jobsSlice;

    expect(state.createJobStatus).toBe("rejected");
    expect(state.getJobsStatus).toBe("fulfilled");
    expect(state.getJobsError).toBeUndefined();
  });

  // Los prefijos colisionaban en dos grupos: getAll con create ("/jobs"), y
  // getById con update y delete ("/jobs/:id"). Con eso el slice no construia.
  it("cada thunk tiene su propio prefijo de accion", () => {
    const prefixes = [
      getJobsThunk.pending.type,
      getJobsByIdThunk.pending.type,
      createJobThunk.pending.type,
      updateJobThunk.pending.type,
      deleteJobsThunk.pending.type,
    ];

    expect(new Set(prefixes).size).toBe(prefixes.length);
  });
});

// ---------------------------------------------------------------------------
// Autenticacion
// ---------------------------------------------------------------------------

describe("jobs - cabecera Authorization", () => {
  it("adjunta el token cuando hay sesion guardada", async () => {
    localStorage.setItem("dashboard.token", "token-de-prueba");
    fetchMock.mockResolvedValue(okResponse([jobFixture]));

    await makeStore().dispatch(getJobsThunk());

    expect(sentHeader("Authorization")).toBe("Bearer token-de-prueba");
  });

  it("no manda Authorization si no hay sesion", async () => {
    fetchMock.mockResolvedValue(okResponse([jobFixture]));

    await makeStore().dispatch(getJobsThunk());

    expect(sentHeader("Authorization")).toBeNull();
  });

  // apiFetch añade el token sin pisar las cabeceras que trae el thunk: las dos
  // tienen que llegar juntas.
  it("adjunta el token junto al Content-Type al enviar JSON", async () => {
    localStorage.setItem("dashboard.token", "token-de-prueba");
    fetchMock.mockResolvedValue(okResponse(jobFixture));

    await makeStore().dispatch(createJobThunk(jobInput));

    expect(sentHeader("Authorization")).toBe("Bearer token-de-prueba");
    expect(sentHeader("Content-Type")).toBe("application/json");
  });
});
