import type { RequestStatus } from "../../../shared/types";

export type Category = 'sports' | 'festive' | 'religious' | 'other';

export type AllEventsInterface = EventInterface[];

export interface EventInterface {
  id: number;
  title: string;
  description: string;
  image: string | null;
  creationDate: string;
  eventDate: string;
  category: Category;
}

export type EventFormInput = Omit<EventInterface, 'id' | 'creationDate' | 'image'> & { image: File | null };


export interface EventStatus {
  events: AllEventsInterface;
  eventById: EventInterface | null;
  getEventsStatus: RequestStatus;
  getEventsError: string | undefined;
  getEventByIdStatus: RequestStatus;
  getEventByIdError: string | undefined;
  createEventStatus: RequestStatus;
  createEventError: string | undefined;
  updateEventStatus: RequestStatus;
  updateEventError: string | undefined;
  deleteEventStatus: RequestStatus;
  deleteEventError: string | undefined;
}