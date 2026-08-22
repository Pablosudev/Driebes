import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { authReducer, clearAuth } from "../modules/login/Features/authSlice";
import { loginThunk, logoutThunk } from "../modules/login/Features/authThunk";
import type {
  AuthInput,
  AuthResponse,
  AuthState,
  AuthUser,
} from "../modules/login/Interfaces/authInterface";

// ---------------------------------------------------------------------------
// Helpers y fixtures
// ---------------------------------------------------------------------------

const API_URL = "http://api.test";

/** Misma clave que usa shared/apiFetch. */
const TOKEN_KEY = "dashboard.token";

const authUser: AuthUser = {
  id: 1,
  email: "plopez@aries.es",
  name: "Pablo",
  createDate: "2026-08-03",
};

const authResponse: AuthResponse = {
  token: "token-nuevo",
  user: authUser,
};

const credentials: AuthInput = {
  email: "plopez@aries.es",
  password: "secreto",
};

/** Store aislado con solo el slice de auth, uno nuevo por test. */
const makeStore = () => configureStore({ reducer: { auth: authReducer } });

/** Estado del slice tal y como lo deja el initialState. */
const initialState = (): AuthState =>
  authReducer(undefined, { type: "@@test/unknown" });

const okResponse = (body: unknown) =>
  ({ ok: true, status: 200, json: async () => body }) as unknown as Response;

const errorResponse = (body: unknown, status = 401) =>
  ({ ok: false, status, json: async () => body }) as unknown as Response;

/** El fetch mockeado. Se reasigna en cada test desde el beforeEach. */
let fetchMock: ReturnType<typeof vi.fn>;

/** Devuelve las opciones (method, headers, body...) de la n-ésima llamada. */
const fetchInit = (call = 0): RequestInit =>
  fetchMock.mock.calls[call][1] as RequestInit;

/** Lee una cabecera enviada en la n-ésima llamada a fetch. */
const sentHeader = (name: string, call = 0): string | null =>
  new Headers(fetchInit(call).headers).get(name);

