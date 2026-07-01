// Modelo de dominio de una Noticia.
// Basado en el contrato definido en docs/openapi.yaml.
export interface NewInterface {
  id: number;
  title: string;
  description: string;
  image: string | null;
  uploadDate: string;
}

// Datos de entrada para crear o actualizar una noticia.
// Los campos autogenerados (id, fechaSubida) quedan fuera.
export type NewInputInterface = Omit<NewInterface, 'id' | 'uploadDate'>;
