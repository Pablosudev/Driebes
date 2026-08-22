import { createSlice } from "@reduxjs/toolkit";
import type { BookingStatus } from "../Interfaces/bookingsInterface";
import { createBookingThunk, deleteBookingThunk, getAllBookingsThunk, getBookingByIdThunk, updateBookingThunk } from "./bookingsThunks";

const initialState: BookingStatus = {
  bookings: [],
  bookingsById: null,
  getAllBookingsStatus: "idle",
  getAllBookingsError: undefined,
  getBookingsByIdStatus: "idle",
  getBookingsByIdError: undefined,
  createBookingsStatus: "idle",
  createBookingsError: undefined,
  updateBookingsStatus: "idle",
  updateBookingsError: undefined,
  deleteBookingsStatus: "idle",
  deleteBookingsError: undefined,
};

export const bookingSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    clearBookingId(state) {
      state.bookingsById = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllBookingsThunk.pending, (state) => {
        state.getAllBookingsStatus = "pending";
      })
      .addCase(getAllBookingsThunk.fulfilled, (state, action) => {
        state.getAllBookingsStatus = "fulfilled";
        state.bookings = action.payload;
        state.getAllBookingsError = undefined;
      })
      .addCase(getAllBookingsThunk.rejected, (state, action) => {
        state.getAllBookingsStatus = "rejected";
        state.getAllBookingsError = action.payload;
      })
      // SLICE ID
      .addCase(getBookingByIdThunk.pending, (state) => {
        state.getBookingsByIdStatus = "pending";
      })
      .addCase(getBookingByIdThunk.fulfilled , (state , action) => {
        state.getBookingsByIdStatus = "fulfilled"
        state.bookingsById = action.payload
        state.getBookingsByIdError = undefined;
      })
      .addCase(getBookingByIdThunk.rejected , (state , action) => {
        state.getBookingsByIdStatus = "rejected"
        state.getBookingsByIdError = action.payload;
      })
    //   SLICE CREATE
    .addCase(createBookingThunk.pending , (state ) => {
        state.createBookingsStatus = "pending"
    })
    .addCase(createBookingThunk.fulfilled , (state , action) => {
        state.createBookingsStatus = "fulfilled"
        state.bookingsById = action.payload
        state.bookings.push(action.payload)
        state.createBookingsError = undefined
    })
    .addCase(createBookingThunk.rejected , (state , action ) => {
      state.createBookingsStatus = "rejected"
      state.createBookingsError = action.payload
    })
    // SLICE UPDATE
    .addCase(updateBookingThunk.pending , (state) => {
        state.updateBookingsStatus = "pending"
    })
    .addCase(updateBookingThunk.fulfilled , (state , action) => {
        state.updateBookingsStatus = "fulfilled"
        state.bookingsById = action.payload
        const index = state.bookings.findIndex((booking) => booking.id === action.payload.id)
        if (index !== -1) {
            state.bookings[index] = action.payload
        }
        state.updateBookingsError = undefined
    })
    .addCase(updateBookingThunk.rejected , (state , action) => {
        state.updateBookingsStatus = "rejected"
        state.updateBookingsError = action.payload
    })
    // SLICE DELETE
    .addCase(deleteBookingThunk.pending , (state) => {
        state.deleteBookingsStatus = "pending"
    })
    .addCase(deleteBookingThunk.fulfilled , (state , action) =>{
        state.deleteBookingsStatus = "fulfilled"
        state.bookings = state.bookings.filter((booking) => booking.id !== action.payload)
        if (state.bookingsById?.id === action.payload) {
            state.bookingsById = null
        }
        state.deleteBookingsError = undefined
    })
    .addCase(deleteBookingThunk.rejected , (state , action) => {
        state.deleteBookingsStatus = "rejected"
        state.deleteBookingsError = action.payload
    })

  },
});

export const { clearBookingId } = bookingSlice.actions;
export const bookingReducer = bookingSlice.reducer;
