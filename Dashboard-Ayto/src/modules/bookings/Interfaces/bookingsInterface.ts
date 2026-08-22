import type { RequestStatus } from "../../../shared/types";

// Los nombres de los campos son los que expone la API (state / notes).
export type BookingState = "free" | "pending" | "reserved";

export interface BookingInterface {
    id : number,
    name: string,
    phone: string,
    startDate: string,
    endDate: string,
    state: BookingState,
    notes: string | null,
    createDate: string,
}
export type AllBookings = BookingInterface[]

export type BookingInput = Omit<BookingInterface , 'id' | 'createDate'>

export interface BookingStatus {
    bookings : AllBookings;
    bookingsById: BookingInterface | null;
    getAllBookingsStatus : RequestStatus;
    getAllBookingsError : string | undefined;
    getBookingsByIdStatus : RequestStatus;
    getBookingsByIdError : string | undefined;
    createBookingsStatus : RequestStatus;
    createBookingsError : string | undefined;
    updateBookingsStatus : RequestStatus;
    updateBookingsError : string | undefined;
    deleteBookingsStatus : RequestStatus;
    deleteBookingsError : string | undefined;
}