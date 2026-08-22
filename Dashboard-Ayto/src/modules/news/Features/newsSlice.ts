import { createSlice } from "@reduxjs/toolkit";
import type { NewsStatus } from "../Interfaces/newsInterface";
import { getNewsByIdThunk, getNewsThunk, createNewsThunk, updateNewsThunk, deleteNewsThunk } from "./newsThunks";




const initialState : NewsStatus  = {
    news:[],
    newsById: null,
    getAllNewsStatus: "idle",
    getNewsByIdStatus: "idle",
    createNewsStatus: "idle",
    updateNewsStatus: "idle",
    deleteNewsStatus: "idle",
    getAllNewsError : undefined,
    getNewsByIdError : undefined,
    createNewsError : undefined,
    updateNewsError : undefined,
    deleteNewsError : undefined,
}
export const newsSlice = createSlice({
    name: 'news',
    initialState,
    reducers:{
        clearNewsId (state){
            state.newsById = null;
        },
    },
    extraReducers : (builder) => {
        builder
        .addCase(getNewsThunk.pending, (state) => {
            state.getAllNewsStatus = 'pending';
        })
        .addCase(getNewsThunk.fulfilled, (state , action) => {
            state.getAllNewsStatus = 'fulfilled';
            state.news = action.payload;
            state.getAllNewsError = undefined;
        })
        .addCase(getNewsThunk.rejected, (state , action) => {
            state.getAllNewsStatus = 'rejected';
            state.getAllNewsError = action.payload;
        })
        // SLICE ID
        .addCase(getNewsByIdThunk.pending, (state) => {
            state.getNewsByIdStatus = 'pending';
        })
        .addCase(getNewsByIdThunk.fulfilled, (state , action) => {
            state.getNewsByIdStatus = 'fulfilled';
            state.newsById = action.payload;
            state.getNewsByIdError = undefined;
        })
        .addCase(getNewsByIdThunk.rejected, (state , action ) => {
            state.getNewsByIdStatus = 'rejected';
            state.getNewsByIdError = action.payload;
        })
        // SLICE CREATE
        .addCase(createNewsThunk.pending, (state) => {
            state.createNewsStatus = 'pending';
        })
        .addCase(createNewsThunk.fulfilled, (state , action) => {
            state.createNewsStatus = 'fulfilled';
            state.newsById = action.payload;
            state.news.push(action.payload);
            state.createNewsError = undefined;
        })
        .addCase(createNewsThunk.rejected, (state , action) => {
            state.createNewsStatus = 'rejected';
            state.createNewsError = action.payload;
        })
        //SLICE UPDATE
        .addCase(updateNewsThunk.pending, (state) => {
            state.updateNewsStatus = 'pending';
        })
        .addCase(updateNewsThunk.fulfilled, (state , action ) => {
            state.updateNewsStatus = 'fulfilled';
            state.newsById = action.payload;
            const index = state.news.findIndex((newItem) => newItem.id === action.payload.id);
            if (index !== -1) {
                state.news[index] = action.payload;
            }
            state.updateNewsError = undefined;
        })
        .addCase(updateNewsThunk.rejected, (state ,action) => {
            state.updateNewsStatus = 'rejected';
            state.updateNewsError = action.payload;
        })
        // SLICE DELETE
        .addCase(deleteNewsThunk.pending , (state) => {
            state.deleteNewsStatus = 'pending'
        })
        .addCase(deleteNewsThunk.fulfilled, (state , action) => {
            state.deleteNewsStatus = 'fulfilled';
            state.news = state.news.filter((newItem) => newItem.id !== action.payload);
            if (state.newsById?.id === action.payload) {
                state.newsById = null;
            }
            state.deleteNewsError = undefined;
        })
        .addCase(deleteNewsThunk.rejected, ( state, action ) => {
            state.deleteNewsStatus = 'rejected'
            state.deleteNewsError = action.payload
        })
    }
})

export const { clearNewsId } = newsSlice.actions;
export const newsReducer = newsSlice.reducer;