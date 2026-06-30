# Diseño API REST — Ayuntamiento

## Contexto

API REST para la gestión de servicios municipales: noticias del pueblo, eventos y reservas de un local municipal.

---

## 1. Noticias

### Modelo

| Campo       | Tipo     | Notas                              |
|-------------|----------|------------------------------------|
| id          | number   | Autoincremental                    |
| title       | string   | Requerido                          |
| description | string   | Requerido                          |
| image       | string   | URL/ruta del archivo, opcional     |
| uploadDate  | datetime | Autogenerada al crear              |

### Endpoints

| Método | Ruta            | Descripción                                          |
|--------|-----------------|------------------------------------------------------|
| GET    | /news           | Listar todas las noticias                            |
| GET    | /news/:id       | Obtener una noticia por ID                           |
| POST   | /news           | Crear una noticia (multipart/form-data para imagen)  |
| PUT    | /news/:id       | Actualizar una noticia                               |
| DELETE | /news/:id       | Eliminar una noticia                                 |

---

## 2. Eventos

### Modelo

| Campo         | Tipo     | Notas                                       |
|---------------|----------|---------------------------------------------|
| id            | number   | Autoincremental                             |
| title         | string   | Requerido                                   |
| description   | string   | Requerido                                   |
| image         | string   | URL/ruta del archivo, opcional              |
| creationDate  | datetime | Autogenerada al crear                       |
| eventDate     | datetime | Requerido                                   |
| category      | enum     | `deportivo`, `festivo`, `religioso`, `otro` |

### Endpoints

| Método | Ruta                         | Descripción                                       |
|--------|------------------------------|---------------------------------------------------|
| GET    | /events                      | Listar todos los eventos                          |
| GET    | /events/:id                  | Obtener un evento por ID                          |
| GET    | /events?category=deportivo   | Filtrar eventos por categoría                     |
| POST   | /events                      | Crear un evento (multipart/form-data para imagen) |
| PUT    | /events/:id                  | Actualizar un evento                              |
| DELETE | /events/:id                  | Eliminar un evento                                |

---

## 3. Reservas del local municipal

### Modelo

| Campo         | Tipo     | Notas                                     |
|---------------|----------|-------------------------------------------|
| id            | number   | Autoincremental                           |
| name          | string   | Nombre del solicitante, requerido         |
| phone         | string   | Contacto del solicitante, requerido       |
| startDate     | datetime | Requerido                                 |
| endDate       | datetime | Requerido                                 |
| state         | enum     | `libre`, `pendiente`, `reservado`         |
| notes         | string   | Observaciones, opcional                   |
| createDate    | datetime | Autogenerada al crear                     |

### Lógica de estados

- **pendiente** → el solicitante ha pedido la reserva, pendiente de confirmación
- **reservado** → la reserva ha sido confirmada por el ayuntamiento
- **libre** → estado calculado: rango de fechas sin reserva activa (no se persiste como registro)

### Endpoints

| Método | Ruta                       | Descripción                                        |
|--------|----------------------------|----------------------------------------------------|
| GET    | /bookings                  | Listar todas las reservas                          |
| GET    | /bookings/:id              | Obtener una reserva por ID                         |
| GET    | /bookings?state=pending    | Filtrar reservas por estado                        |
| GET    | /bookings?date=2026-07-01  | Consultar disponibilidad en una fecha concreta     |
| POST   | /bookings                  | Crear una solicitud de reserva (estado: pendiente) |
| PATCH  | /bookings/:id/state        | Cambiar estado de una reserva                      |
| DELETE | /bookings/:id              | Eliminar una reserva                               |

---

## Consideraciones generales

- **Subida de imágenes**: noticias y eventos aceptan `multipart/form-data`. Las imágenes se almacenan en disco local (carpeta `/uploads`) y se devuelve la URL de acceso.
- **Formato de respuesta**: JSON en todos los endpoints.
- **Errores**: respuestas estándar con código HTTP y mensaje descriptivo (`400`, `404`, `500`).
- **Base de datos**: a definir (SQLite para desarrollo, PostgreSQL/MySQL para producción).
