export interface JobInterface {
  id: number;
  title: string;
  description: string;
  requirements: string;
  companyName: string;
  phone: string | null;
  email: string | null;
  createDate: string;
}

// Campos que aporta el cliente al crear (el resto se autogenera).
export type JobInputInterface = Omit<JobInterface, 'id' | 'createDate'>;
