import { createAsyncThunk } from "@reduxjs/toolkit";
import type { AuthInput, AuthResponse, AuthUser } from "../Interfaces/authInterface";
import { apiFetch, removeToken, saveToken } from "../../../shared/apiFetch";

export const loginThunk = createAsyncThunk<
  AuthResponse,
  AuthInput,
  { rejectValue: string }
>(
  "auth/login",

  async (credentials, thunkAPI) => {
    try {
      const response = await apiFetch(`/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        // Un login fallido invalida cualquier token viejo que siguiese guardado.
        removeToken();
        return thunkAPI.rejectWithValue(
          errorBody.error ?? "Error al iniciar sesión",
        );
      }
      const data: AuthResponse = await response.json();
      // Se persiste aqui y no en el reducer para que este siga siendo puro.
      saveToken(data.token);
      return data;
    } catch {
      removeToken();
      return thunkAPI.rejectWithValue("Error de conexión");
    }
  },
);

/** Marca de sesion invalida: la distingue de un fallo de red pasajero. */
export const SESION_NO_VALIDA = "Sesión no válida";

/**
 * Recupera el usuario del token guardado.
 *
 * El slice rehidrata el token de localStorage pero no el usuario, asi que tras
 * un F5 hay token y `user` a null. Este thunk rellena ese hueco preguntando a
 * la API en vez de cachear datos de usuario en el navegador.
 */
export const meThunk = createAsyncThunk<AuthUser, void, { rejectValue: string }>(
  "auth/me",
  async (_, thunkAPI) => {
    try {
      const response = await apiFetch(`/auth/me`);

      if (!response.ok) {
        // 401: el token caduco o ya no vale. La sesion guardada sobra.
        removeToken();
        return thunkAPI.rejectWithValue(SESION_NO_VALIDA);
      }

      return (await response.json()) as AuthUser;
    } catch {
      // Fallo de red: el token puede seguir siendo bueno, no se descarta.
      return thunkAPI.rejectWithValue("Error de conexión");
    }
  },
);

export const logoutThunk = createAsyncThunk<void, void>(
  "auth/logout",
  async () => {
    removeToken();
  },
);