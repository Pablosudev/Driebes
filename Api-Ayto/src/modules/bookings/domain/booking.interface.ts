export type BookingState = 'free' | 'pending' | 'reserved';

export interface BookingInterface {
  id: number;
  name: string;
  phone: string;
  startDate: string;
  endDate: string;
  state: BookingState;
  notes: string | null;
  createDate: string;
}

export type BookingInputInterface = Omit<BookingInterface, 'id' | 'state' | 'createDate'>;
