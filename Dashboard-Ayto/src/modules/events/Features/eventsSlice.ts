import { createSlice } from "@reduxjs/toolkit";
import type { EventStatus } from "../Interfaces/EventsInterface";
import { createEventThunk, getEventByIdThunk, getEventsThunk, updateEventThunk, deleteEventThunk } from "./eventsThunks";

const initialState: EventStatus = {
  events: [],
  eventById: null,
  getEventsStatus: "idle",
  getEventsError: undefined,
  getEventByIdStatus: "idle",
  getEventByIdError: undefined,
  createEventStatus: "idle",
  createEventError: undefined,
  updateEventStatus: "idle",
  updateEventError: undefined,
  deleteEventStatus: "idle",
  deleteEventError: undefined,
};

export const eventSlice = createSlice({
    name: 'events',
    initialState,
    reducers: {
        clearEventId(state){
            state.eventById = null
        }
    },
    extraReducers : (builder) => {
        builder
        .addCase(getEventsThunk.pending , (state) => {
            state.getEventsStatus = "pending"
        })
        .addCase(getEventsThunk.fulfilled , (state , action) => {
            state.getEventsStatus = "fulfilled"
            state.events = action.payload
            state.getEventsError = undefined
        })
        .addCase(getEventsThunk.rejected , (state , action) => {
            state.getEventsStatus = "rejected"
            state.getEventsError = action.payload
        })
        // GETBYID
        .addCase(getEventByIdThunk.pending , (state) => {
            state.getEventByIdStatus = "pending"
        })
        .addCase(getEventByIdThunk.fulfilled , (state , action) => {
            state.getEventByIdStatus = "fulfilled"
            state.eventById = action.payload
            state.getEventByIdError = undefined
        })
        .addCase(getEventByIdThunk.rejected , (state , action) => {
            state.getEventByIdStatus = "rejected"
            state.getEventByIdError = action.payload
        })
        // CREATE
        .addCase(createEventThunk.pending , (state) => {
            state.createEventStatus = "pending"
        })
        .addCase(createEventThunk.fulfilled , (state , action) => {
            state.createEventStatus = "fulfilled"
            state.eventById = action.payload
            state.events.push(action.payload)
            state.createEventError = undefined
        })
        .addCase(createEventThunk.rejected , (state , action) => {
            state.createEventStatus = "rejected"
            state.createEventError = action.payload
        })
        // UPDATE SLICE
        .addCase(updateEventThunk.pending , (state) => {
            state.updateEventStatus = "pending"
        })
        .addCase(updateEventThunk.fulfilled , (state , action) => {
            state.updateEventStatus = "fulfilled"
            state.eventById = action.payload
            const index = state.events.findIndex((event) => event.id === action.payload.id)
            if (index !== -1) {
                state.events[index] = action.payload
            }
            state.updateEventError = undefined
        })
        .addCase(updateEventThunk.rejected , (state , action) => {
            state.updateEventStatus = "rejected"
            state.updateEventError = action.payload
        })

        // DELETE SLICE

        .addCase(deleteEventThunk.pending , (state) => {
            state.deleteEventStatus = "pending"
        })
        .addCase(deleteEventThunk.fulfilled , (state , action) => {
            state.deleteEventStatus = "fulfilled"
            state.events = state.events.filter((event) => event.id !== action.payload)
            if (state.eventById?.id === action.payload) {
                state.eventById = null
            }
            state.deleteEventError = undefined
        })
        .addCase(deleteEventThunk.rejected , (state , action) => {
            state.deleteEventStatus = "rejected"
            state.deleteEventError = action.payload
        })

    }
})

export const { clearEventId } = eventSlice.actions;
export const eventReducer = eventSlice.reducer;
