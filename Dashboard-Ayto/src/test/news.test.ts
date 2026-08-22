import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import {
  clearNewsId,
  newsReducer,
} from "../modules/news/Features/newsSlice";
import {
  createNewsThunk,
  deleteNewsThunk,
  getNewsByIdThunk,
  getNewsThunk,
  updateNewsThunk,
} from "../modules/news/Features/newsThunks";
import type {
  NewsFormInput,
  NewsInterface,
  NewsStatus,
} from "../modules/news/Interfaces/newsInterface";

// ---------------------------------------------------------------------------
// Helpers y fixtures
// ---------------------------------------------------------------------------

const API_URL = "http://api.test";

const newsFixture: NewsInterface = {
  id: 1,
  title: "Obras en la plaza mayor",
  description: "Comienzan las obras de remodelacion de la plaza mayor",
  image: "/uploads/news/plaza.png",
  uploadDate: "2026-08-03",
};

const otherNewsFixture: NewsInterface = {
  id: 2,
  title: "Nuevo horario de la biblioteca",
  description: "La biblioteca municipal amplia su horario de tardes",
  image: null,
  uploadDate: "2026-08-03",
};

/** Formulario sin imagen: el caso mas comun al editar. */
const newsFormInput: NewsFormInput = {
  title: "Obras en la plaza mayor",
  description: "Comienzan las obras de remodelacion de la plaza mayor",
  image: null,
};

const makeImage = () =>
  new File(["contenido de la foto"], "plaza.png", { type: "image/png" });

/** Store aislado con solo el slice de news, uno nuevo por test. */
const makeStore = () => configureStore({ reducer: { newsSlice: newsReducer } });

/** Estado del slice tal y como lo deja el initialState. */
const initialState = (): NewsStatus =>
  newsReducer(undefined, { type: "@@test/unknown" });

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

describe("newsSlice - estado inicial", () => {
  it("arranca sin noticias y con todos los status en idle", () => {
    expect(initialState()).toEqual({
      news: [],
      newsById: null,
      getAllNewsStatus: "idle",
      getAllNewsError: undefined,
      getNewsByIdStatus: "idle",
      getNewsByIdError: undefined,
      createNewsStatus: "idle",
      createNewsError: undefined,
      updateNewsStatus: "idle",
      updateNewsError: undefined,
      deleteNewsStatus: "idle",
      deleteNewsError: undefined,
    });
  });
});

describe("newsSlice - clearNewsId", () => {
  it("limpia la noticia seleccionada", () => {
    const previous: NewsStatus = {
      ...initialState(),
      newsById: newsFixture,
    };

    const state = newsReducer(previous, clearNewsId());

    expect(state.newsById).toBeNull();
  });

  it("no toca el listado de noticias", () => {
    const previous: NewsStatus = {
      ...initialState(),
      news: [newsFixture, otherNewsFixture],
      newsById: newsFixture,
    };

    const state = newsReducer(previous, clearNewsId());

    expect(state.news).toEqual([newsFixture, otherNewsFixture]);
  });
});

// ---------------------------------------------------------------------------
// getNewsThunk
// ---------------------------------------------------------------------------

