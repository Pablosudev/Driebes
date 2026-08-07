import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "../../../shared/apiFetch";
import type {
  AllJobsInterface,
  JobInterface,
  JobInputInterface,
} from "../Interfaces/JobsInterfaces";

export const getJobsThunk = createAsyncThunk<
  AllJobsInterface,
  void,
  { rejectValue: string }
>("/jobs/getAll", async (_jobs: void, thunkAPI) => {
  try {
    const response = await apiFetch(`/jobs`);
    if (!response.ok) {
      const errorJobs = await response.json();
      return thunkAPI.rejectWithValue(
        errorJobs.error ?? "Error al obtener todos los trabajos",
      );
    }
    const data: AllJobsInterface = await response.json();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue("Error al obtener todos los trabajos.");
  }
});

export const getJobsByIdThunk = createAsyncThunk<
  JobInterface,
  number,
  { rejectValue: string }
>("/jobs/getById", async (id: number, thunkAPI) => {
  try {
    const response = await apiFetch(`/jobs/${id}`);
    if (!response.ok) {
      const errorJob = await response.json();
      return thunkAPI.rejectWithValue(
        errorJob.error ?? "Error al obtener el trabajo por ID",
      );
    }
    const data: JobInterface = await response.json();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue("Error al obtener el trabajo por ID.");
  }
});

export const createJobThunk = createAsyncThunk<
  JobInterface,
  JobInputInterface,
  { rejectValue: string }
>("/jobs/create", async (jobData: JobInputInterface, thunkAPI) => {
  try {
    // Las ofertas no llevan imagen, asi que la API las recibe como JSON
    // (express.json()) y no como multipart: con FormData req.body llega vacio.
    const response = await apiFetch(`/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobData),
    });
    if (!response.ok) {
      const error = await response.json();
      return thunkAPI.rejectWithValue(
        error.error ?? "Error al crear el trabajo",
      );
    }
    const data: JobInterface = await response.json();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue("Error al crear el trabajo.");
  }
});

export const updateJobThunk = createAsyncThunk<
  JobInterface,
  { id: number; jobData: JobInputInterface },
  { rejectValue: string }
>("/jobs/update", async ({ id, jobData }, thunkAPI) => {
  try {
    const response = await apiFetch(`/jobs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jobData),
    });
    if (!response.ok) {
      const error = await response.json();
      return thunkAPI.rejectWithValue(
        error.error ?? "Error al actualizar el trabajo",
      );
    }
    const data: JobInterface = await response.json();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue("Error al actualizar el trabajo.");
  }
});

export const deleteJobsThunk = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("/jobs/delete", async (id: number, thunkAPI) => {
  try {
    const response = await apiFetch(`/jobs/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const errorDelete = await response.json();
      return thunkAPI.rejectWithValue(
        errorDelete.error ?? "Error al eliminar la oferta de trabajo.",
      );
    }
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue("Error al eliminar la oferta de trabajo.");
  }
});
