import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "../../../shared/apiFetch";
import type {
  AllEventsInterface,
  EventInterface,
  EventFormInput,
} from "../Interfaces/EventsInterface";

export const getEventsThunk = createAsyncThunk<
  AllEventsInterface,
  void,
  { rejectValue: string }
>("events/getAll", async (_events: void, thunkAPI) => {
  try {
    const response = await apiFetch(`/events`);
    if (!response.ok) {
      const errorEvents = await response.json();
      return thunkAPI.rejectWithValue(
        errorEvents.error ?? "Error al obtener todos los eventos",
      );
    }
    const data: AllEventsInterface = await response.json();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue("Error al obtener todos los eventos");
  }
});

export const getEventByIdThunk = createAsyncThunk<
  EventInterface,
  number,
  { rejectValue: string }
>("events/getById", async (id: number, thunkAPI) => {
  try {
    const response = await apiFetch(`/events/${id}`,
    );
    if (!response.ok) {
      const errorEventId = await response.json();
      return thunkAPI.rejectWithValue(
        errorEventId.error ?? "Error al obtener el evento por id",
      );
    }
    const data: EventInterface = await response.json();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue("Error al obtener el evento por id");
  }
});

export const createEventThunk = createAsyncThunk<
  EventInterface,
  EventFormInput,
  { rejectValue: string }
>("events/create", async (eventInput: EventFormInput, thunkAPI) => {
  try {
    const formData = new FormData();
    formData.append("title", eventInput.title);
    formData.append("description", eventInput.description);
    formData.append("eventDate", eventInput.eventDate);
    formData.append("category", eventInput.category);
    if (eventInput.image) {
      formData.append("image", eventInput.image);
    }

    const response = await apiFetch(`/events`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorCreateEvent = await response.json();
      return thunkAPI.rejectWithValue(
        errorCreateEvent.error ?? "Error al crear el evento",
      );
    }
    const data: EventInterface = await response.json();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue("Error al crear el evento");
  }
});

export const updateEventThunk = createAsyncThunk<
  EventInterface,
  { id: number; eventInput: EventFormInput },
  { rejectValue: string }
>(
  "events/update",
  async (
    { id, eventInput }: { id: number; eventInput: EventFormInput },
    thunkAPI,
  ) => {
    try {
      const formData = new FormData();
      formData.append("title", eventInput.title);
      formData.append("description", eventInput.description);
      formData.append("eventDate", eventInput.eventDate);
      formData.append("category", eventInput.category);
      if (eventInput.image) {
        formData.append("image", eventInput.image);
      }

      const response = await apiFetch(`/events/${id}`, {
        method: "PUT",
        body: formData,
      });
      if (!response.ok) {
        const errorUpdateEvent = await response.json();
        return thunkAPI.rejectWithValue(
          errorUpdateEvent.error ?? "Error al actualizar el evento",
        );
      }
      const data : EventInterface = await response.json();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Error al actualizar el evento");
    }
  },
);


export const deleteEventThunk = createAsyncThunk<
  number,
  number,
  {rejectValue: string}
  >("events/delete" , async (id:number , thunkAPI) => {
    try {
      const response = await apiFetch(`/events/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorDeleteEvent = await response.json();
        return thunkAPI.rejectWithValue(
          errorDeleteEvent.error ?? "Error al eliminar el evento"
        );
      }
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue("Error al eliminar el evento");
    }
  });
