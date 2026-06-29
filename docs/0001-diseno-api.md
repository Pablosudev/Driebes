# Diseño API REST — Ayuntamiento

## Contexto

API REST para la gestión de servicios municipales: noticias del pueblo, eventos y reservas de un local municipal.

---

## 1. Noticias

### Modelo

| Campo       | Tipo     | Notas                              |
|-------------|----------|------------------------------------|
| id          | number   | Autoincremental                    |
| titulo      | string   | Requerido                          |
| descripcion | string   | Requerido                          |
| imagen      | string   | URL/ruta del archivo, opcional     |
| fechaSubida | datetime | Autogenerada al crear              |

### Endpoints

| Método | Ruta            | Descripción                                          |
|--------|-----------------|------------------------------------------------------|
| GET    | /noticias       | Listar todas las noticias                            |
| GET    | /noticias/:id   | Obtener una noticia por ID                           |
| POST   | /noticias       | Crear una noticia (multipart/form-data para imagen)  |
| PUT    | /noticias/:id   | Actualizar una noticia                               |
| DELETE | /noticias/:id   | Eliminar una noticia                                 |

---

## 2. Eventos

### Modelo

| Campo         | Tipo     | Notas                                       |
|---------------|----------|---------------------------------------------|
| id            | number   | Autoincremental                             |
| titulo        | string   | Requerido                                   |
| descripcion   | string   | Requerido                                   |
| imagen        | string   | URL/ruta del archivo, opcional              |
| fechaCreacion | datetime | Autogenerada al crear                       |
| fechaEvento   | datetime | Requerido                                   |
| categoria     | enum     | `deportivo`, `festivo`, `religioso`, `otro` |

### Endpoints

| Método | Ruta                         | Descripción                                       |
|--------|------------------------------|---------------------------------------------------|
| GET    | /eventos                     | Listar todos los eventos                          |
| GET    | /eventos/:id                 | Obtener un evento por ID                          |
| GET    | /eventos?categoria=deportivo | Filtrar eventos por categoría                     |
| POST   | /eventos                     | Crear un evento (multipart/form-data para imagen) |
| PUT    | /eventos/:id                 | Actualizar un evento                              |
| DELETE | /eventos/:id                 | Eliminar un evento                                |

---

## 3. Reservas del local municipal

### Modelo

| Campo         | Tipo     | Notas                                     |
|---------------|----------|-------------------------------------------|
| id            | number   | Autoincremental                           |
| nombre        | string   | Nombre del solicitante, requerido         |
| telefono      | string   | Contacto del solicitante, requerido       |
| fechaInicio   | datetime | Requerido                                 |
| fechaFin      | datetime | Requerido                                 |
| estado        | enum     | `libre`, `pendiente`, `reservado`         |
| notas         | string   | Observaciones, opcional                   |
| fechaCreacion | datetime | Autogenerada al crear                     |

### Lógica de estados

- **pendiente** → el solicitante ha pedido la reserva, pendiente de confirmación
- **reservado** → la reserva ha sido confirmada por el ayuntamiento
- **libre** → estado calculado: rango de fechas sin reserva activa (no se persiste como registro)

### Endpoints

| Método | Ruta                       | Descripción                                        |
|--------|----------------------------|----------------------------------------------------|
| GET    | /reservas                  | Listar todas las reservas                          |
| GET    | /reservas/:id              | Obtener una reserva por ID                         |
| GET    | /reservas?estado=pendiente | Filtrar reservas por estado                        |
| GET    | /reservas?fecha=2026-07-01 | Consultar disponibilidad en una fecha concreta     |
| POST   | /reservas                  | Crear una solicitud de reserva (estado: pendiente) |
| PATCH  | /reservas/:id/estado       | Cambiar estado de una reserva                      |
| DELETE | /reservas/:id              | Eliminar una reserva                               |

---

## Consideraciones generales

- **Subida de imágenes**: noticias y eventos aceptan `multipart/form-data`. Las imágenes se almacenan en disco local (carpeta `/uploads`) y se devuelve la URL de acceso.
- **Formato de respuesta**: JSON en todos los endpoints.
- **Errores**: respuestas estándar con código HTTP y mensaje descriptivo (`400`, `404`, `500`).
- **Base de datos**: a definir (SQLite para desarrollo, PostgreSQL/MySQL para producción).