describe("getNewsThunk", () => {
  it("pide el listado a GET /news", async () => {
    fetchMock.mockResolvedValue(okResponse([newsFixture]));

    await makeStore().dispatch(getNewsThunk());

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/news`);
  });

  it("pasa a pending mientras la peticion esta en vuelo", () => {
    const state = newsReducer(
      initialState(),
      getNewsThunk.pending("req-id", undefined),
    );

    expect(state.getAllNewsStatus).toBe("pending");
  });

  it("guarda las noticias recibidas al resolverse", async () => {
    fetchMock.mockResolvedValue(okResponse([newsFixture, otherNewsFixture]));
    const store = makeStore();

    await store.dispatch(getNewsThunk());
    const state = store.getState().newsSlice;

    expect(state.getAllNewsStatus).toBe("fulfilled");
    expect(state.news).toEqual([newsFixture, otherNewsFixture]);
    expect(state.getAllNewsError).toBeUndefined();
  });

  it("usa el mensaje de error del backend cuando la respuesta no es ok", async () => {
    fetchMock.mockResolvedValue(
      errorResponse({ error: "No hay noticias publicadas" }, 404),
    );
    const store = makeStore();

    await store.dispatch(getNewsThunk());
    const state = store.getState().newsSlice;

    expect(state.getAllNewsStatus).toBe("rejected");
    expect(state.getAllNewsError).toBe("No hay noticias publicadas");
    expect(state.news).toEqual([]);
  });

  it("cae en el mensaje por defecto si el backend no manda error", async () => {
    fetchMock.mockResolvedValue(errorResponse({}, 500));
    const store = makeStore();

    await store.dispatch(getNewsThunk());

    expect(store.getState().newsSlice.getAllNewsError).toBe(
      "Error al obtener todas las noticias",
    );
  });

  it("rechaza si fetch lanza", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const store = makeStore();

    await store.dispatch(getNewsThunk());
    const state = store.getState().newsSlice;

    expect(state.getAllNewsStatus).toBe("rejected");
    expect(state.getAllNewsError).toBe("Error al obtener todas las noticias");
  });

  it("limpia un error previo cuando el reintento va bien", () => {
    const previous: NewsStatus = {
      ...initialState(),
      getAllNewsStatus: "rejected",
      getAllNewsError: "Error anterior",
    };

    const state = newsReducer(
      previous,
      getNewsThunk.fulfilled([newsFixture], "req-id", undefined),
    );

    expect(state.getAllNewsStatus).toBe("fulfilled");
    expect(state.getAllNewsError).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getNewsByIdThunk
// ---------------------------------------------------------------------------

describe("getNewsByIdThunk", () => {
  it("pide la noticia a GET /news/:id", async () => {
    fetchMock.mockResolvedValue(okResponse(newsFixture));

    await makeStore().dispatch(getNewsByIdThunk(7));

    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/news/7`);
  });

  it("pasa a pending mientras la peticion esta en vuelo", () => {
    const state = newsReducer(
      initialState(),
      getNewsByIdThunk.pending("req-id", 1),
    );

    expect(state.getNewsByIdStatus).toBe("pending");
  });

  it("guarda la noticia recibida en newsById", async () => {
    fetchMock.mockResolvedValue(okResponse(newsFixture));
    const store = makeStore();

    await store.dispatch(getNewsByIdThunk(1));
    const state = store.getState().newsSlice;

    expect(state.getNewsByIdStatus).toBe("fulfilled");
    expect(state.newsById).toEqual(newsFixture);
    expect(state.getNewsByIdError).toBeUndefined();
  });

  it("usa el mensaje de error del backend cuando la noticia no existe", async () => {
    fetchMock.mockResolvedValue(
      errorResponse({ error: "Noticia no encontrada" }, 404),
    );
    const store = makeStore();

    await store.dispatch(getNewsByIdThunk(99));
    const state = store.getState().newsSlice;

    expect(state.getNewsByIdStatus).toBe("rejected");
    expect(state.getNewsByIdError).toBe("Noticia no encontrada");
    expect(state.newsById).toBeNull();
  });

  it("cae en el mensaje por defecto si el backend no manda error", async () => {
    fetchMock.mockResolvedValue(errorResponse({}, 500));
    const store = makeStore();

    await store.dispatch(getNewsByIdThunk(1));

    expect(store.getState().newsSlice.getNewsByIdError).toBe(
      "Error al obtener la noticia por id",
    );
  });

  it("rechaza si fetch lanza", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const store = makeStore();

    await store.dispatch(getNewsByIdThunk(1));

    expect(store.getState().newsSlice.getNewsByIdError).toBe(
      "Error al obtener la noticia por id",
    );
  });
});

// ---------------------------------------------------------------------------
// createNewsThunk
// ---------------------------------------------------------------------------