beforeEach(() => {
  vi.stubEnv("VITE_API_URL", API_URL);
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
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

describe("authSlice - estado inicial", () => {
  it("arranca sin usuario, sin token y en idle", () => {
    expect(initialState()).toEqual({
      user: null,
      token: null,
      status: "idle",
      error: undefined,
    });
  });
});

describe("authSlice - clearAuth", () => {
  it("resetea los cuatro campos", () => {
    const previous: AuthState = {
      user: authUser,
      token: "token-viejo",
      status: "fulfilled",
      error: "Error anterior",
    };

    const state = authReducer(previous, clearAuth());

    expect(state).toEqual({
      user: null,
      token: null,
      status: "idle",
      error: undefined,
    });
  });
});

// ---------------------------------------------------------------------------
// Rehidratacion del token
// ---------------------------------------------------------------------------

describe("authSlice - rehidratacion", () => {
  // El initialState lee localStorage al evaluarse el modulo, asi que hay que
  // reimportarlo para comprobarlo. Es lo que hace que la sesion sobreviva a F5.
  it("recupera el token persistido al cargar el modulo", async () => {
    localStorage.setItem(TOKEN_KEY, "token-persistido");
    vi.resetModules();

    const fresh = await import("../modules/login/Features/authSlice");
    const state = fresh.authReducer(undefined, { type: "@@test/unknown" });

    expect(state.token).toBe("token-persistido");
  });

  // El usuario no se cachea: se recupera del backend, no del navegador.
  it("no rehidrata el usuario, solo el token", async () => {
    localStorage.setItem(TOKEN_KEY, "token-persistido");
    vi.resetModules();

    const fresh = await import("../modules/login/Features/authSlice");
    const state = fresh.authReducer(undefined, { type: "@@test/unknown" });

    expect(state.user).toBeNull();
    expect(state.status).toBe("idle");
  });
});

// ---------------------------------------------------------------------------
// loginThunk
// ---------------------------------------------------------------------------

describe("loginThunk", () => {
  it("hace POST a /auth/login con las credenciales en JSON", async () => {
    fetchMock.mockResolvedValue(okResponse(authResponse));

    await makeStore().dispatch(loginThunk(credentials));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/auth/login`);
    expect(fetchInit().method).toBe("POST");
    expect(sentHeader("Content-Type")).toBe("application/json");
    expect(JSON.parse(fetchInit().body as string)).toEqual(credentials);
  });

  it("pasa a pending mientras la peticion esta en vuelo", () => {
    const state = authReducer(
      initialState(),
      loginThunk.pending("req-id", credentials),
    );

    expect(state.status).toBe("pending");
  });

  it("guarda token y usuario al resolverse", async () => {
    fetchMock.mockResolvedValue(okResponse(authResponse));
    const store = makeStore();

    await store.dispatch(loginThunk(credentials));
    const state = store.getState().auth;

    expect(state.status).toBe("fulfilled");
    expect(state.token).toBe("token-nuevo");
    expect(state.user).toEqual(authUser);
    expect(state.error).toBeUndefined();
  });

  it("persiste el token para que sobreviva a un refresco", async () => {
    fetchMock.mockResolvedValue(okResponse(authResponse));

    await makeStore().dispatch(loginThunk(credentials));

    expect(localStorage.getItem(TOKEN_KEY)).toBe("token-nuevo");
  });

  it("usa el mensaje de error del backend cuando las credenciales fallan", async () => {
    fetchMock.mockResolvedValue(
      errorResponse({ error: "Credenciales incorrectas" }, 401),
    );
    const store = makeStore();

    await store.dispatch(loginThunk(credentials));
    const state = store.getState().auth;

    expect(state.status).toBe("rejected");
    expect(state.error).toBe("Credenciales incorrectas");
  });

  it("cae en el mensaje por defecto si el backend no manda error", async () => {
    fetchMock.mockResolvedValue(errorResponse({}, 500));
    const store = makeStore();

    await store.dispatch(loginThunk(credentials));

    expect(store.getState().auth.error).toBe("Error al iniciar sesión");
  });

  it("rechaza con mensaje de conexion si fetch lanza", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const store = makeStore();

    await store.dispatch(loginThunk(credentials));
    const state = store.getState().auth;

    expect(state.status).toBe("rejected");
    expect(state.error).toBe("Error de conexión");
  });

  it("deja el estado sin credenciales a medias cuando falla", () => {
    const previous: AuthState = {
      user: authUser,
      token: "token-viejo",
      status: "fulfilled",
      error: undefined,
    };

    const state = authReducer(
      previous,
      loginThunk.rejected(
        null,
        "req-id",
        credentials,
        "Credenciales incorrectas",
      ),
    );

    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });

  // Un login fallido no puede dejar vivo un token viejo en el navegador: el
  // resto de thunks lo seguiria enviando en la cabecera Authorization.
  it("borra el token persistido si el login falla", async () => {
    localStorage.setItem(TOKEN_KEY, "token-viejo");
    fetchMock.mockResolvedValue(
      errorResponse({ error: "Credenciales incorrectas" }, 401),
    );

    await makeStore().dispatch(loginThunk(credentials));

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it("borra el token persistido si falla la conexion", async () => {
    localStorage.setItem(TOKEN_KEY, "token-viejo");
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    await makeStore().dispatch(loginThunk(credentials));

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it("limpia un error previo cuando el reintento va bien", async () => {
    fetchMock
      .mockResolvedValueOnce(
        errorResponse({ error: "Credenciales incorrectas" }),
      )
      .mockResolvedValueOnce(okResponse(authResponse));
    const store = makeStore();

    await store.dispatch(loginThunk(credentials));
    await store.dispatch(loginThunk(credentials));
    const state = store.getState().auth;

    expect(state.status).toBe("fulfilled");
    expect(state.error).toBeUndefined();
    expect(state.token).toBe("token-nuevo");
  });
});

// ---------------------------------------------------------------------------
// logoutThunk
// ---------------------------------------------------------------------------

describe("logoutThunk", () => {
  it("borra el token persistido", async () => {
    localStorage.setItem(TOKEN_KEY, "token-nuevo");

    await makeStore().dispatch(logoutThunk());

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it("resetea el estado a sesion cerrada", async () => {
    fetchMock.mockResolvedValue(okResponse(authResponse));
    const store = makeStore();

    await store.dispatch(loginThunk(credentials));
    await store.dispatch(logoutThunk());
    const state = store.getState().auth;

    expect(state).toEqual({
      user: null,
      token: null,
      status: "idle",
      error: undefined,
    });
  });

  it("no llama a la API: el logout es solo local", async () => {
    localStorage.setItem(TOKEN_KEY, "token-nuevo");

    await makeStore().dispatch(logoutThunk());

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("es idempotente si no habia sesion", async () => {
    await makeStore().dispatch(logoutThunk());

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});