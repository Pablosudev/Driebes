import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetch } from "../../../shared/apiFetch";
import type {
  AllNewsInterface,
  NewsFormInput,
  NewsInterface,
} from "../Interfaces/newsInterface";

export const getNewsThunk = createAsyncThunk<
  AllNewsInterface,
  void,
  { rejectValue: string }
>("/news/getAll", async (_news: void, thunkAPI) => {
  try {
    const response = await apiFetch(`/news`);
    if (!response.ok) {
      const errorNews = await response.json();
      return thunkAPI.rejectWithValue(
        errorNews.error ?? "Error al obtener todas las noticias",
      );
    }
    const data: AllNewsInterface = await response.json();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue("Error al obtener todas las noticias");
  }
});

export const getNewsByIdThunk = createAsyncThunk<
  NewsInterface,
  number,
  { rejectValue: string }
>("/news/getById", async (id: number, thunkAPI) => {
  try {
    const response = await apiFetch(`/news/${id}`);
    if (!response.ok) {
      const errorNewID = await response.json();
      return thunkAPI.rejectWithValue(
        errorNewID.error ?? "Error al obtener la noticia por id",
      );
    }
    const data: NewsInterface = await response.json();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue("Error al obtener la noticia por id");
  }
});

export const createNewsThunk = createAsyncThunk<
  NewsInterface,
  NewsFormInput,
  { rejectValue: string }
>("/news/create", async (newFormInput: NewsFormInput, thunkAPI) => {
  try {
    const formData = new FormData();
    formData.append("title", newFormInput.title);
    formData.append("description", newFormInput.description);
    if (newFormInput.image) {
      formData.append("image", newFormInput.image);
    }
    const response = await apiFetch(`/news`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const errorCreateNew = await response.json();
      return thunkAPI.rejectWithValue(
        errorCreateNew.error ?? "Error al crear la noticia",
      );
    }
    const data: NewsInterface = await response.json();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue("Error al crear la noticia");
  }
});

export const updateNewsThunk = createAsyncThunk<
  NewsInterface,
  { id: number; newFormInput: NewsFormInput },
  { rejectValue: string }
>(
  "/news/update",
  async (
    { id, newFormInput }: { id: number; newFormInput: NewsFormInput },
    thunkAPI,
  ) => {
    try {
      const formData = new FormData();
      formData.append("title", newFormInput.title);
      formData.append("description", newFormInput.description);
      if (newFormInput.image) {
        formData.append("image", newFormInput.image);
      }

      const response = await apiFetch(`/news/${id}`,
        {
          method: "PUT",
          body: formData,
        },
      );
      if (!response.ok) {
        const errorUploadNew = await response.json();
        return thunkAPI.rejectWithValue(
          errorUploadNew.error ?? "Error al editar la noticia",
        );
      }
      const data : NewsInterface = await response.json();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Error al actualizar la noticia");
    }
  },
);

export const deleteNewsThunk = createAsyncThunk<
number,
number,
{rejectValue: string}
>("/news/delete",
async (id: number, thunkAPI) => {
try {
    const response = await apiFetch(`/news/${id}` , {
        method: "DELETE",
    }
);
 if (!response.ok) {
        const errorDeleteNew = await response.json();
        return thunkAPI.rejectWithValue( errorDeleteNew.error ?? "Error al eliminar la noticia"); 
    }

    return id;
} catch (error) {
    return thunkAPI.rejectWithValue("Error al eliminar la noticia");
}
});