describe("createNewsThunk", () => {
  it("hace POST a /news", async () => {
    fetchMock.mockResolvedValue(okResponse(newsFixture));

    await makeStore().dispatch(createNewsThunk(newsFormInput));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/news`);
    expect(fetchInit().method).toBe("POST");
  });

  it("envia titulo y descripcion como FormData", async () => {
    fetchMock.mockResolvedValue(okResponse(newsFixture));

    await makeStore().dispatch(createNewsThunk(newsFormInput));
    const formData = sentFormData();

    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get("title")).toBe(newsFormInput.title);
    expect(formData.get("description")).toBe(newsFormInput.description);
  });

  it("adjunta la imagen cuando el formulario trae fichero", async () => {
    fetchMock.mockResolvedValue(okResponse(newsFixture));
    const image = makeImage();

    await makeStore().dispatch(createNewsThunk({ ...newsFormInput, image }));
    const sent = sentFormData().get("image");

    expect(sent).toBeInstanceOf(File);
    expect((sent as File).name).toBe("plaza.png");
  });

  it("omite el campo image cuando no hay fichero", async () => {
    fetchMock.mockResolvedValue(okResponse(newsFixture));

    await makeStore().dispatch(
      createNewsThunk({ ...newsFormInput, image: null }),
    );

    expect(sentFormData().has("image")).toBe(false);
  });

  it("pasa a pending mientras la peticion esta en vuelo", () => {
    const state = newsReducer(
      initialState(),
      createNewsThunk.pending("req-id", newsFormInput),
    );

    expect(state.createNewsStatus).toBe("pending");
  });

  it("guarda la noticia creada y la añade al listado", async () => {
    fetchMock
      .mockResolvedValueOnce(okResponse([otherNewsFixture]))
      .mockResolvedValueOnce(okResponse(newsFixture));
    const store = makeStore();

    await store.dispatch(getNewsThunk());
    await store.dispatch(createNewsThunk(newsFormInput));
    const state = store.getState().newsSlice;

    expect(state.createNewsStatus).toBe("fulfilled");
    expect(state.newsById).toEqual(newsFixture);
    expect(state.news).toEqual([otherNewsFixture, newsFixture]);
    expect(state.createNewsError).toBeUndefined();
  });

  it("usa el mensaje de error del backend cuando la validacion falla", async () => {
    fetchMock.mockResolvedValue(
      errorResponse({ error: "El titulo es obligatorio" }, 400),
    );
    const store = makeStore();

    await store.dispatch(createNewsThunk(newsFormInput));
    const state = store.getState().newsSlice;

    expect(state.createNewsStatus).toBe("rejected");
    expect(state.createNewsError).toBe("El titulo es obligatorio");
  });

  it("no añade nada al listado si la creacion falla", async () => {
    fetchMock.mockResolvedValue(errorResponse({ error: "Datos invalidos" }));
    const store = makeStore();

    await store.dispatch(createNewsThunk(newsFormInput));

    expect(store.getState().newsSlice.news).toEqual([]);
  });

  it("cae en el mensaje por defecto si el backend no manda error", async () => {
    fetchMock.mockResolvedValue(errorResponse({}, 500));
    const store = makeStore();

    await store.dispatch(createNewsThunk(newsFormInput));

    expect(store.getState().newsSlice.createNewsError).toBe(
      "Error al crear la noticia",
    );
  });

  it("rechaza si fetch lanza", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const store = makeStore();

    await store.dispatch(createNewsThunk(newsFormInput));

    expect(store.getState().newsSlice.createNewsError).toBe(
      "Error al crear la noticia",
    );
  });
});

// ---------------------------------------------------------------------------
// updateNewsThunk
// ---------------------------------------------------------------------------

describe("updateNewsThunk", () => {
  it("hace PUT a /news/:id", async () => {
    fetchMock.mockResolvedValue(okResponse(newsFixture));

    await makeStore().dispatch(
      updateNewsThunk({ id: 1, newFormInput: newsFormInput }),
    );

    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/news/1`);
    expect(fetchInit().method).toBe("PUT");
  });

  it("envia titulo y descripcion como FormData", async () => {
    fetchMock.mockResolvedValue(okResponse(newsFixture));

    await makeStore().dispatch(
      updateNewsThunk({ id: 1, newFormInput: newsFormInput }),
    );
    const formData = sentFormData();

    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get("title")).toBe(newsFormInput.title);
    expect(formData.get("description")).toBe(newsFormInput.description);
  });

  it("adjunta la imagen cuando se sube una nueva", async () => {
    fetchMock.mockResolvedValue(okResponse(newsFixture));
    const image = makeImage();

    await makeStore().dispatch(
      updateNewsThunk({ id: 1, newFormInput: { ...newsFormInput, image } }),
    );
    const sent = sentFormData().get("image");

    expect(sent).toBeInstanceOf(File);
    expect((sent as File).name).toBe("plaza.png");
  });

  // Caracteriza el contrato actual: sin fichero no se manda el campo, y el
  // backend hace `input.image ?? existing.image`, o sea conserva la que habia.
  // Hoy no existe forma de dejar una noticia sin imagen desde el dashboard.
  it("omite el campo image cuando no hay fichero, conservando la imagen previa", async () => {
    fetchMock.mockResolvedValue(okResponse(newsFixture));

    await makeStore().dispatch(
      updateNewsThunk({
        id: 1,
        newFormInput: { ...newsFormInput, image: null },
      }),
    );

    expect(sentFormData().has("image")).toBe(false);
  });

  it("pasa a pending mientras la peticion esta en vuelo", () => {
    const state = newsReducer(
      initialState(),
      updateNewsThunk.pending("req-id", {
        id: 1,
        newFormInput: newsFormInput,
      }),
    );

    expect(state.updateNewsStatus).toBe("pending");
  });

  it("reemplaza en el listado la noticia editada dejando el resto igual", () => {
    const previous: NewsStatus = {
      ...initialState(),
      news: [newsFixture, otherNewsFixture],
    };
    const edited: NewsInterface = {
      ...newsFixture,
      title: "Obras en la plaza mayor: finalizadas",
    };

    const state = newsReducer(
      previous,
      updateNewsThunk.fulfilled(edited, "req-id", {
        id: edited.id,
        newFormInput: newsFormInput,
      }),
    );

    expect(state.updateNewsStatus).toBe("fulfilled");
    expect(state.newsById).toEqual(edited);
    expect(state.news).toEqual([edited, otherNewsFixture]);
    expect(state.updateNewsError).toBeUndefined();
  });

  it("no añade la noticia al listado si no estaba cargada", () => {
    const edited: NewsInterface = { ...newsFixture, id: 42 };

    const state = newsReducer(
      initialState(),
      updateNewsThunk.fulfilled(edited, "req-id", {
        id: 42,
        newFormInput: newsFormInput,
      }),
    );

    expect(state.news).toEqual([]);
    expect(state.newsById).toEqual(edited);
  });

  it("limpia un error previo cuando el reintento va bien", () => {
    const previous: NewsStatus = {
      ...initialState(),
      updateNewsStatus: "rejected",
      updateNewsError: "Error anterior",
    };

    const state = newsReducer(
      previous,
      updateNewsThunk.fulfilled(newsFixture, "req-id", {
        id: newsFixture.id,
        newFormInput: newsFormInput,
      }),
    );

    expect(state.updateNewsStatus).toBe("fulfilled");
    expect(state.updateNewsError).toBeUndefined();
  });

  it("usa el mensaje de error del backend cuando la edicion falla", async () => {
    fetchMock.mockResolvedValue(
      errorResponse({ error: "Noticia no encontrada" }, 404),
    );
    const store = makeStore();

    await store.dispatch(
      updateNewsThunk({ id: 1, newFormInput: newsFormInput }),
    );
    const state = store.getState().newsSlice;

    expect(state.updateNewsStatus).toBe("rejected");
    expect(state.updateNewsError).toBe("Noticia no encontrada");
  });

  it("cae en el mensaje por defecto si el backend no manda error", async () => {
    fetchMock.mockResolvedValue(errorResponse({}, 500));
    const store = makeStore();

    await store.dispatch(
      updateNewsThunk({ id: 1, newFormInput: newsFormInput }),
    );

    expect(store.getState().newsSlice.updateNewsError).toBe(
      "Error al editar la noticia",
    );
  });

  it("rechaza si fetch lanza", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const store = makeStore();

    await store.dispatch(
      updateNewsThunk({ id: 1, newFormInput: newsFormInput }),
    );

    expect(store.getState().newsSlice.updateNewsError).toBe(
      "Error al actualizar la noticia",
    );
  });
});

