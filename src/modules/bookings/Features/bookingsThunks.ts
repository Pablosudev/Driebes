import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "../../../shared/apiFetch";
import type {
  AllBookings,
  BookingInput,
  BookingInterface,
} from "../Interfaces/bookingsInterface";

export const getAllBookingsThunk = createAsyncThunk<
  AllBookings,
  void,
  { rejectValue: string }
>("/bookings/getAll", async (_bookings: void, thunkAPI) => {
  try {
    const response = await apiFetch(`/bookings`);
    if (!response.ok) {
      const errorBookings = await response.json();
      return thunkAPI.rejectWithValue(
        errorBookings.error ?? "Error al obtener todas las reservas.",
      );
    }
    const data: AllBookings = await response.json();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue("Error al obtener todas las reservas");
  }
});

export const getBookingByIdThunk = createAsyncThunk<
  BookingInterface,
  number,
  { rejectValue: string }
>("/bookings/getById", async (id: number, thunkAPI) => {
  try {
    const response = await apiFetch(`/bookings/${id}`);
    if (!response.ok) {
      const errorBookingId = await response.json();
      return thunkAPI.rejectWithValue(
        errorBookingId.error ?? "Error al obtener una única reserva.",
      );
    }
    const data : BookingInterface = await response.json();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue("Error al obtener una única reserva");
  }
});

export const createBookingThunk = createAsyncThunk<
  BookingInterface,
  BookingInput,
  { rejectValue: string }
>("/bookings/create", async (newBooking: BookingInput, thunkAPI) => {
  try {
    // POST /bookings espera JSON: no hay ficheros, y la API solo monta
    // express.json() en esta ruta (con FormData el body llega vacio y revienta).
    const response = await apiFetch(`/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newBooking.name,
        phone: newBooking.phone,
        startDate: newBooking.startDate,
        endDate: newBooking.endDate,
        notes: newBooking.notes,
      }),
    });
    if (!response.ok) {
      const errorCreateBooking = await response.json();
      return thunkAPI.rejectWithValue(
        errorCreateBooking.error ?? "Error al crear la reserva.",
      );
    }
    const data: BookingInterface = await response.json();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue("Error al crear una nueva reserva.");
  }
});

export const updateBookingThunk = createAsyncThunk<
  BookingInterface,
  { id: number; booking: BookingInput },
  { rejectValue: string }
>(
  "/bookings/update",
  async ({ id, booking }: { id: number; booking: BookingInput }, thunkApi) => {
    try {
        const response = await apiFetch(`/bookings/${id}` , {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: booking.name,
              phone: booking.phone,
              startDate: booking.startDate,
              endDate: booking.endDate,
              state: booking.state,
              notes: booking.notes,
            }),
        });
        if (!response.ok) {
            const errorUpdateBooking = await response.json();
            return thunkApi.rejectWithValue( errorUpdateBooking.error ?? "Error al editar la reserva.")
        }
        const data : BookingInterface = await response.json();
        return data

    } catch (error) {
      return thunkApi.rejectWithValue("Error al actualizar la reserva");
    }
  },
);




export const deleteBookingThunk = createAsyncThunk<
number,
number,
{rejectValue: string}>("/bookings/delete", async (id: number , thunkAPI) => {

    try {
        const response = await apiFetch(`/bookings/${id}` , {
            method: "DELETE",
        })
        if (!response.ok) {
            const errorDeleteBooking = await response.json();
            return thunkAPI.rejectWithValue( errorDeleteBooking.error ?? "Error al intentar eliminar la reserva.")
        }
        return id;
    } catch (error) {
        return thunkAPI.rejectWithValue("Error al intentar eliminar la reserva.")
    }
})
