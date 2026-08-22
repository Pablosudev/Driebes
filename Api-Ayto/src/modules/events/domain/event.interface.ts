// En español porque es el texto que se muestra: no hay capa de traduccion.
export type Category = 'Deportivo' | 'Festivo' | 'Religioso' | 'Otro';

export interface EventInterface {
  id: number;
  title: string;
  description: string;
  image: string | null;
  creationDate: string;
  eventDate: string;
  category: Category;
}

export type EventInputInterface = Omit<EventInterface, 'id' | 'creationDate'>;
