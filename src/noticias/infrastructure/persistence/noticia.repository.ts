import type { Noticia } from '../../../types/noticia';


export interface NoticiaRepository {
  save(datos: Omit<Noticia, 'id'>): Promise<Noticia>;
}


export class InMemoryNoticiaRepository implements NoticiaRepository {
  private noticias: Map<number, Noticia> = new Map();
  private nextId: number = 1;

  async save(datos: Omit<Noticia, 'id'>): Promise<Noticia> {
    const noticia: Noticia = { id: this.nextId++, ...datos };
    this.noticias.set(noticia.id, noticia);
    return noticia;
  }
}
