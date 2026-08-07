import { createSlice } from "@reduxjs/toolkit"
import type { AuthState } from "../Interfaces/authInterface"
import { loginThunk, logoutThunk, meThunk, SESION_NO_VALIDA } from "./authThunk";
import { readToken } from "../../../shared/apiFetch";

// El token se rehidrata de localStorage para que la sesion sobreviva a un F5.
// `user` arranca a null: los datos del usuario se recuperan del backend, no se
// cachean en el navegador.
const initialState: AuthState = {
    user: null,
    token: readToken(),
    status: "idle",
    error: undefined,
}


export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearAuth(state){
            state.user = null;
            state.token = null;
            state.status = "idle";
            state.error = undefined;
        },
    },
    extraReducers: (builder) => {
        builder
        .addCase(loginThunk.pending, (state) => {
            state.status = 'pending';
        })
        .addCase(loginThunk.fulfilled, (state , action) => {
            state.status = 'fulfilled';
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.error = undefined;
        })
        .addCase(loginThunk.rejected, (state , action) => {
            state.status = "rejected";
            state.token = null;
            state.user = null;
            state.error = action.payload;
        })
        .addCase(meThunk.fulfilled, (state , action) => {
            state.user = action.payload;
        })
        .addCase(meThunk.rejected, (state , action) => {
            // Solo se cierra la sesion si la API dijo que el token no vale. Un
            // fallo de red no debe expulsar a quien tiene un token bueno.
            if (action.payload === SESION_NO_VALIDA) {
                state.user = null;
                state.token = null;
                state.status = "idle";
                state.error = undefined;
            }
        })
        .addCase(logoutThunk.fulfilled, (state) => {
            state.user = null;
            state.token = null;
            state.status = "idle";
            state.error = undefined;
        })
    },
});


export const { clearAuth } = authSlice.actions;
export const authReducer = authSlice.reducer;