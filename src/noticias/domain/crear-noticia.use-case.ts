import type { Noticia, NoticiaInput } from '../../types/noticia';
import type { NoticiaRepository } from '../infrastructure/persistence/noticia.repository';
import { ValidationError } from './errors';

// Capa de DOMINIO.
// Un Use Case representa una acción de negocio: aquí, "crear una noticia".
// Contiene las reglas de negocio (validación, fecha de subida) y delega el
// almacenamiento en el repositorio que recibe por inyección de dependencias.
export class CrearNoticiaUseCase {
  constructor(private readonly repositorio: NoticiaRepository) {}

  async execute(entrada: Partial<NoticiaInput>): Promise<Noticia> {
    const titulo = entrada.titulo?.trim();
    const descripcion = entrada.descripcion?.trim();

    if (!titulo || !descripcion) {
      throw new ValidationError('titulo y descripcion son obligatorios');
    }

    return this.repositorio.save({
      titulo,
      descripcion,
      imagen: entrada.imagen ?? null,
      fechaSubida: new Date().toISOString(),
    });
  }
}
