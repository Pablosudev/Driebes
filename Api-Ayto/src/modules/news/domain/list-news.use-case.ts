import type { NewInterface } from './news.interface';
import type { NewsRepository } from '../infrastructure/persistence/news.repository';

// Capa de DOMINIO.
// Un Use Case representa una acción de negocio: aquí, "listar las noticias".
// A diferencia de CreateNewsUseCase no tiene reglas de negocio que validar:
// se limita a pedir todas las noticias al repositorio (inyectado por constructor).
export class ListNewsUseCase {
  constructor(private readonly repositorio: NewsRepository) {}

  async execute(): Promise<NewInterface[]> {
    return this.repositorio.findAll();
  }
}
