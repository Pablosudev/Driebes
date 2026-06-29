// Modelo de dominio de una Noticia.
// Basado en el contrato definido en docs/openapi.yaml.
export interface Noticia {
  id: number;
  titulo: string;
  descripcion: string;
  imagen: string | null;
  fechaSubida: string;
}

// Datos de entrada para crear o actualizar una noticia.
// Los campos autogenerados (id, fechaSubida) quedan fuera.
export type NoticiaInput = Omit<Noticia, 'id' | 'fechaSubida'>;
