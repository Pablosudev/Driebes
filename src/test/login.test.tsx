import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { authReducer } from "../modules/login/Features/authSlice";
import { eventReducer } from "../modules/events/Features/eventsSlice";
import { jobReducer } from "../modules/jobs/Features/jobsSlice";
import { bookingReducer } from "../modules/bookings/Features/bookingsSlice";
import { newsReducer } from "../modules/news/Features/newsSlice";
import { Login } from "../modules/login/Pages/Login";
import App from "../App";
import type { AuthResponse, AuthUser } from "../modules/login/Interfaces/authInterface";

// ---------------------------------------------------------------------------
// Helpers y fixtures
// ---------------------------------------------------------------------------

const API_URL = "http://api.test";
const TOKEN_KEY = "dashboard.token";

const authUser: AuthUser = {
  id: 1,
  email: "plopez@aries.es",
  name: "Pablo",
  createDate: "2026-08-03",
};

const authResponse: AuthResponse = { token: "token-nuevo", user: authUser };

// Los tests de <App /> llegan hasta el Home, que lee de los slices de recursos
// para sus tarjetas y sus recordatorios: el store de prueba los necesita.
const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      eventsSlice: eventReducer,
      jobsSlice: jobReducer,
      bookingsSlice: bookingReducer,
      newsSlice: newsReducer,
    },
  });

/** Renderiza dentro de un Provider y devuelve tambien el store, para poder
 *  comprobar el estado resultante ademas de lo que se ve en pantalla. */
const renderWithStore = (node: ReactNode) => {
  const store = makeStore();
  return {
    store,
    ...render(<Provider store={store}>{node}</Provider>),
  };
};

/**
 * Monta la pantalla de login con un router alrededor.
 *
 * Lo necesita aunque no se navegue: en cuanto hay token, Login redirige con
 * <Navigate>, y sin contexto de router eso lanza. Los tests de <App /> no usan
 * este helper porque App ya trae su propio BrowserRouter.
 */
const renderLogin = () => renderWithStore(<MemoryRouter><Login /></MemoryRouter>);

const okResponse = (body: unknown) =>
  ({ ok: true, status: 200, json: async () => body }) as unknown as Response;

const errorResponse = (body: unknown, status = 401) =>
  ({ ok: false, status, json: async () => body }) as unknown as Response;

/** Promesa que se resuelve cuando queramos: sirve para congelar la peticion en
 *  vuelo y observar el estado de carga. */
const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

let fetchMock: ReturnType<typeof vi.fn>;

const emailInput = () => screen.getByLabelText("Correo electrónico");
const passwordInput = () => screen.getByLabelText("Contraseña");
const submitButton = () => screen.getByRole("button", { name: /entrar/i });

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
// Render inicial
// ---------------------------------------------------------------------------

