import { createAsyncThunk } from "@reduxjs/toolkit";
import type { AuthInput, AuthResponse } from "../Interfaces/authInterface";
import { apiFetch, removeToken, saveToken } from "../../../shared/apiFetch";

export const loginThunk = createAsyncThunk<
  AuthResponse,
  AuthInput,
  { rejectValue: string }
>(
  "auth/login",

  async (credentials, thunkAPI) => {
    try {
      const response = await apiFetch(`/login`, {
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

export const logoutThunk = createAsyncThunk<void, void>(
  "auth/logout",
  async () => {
    removeToken();
  },
);