// ---------------------------------------------------------------------------
// deleteNewsThunk
// ---------------------------------------------------------------------------

describe("deleteNewsThunk", () => {
  it("hace DELETE a /news/:id", async () => {
    fetchMock.mockResolvedValue(okResponse(undefined));

    await makeStore().dispatch(deleteNewsThunk(3));

    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/news/3`);
    expect(fetchInit().method).toBe("DELETE");
  });

  it("devuelve el id borrado como payload", async () => {
    fetchMock.mockResolvedValue(okResponse(undefined));

    const action = await makeStore().dispatch(deleteNewsThunk(3));

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

    await store.dispatch(deleteNewsThunk(1));
    const state = store.getState().newsSlice;

    expect(state.deleteNewsStatus).toBe("fulfilled");
    expect(state.deleteNewsError).toBeUndefined();
  });

  it("pasa a pending mientras la peticion esta en vuelo", () => {
    const state = newsReducer(
      initialState(),
      deleteNewsThunk.pending("req-id", 1),
    );

    expect(state.deleteNewsStatus).toBe("pending");
  });

  it("saca del listado solo la noticia borrada", () => {
    const previous: NewsStatus = {
      ...initialState(),
      news: [newsFixture, otherNewsFixture],
    };

    const state = newsReducer(
      previous,
      deleteNewsThunk.fulfilled(newsFixture.id, "req-id", 1),
    );

    expect(state.deleteNewsStatus).toBe("fulfilled");
    expect(state.news).toEqual([otherNewsFixture]);
  });

  it("limpia newsById si era la noticia borrada", () => {
    const previous: NewsStatus = {
      ...initialState(),
      news: [newsFixture],
      newsById: newsFixture,
    };

    const state = newsReducer(
      previous,
      deleteNewsThunk.fulfilled(newsFixture.id, "req-id", 1),
    );

    expect(state.newsById).toBeNull();
  });

  it("mantiene newsById si la borrada era otra noticia", () => {
    const previous: NewsStatus = {
      ...initialState(),
      news: [newsFixture, otherNewsFixture],
      newsById: otherNewsFixture,
    };

    const state = newsReducer(
      previous,
      deleteNewsThunk.fulfilled(newsFixture.id, "req-id", 1),
    );

    expect(state.newsById).toEqual(otherNewsFixture);
  });

  it("usa el mensaje de error del backend cuando el borrado falla", async () => {
    fetchMock.mockResolvedValue(
      errorResponse({ error: "Noticia no encontrada" }, 404),
    );
    const store = makeStore();

    await store.dispatch(deleteNewsThunk(1));
    const state = store.getState().newsSlice;

    expect(state.deleteNewsStatus).toBe("rejected");
    expect(state.deleteNewsError).toBe("Noticia no encontrada");
  });

  it("no toca el listado si el borrado falla", async () => {
    fetchMock
      .mockResolvedValueOnce(okResponse([newsFixture, otherNewsFixture]))
      .mockResolvedValueOnce(errorResponse({ error: "Conflicto" }, 409));
    const store = makeStore();

    await store.dispatch(getNewsThunk());
    await store.dispatch(deleteNewsThunk(1));

    expect(store.getState().newsSlice.news).toEqual([
      newsFixture,
      otherNewsFixture,
    ]);
  });

  it("cae en el mensaje por defecto si el backend no manda error", async () => {
    fetchMock.mockResolvedValue(errorResponse({}, 500));
    const store = makeStore();

    await store.dispatch(deleteNewsThunk(1));

    expect(store.getState().newsSlice.deleteNewsError).toBe(
      "Error al eliminar la noticia",
    );
  });

  it("rechaza si fetch lanza", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const store = makeStore();

    await store.dispatch(deleteNewsThunk(1));

    expect(store.getState().newsSlice.deleteNewsError).toBe(
      "Error al eliminar la noticia",
    );
  });
});

// ---------------------------------------------------------------------------
// Aislamiento entre operaciones
// ---------------------------------------------------------------------------

describe("newsSlice - aislamiento entre operaciones", () => {
  it("un fallo al crear no ensucia el status del listado", async () => {
    fetchMock
      .mockResolvedValueOnce(okResponse([newsFixture]))
      .mockResolvedValueOnce(errorResponse({ error: "Datos invalidos" }));
    const store = makeStore();

    await store.dispatch(getNewsThunk());
    await store.dispatch(createNewsThunk(newsFormInput));
    const state = store.getState().newsSlice;

    expect(state.createNewsStatus).toBe("rejected");
    expect(state.getAllNewsStatus).toBe("fulfilled");
    expect(state.getAllNewsError).toBeUndefined();
  });

  it("cada thunk tiene su propio prefijo de accion", () => {
    const prefixes = [
      getNewsThunk.pending.type,
      getNewsByIdThunk.pending.type,
      createNewsThunk.pending.type,
      updateNewsThunk.pending.type,
      deleteNewsThunk.pending.type,
    ];

    expect(new Set(prefixes).size).toBe(prefixes.length);
  });
});

// ---------------------------------------------------------------------------
// Autenticacion
// ---------------------------------------------------------------------------

describe("news - cabecera Authorization", () => {
  it("adjunta el token cuando hay sesion guardada", async () => {
    localStorage.setItem("dashboard.token", "token-de-prueba");
    fetchMock.mockResolvedValue(okResponse([newsFixture]));

    await makeStore().dispatch(getNewsThunk());

    expect(sentHeader("Authorization")).toBe("Bearer token-de-prueba");
  });

  it("no manda Authorization si no hay sesion", async () => {
    fetchMock.mockResolvedValue(okResponse([newsFixture]));

    await makeStore().dispatch(getNewsThunk());

    expect(sentHeader("Authorization")).toBeNull();
  });

  it("no fija Content-Type al enviar FormData", async () => {
    localStorage.setItem("dashboard.token", "token-de-prueba");
    fetchMock.mockResolvedValue(okResponse(newsFixture));

    await makeStore().dispatch(createNewsThunk(newsFormInput));

    expect(sentHeader("Authorization")).toBe("Bearer token-de-prueba");
    expect(sentHeader("Content-Type")).toBeNull();
  });
});