describe("Login - render inicial", () => {
  it("muestra los dos campos y el boton", () => {
    renderLogin();

    expect(emailInput()).toBeInTheDocument();
    expect(passwordInput()).toBeInTheDocument();
    expect(submitButton()).toBeInTheDocument();
  });

  it("oculta la contraseña por defecto", () => {
    renderLogin();

    expect(passwordInput()).toHaveAttribute("type", "password");
  });

  it("no muestra ningun error al abrir", () => {
    renderLogin();

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("deja los campos con el autocompletado que esperan los gestores de contraseñas", () => {
    renderLogin();

    expect(emailInput()).toHaveAttribute("autocomplete", "username");
    expect(passwordInput()).toHaveAttribute("autocomplete", "current-password");
  });
});

// ---------------------------------------------------------------------------
// Validacion del formulario
// ---------------------------------------------------------------------------

describe("Login - validacion", () => {
  it("arranca con el boton deshabilitado", () => {
    renderLogin();

    expect(submitButton()).toBeDisabled();
  });

  it("sigue deshabilitado si solo se rellena el correo", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(emailInput(), "plopez@aries.es");

    expect(submitButton()).toBeDisabled();
  });

  it("sigue deshabilitado si solo se rellena la contraseña", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(passwordInput(), "secreto");

    expect(submitButton()).toBeDisabled();
  });

  it("se habilita con los dos campos rellenos", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(emailInput(), "plopez@aries.es");
    await user.type(passwordInput(), "secreto");

    expect(submitButton()).toBeEnabled();
  });

  it("no llama a la API si solo hay espacios en el correo", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(emailInput(), "   ");
    await user.type(passwordInput(), "secreto");
    await user.click(submitButton());

    expect(fetchMock).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Mostrar y ocultar la contraseña
// ---------------------------------------------------------------------------

describe("Login - mostrar contraseña", () => {
  it("cambia el input a texto al pulsar Mostrar", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole("button", { name: "Mostrar" }));

    expect(passwordInput()).toHaveAttribute("type", "text");
  });

  it("vuelve a ocultarla al pulsar Ocultar", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole("button", { name: "Mostrar" }));
    await user.click(screen.getByRole("button", { name: "Ocultar" }));

    expect(passwordInput()).toHaveAttribute("type", "password");
  });

  it("refleja el estado en aria-pressed", async () => {
    const user = userEvent.setup();
    renderLogin();
    const toggle = screen.getByRole("button", { name: "Mostrar" });

    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await user.click(toggle);

    expect(screen.getByRole("button", { name: "Ocultar" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});

// ---------------------------------------------------------------------------
// Envio correcto
// ---------------------------------------------------------------------------

describe("Login - envio correcto", () => {
  it("manda las credenciales escritas a POST /auth/login", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(okResponse(authResponse));
    renderLogin();

    await user.type(emailInput(), "plopez@aries.es");
    await user.type(passwordInput(), "secreto");
    await user.click(submitButton());

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/auth/login`);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string)).toEqual({
      email: "plopez@aries.es",
      password: "secreto",
    });
  });

  it("recorta los espacios del correo antes de enviarlo", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(okResponse(authResponse));
    renderLogin();

    await user.type(emailInput(), "  plopez@aries.es  ");
    await user.type(passwordInput(), "secreto");
    await user.click(submitButton());

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string).email).toBe(
      "plopez@aries.es",
    );
  });

  it("deja la sesion iniciada en el store", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(okResponse(authResponse));
    const { store } = renderLogin();

    await user.type(emailInput(), "plopez@aries.es");
    await user.type(passwordInput(), "secreto");
    await user.click(submitButton());

    await waitFor(() =>
      expect(store.getState().auth.status).toBe("fulfilled"),
    );
    expect(store.getState().auth.token).toBe("token-nuevo");
    expect(store.getState().auth.user).toEqual(authUser);
  });

  it("se puede enviar con Enter desde el campo de contraseña", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(okResponse(authResponse));
    renderLogin();

    await user.type(emailInput(), "plopez@aries.es");
    await user.type(passwordInput(), "secreto{Enter}");

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  });
});

// ---------------------------------------------------------------------------
// Estado de carga
// ---------------------------------------------------------------------------

describe("Login - estado de carga", () => {
  it("muestra Entrando… y deshabilita los controles mientras espera", async () => {
    const user = userEvent.setup();
    const pending = deferred<Response>();
    fetchMock.mockReturnValue(pending.promise);
    renderLogin();

    await user.type(emailInput(), "plopez@aries.es");
    await user.type(passwordInput(), "secreto");
    await user.click(submitButton());

    await screen.findByRole("button", { name: "Entrando…" });
    expect(emailInput()).toBeDisabled();
    expect(passwordInput()).toBeDisabled();
    expect(screen.getByRole("button", { name: "Entrando…" })).toBeDisabled();

    pending.resolve(okResponse(authResponse));
  });

  // El boton deshabilitado ya lo impide, pero conviene fijarlo: un doble envio
  // dispararia dos peticiones de login.
  it("no permite un segundo envio mientras el primero esta en vuelo", async () => {
    const user = userEvent.setup();
    const pending = deferred<Response>();
    fetchMock.mockReturnValue(pending.promise);
    renderLogin();

    await user.type(emailInput(), "plopez@aries.es");
    await user.type(passwordInput(), "secreto");
    await user.click(submitButton());
    await screen.findByRole("button", { name: "Entrando…" });
    await user.click(screen.getByRole("button", { name: "Entrando…" }));

    expect(fetchMock).toHaveBeenCalledTimes(1);

    pending.resolve(okResponse(authResponse));
  });
});

// ---------------------------------------------------------------------------
// Errores
// ---------------------------------------------------------------------------

describe("Login - errores", () => {
  it("muestra el mensaje del backend cuando las credenciales fallan", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(
      errorResponse({ error: "Credenciales incorrectas" }, 401),
    );
    renderLogin();

    await user.type(emailInput(), "plopez@aries.es");
    await user.type(passwordInput(), "mal");
    await user.click(submitButton());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Credenciales incorrectas",
    );
  });

  it("muestra el error de conexion si fetch lanza", async () => {
    const user = userEvent.setup();
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    renderLogin();

    await user.type(emailInput(), "plopez@aries.es");
    await user.type(passwordInput(), "secreto");
    await user.click(submitButton());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Error de conexión",
    );
  });

  it("vuelve a habilitar el formulario tras el fallo, para reintentar", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(
      errorResponse({ error: "Credenciales incorrectas" }, 401),
    );
    renderLogin();

    await user.type(emailInput(), "plopez@aries.es");
    await user.type(passwordInput(), "mal");
    await user.click(submitButton());
    await screen.findByRole("alert");

    expect(emailInput()).toBeEnabled();
    expect(submitButton()).toBeEnabled();
  });

  it("conserva lo escrito para no obligar a teclearlo de nuevo", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(
      errorResponse({ error: "Credenciales incorrectas" }, 401),
    );
    renderLogin();

    await user.type(emailInput(), "plopez@aries.es");
    await user.type(passwordInput(), "mal");
    await user.click(submitButton());
    await screen.findByRole("alert");

    expect(emailInput()).toHaveValue("plopez@aries.es");
  });

  it("el error desaparece cuando el reintento va bien", async () => {
    const user = userEvent.setup();
    fetchMock
      .mockResolvedValueOnce(
        errorResponse({ error: "Credenciales incorrectas" }, 401),
      )
      .mockResolvedValueOnce(okResponse(authResponse));
    renderLogin();

    await user.type(emailInput(), "plopez@aries.es");
    await user.type(passwordInput(), "mal");
    await user.click(submitButton());
    await screen.findByRole("alert");

    await user.click(submitButton());

    await waitFor(() =>
      expect(screen.queryByRole("alert")).not.toBeInTheDocument(),
    );
  });
});

// ---------------------------------------------------------------------------
// La puerta de sesion de App
// ---------------------------------------------------------------------------

/** El Home pide estos listados nada mas entrar: se responde por ruta. */
const LISTADOS = ["/events", "/jobs", "/bookings"];

const routedFetch = async (url: string) =>
  LISTADOS.some((ruta) => url.endsWith(ruta))
    ? okResponse([])
    : okResponse(authResponse);

describe("App - puerta de sesion", () => {
  it("muestra el login cuando no hay token", () => {
    renderWithStore(<App />);

    expect(submitButton()).toBeInTheDocument();
  });

  it("pasa al dashboard tras un login correcto", async () => {
    const user = userEvent.setup();
    fetchMock.mockImplementation((url: string) => routedFetch(url));
    renderWithStore(<App />);

    await user.type(emailInput(), "plopez@aries.es");
    await user.type(passwordInput(), "secreto");
    await user.click(submitButton());

    expect(await screen.findByText("Pablo")).toBeInTheDocument();
    expect(screen.queryByLabelText("Contraseña")).not.toBeInTheDocument();
  });

  it("vuelve al login al cerrar sesion", async () => {
    const user = userEvent.setup();
    fetchMock.mockImplementation((url: string) => routedFetch(url));
    renderWithStore(<App />);

    await user.type(emailInput(), "plopez@aries.es");
    await user.type(passwordInput(), "secreto");
    await user.click(submitButton());
    await screen.findByText("Pablo");

    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    expect(await screen.findByLabelText("Contraseña")).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
