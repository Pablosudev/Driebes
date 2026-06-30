// Errores de la capa de DOMINIO.
// Se lanzan cuando se incumple una regla de negocio. La capa de transporte
// es la encargada de traducirlos al código HTTP correspondiente.
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Se lanza cuando se pide un recurso que no existe. La capa de transporte
// lo traduce a un 404.
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}
