
export interface NewInterface {
  id: number;
  title: string;
  description: string;
  image: string | null;
  uploadDate: string;
}


export type NewInputInterface = Omit<NewInterface, 'id' | 'uploadDate'>;
