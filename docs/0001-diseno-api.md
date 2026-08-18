# Diseño API REST — Ayuntamiento

## Contexto

API REST para la gestión de servicios municipales: noticias del pueblo, eventos, reservas de un local municipal y ofertas de trabajo.

Las operaciones de gestión están protegidas con autenticación (ver sección 1). Las lecturas de eventos son públicas para que pueda consumirlas la web municipal.

---

## 1. Autenticación

Autenticación basada en **JWT** (token firmado). El login lo utilizan los administradores del ayuntamiento (personal municipal) para gestionar noticias, eventos, reservas y ofertas de trabajo.

### Regla de acceso

Todos los endpoints requieren un token JWT válido, **salvo estas excepciones públicas**:

- `POST /auth/login` — necesario para obtener el token.
- `GET /health` — comprobación de estado del servicio.
- `GET /events` y `GET /events/:id` — consulta pública de eventos.
- `GET /bookings/calendar` — consulta pública de los días ocupados del local, sin datos del solicitante (ver `0002-actualizacion-booking-calendar.md`).

### Modelo (Usuario administrador)

| Campo        | Tipo     | Notas                                             |
|--------------|----------|---------------------------------------------------|
| id           | number   | Autoincremental                                   |
| email        | string   | Único, requerido                                  |
| passwordHash | string   | Hash de la contraseña (bcrypt/argon2), nunca se devuelve en las respuestas |
| name         | string   | Nombre del usuario, requerido                     |
| createDate   | datetime | Autogenerada al crear                             |

> No existe endpoint público de registro. Los usuarios administradores se crean por semilla inicial o de forma manual (fuera del alcance de este documento).

### Endpoints

| Método | Ruta          | Descripción                                                            |
|--------|---------------|------------------------------------------------------------------------|
| POST   | /auth/login   | **Público.** Recibe `{ email, password }` y devuelve `{ token, user }` |
| POST   | /auth/logout  | Requiere token. Cierra la sesión del cliente                           |
| GET    | /auth/me      | Requiere token. Devuelve el usuario autenticado                        |

### Flujo del token

1. Un login válido devuelve un token firmado (HS256) con caducidad (`JWT_EXPIRES_IN`), usando el secreto `JWT_SECRET`.
2. El cliente envía el token en cada petición protegida mediante la cabecera `Authorization: Bearer <token>`.
3. Un middleware (`requireAuth`) verifica el token; si es válido, añade el usuario a la petición (`req.user`); si falta, es inválido o ha caducado → `401`.
4. **Logout**: al ser JWT *stateless*, el cliente descarta el token. Opcionalmente, el servidor puede mantener una lista de revocación (*denylist*) para invalidarlo antes de su caducidad.

### Errores

- `400` — credenciales mal formadas (falta email o password).
- `401` — credenciales inválidas, o token ausente / inválido / caducado.
- `403` — reservado para permisos insuficientes (si en el futuro se añaden roles).

---

## 2. Noticias

### Modelo

| Campo       | Tipo     | Notas                              |
|-------------|----------|------------------------------------|
| id          | number   | Autoincremental                    |
| title       | string   | Requerido                          |
| description | string   | Requerido                          |
| image       | string   | URL/ruta del archivo, opcional     |
| uploadDate  | datetime | Autogenerada al crear              |

### Endpoints

Todos requieren autenticación (ver sección 1).

| Método | Ruta            | Descripción                                          |
|--------|-----------------|------------------------------------------------------|
| GET    | /news           | Listar todas las noticias                            |
| GET    | /news/:id       | Obtener una noticia por ID                           |
| POST   | /news           | Crear una noticia (multipart/form-data para imagen)  |
| PUT    | /news/:id       | Actualizar una noticia                               |
| DELETE | /news/:id       | Eliminar una noticia                                 |

---

## 3. Eventos

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

Las lecturas (`GET`) son públicas. Crear, actualizar y eliminar eventos requiere autenticación (ver sección 1).

| Método | Ruta                         | Descripción                                       |
|--------|------------------------------|---------------------------------------------------|
| GET    | /events                      | **Público.** Listar todos los eventos             |
| GET    | /events/:id                  | **Público.** Obtener un evento por ID             |
| GET    | /events?category=Deportivo   | **Público.** Filtrar eventos por categoría        |
| POST   | /events                      | Crear un evento (multipart/form-data para imagen) |
| PUT    | /events/:id                  | Actualizar un evento                              |
| DELETE | /events/:id                  | Eliminar un evento                                |

---

## 4. Reservas del local municipal

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

Todos requieren autenticación (ver sección 1).

| Método | Ruta                       | Descripción                                        |
|--------|----------------------------|----------------------------------------------------|
| GET    | /bookings                  | Listar todas las reservas                          |
| GET    | /bookings/:id              | Obtener una reserva por ID                         |
| POST   | /bookings                  | Crear una solicitud de reserva (estado: pendiente) |
| PUT    | /bookings/:id              | Actualizar una reserva, incluido su estado         |
| DELETE | /bookings/:id              | Eliminar una reserva                               |

> Existe además `GET /bookings/calendar`, **público** y sin datos del solicitante, para el calendario de la web municipal. Su contrato está en `0002-actualizacion-booking-calendar.md`.

---

## 5. Ofertas de trabajo

Bolsa de empleo municipal: el ayuntamiento publica y gestiona ofertas de trabajo (CRUD completo).

### Modelo

| Campo        | Tipo     | Notas                                     |
|--------------|----------|-------------------------------------------|
| id           | number   | Autoincremental                           |
| title        | string   | Requerido                                 |
| description  | string   | Requerido                                 |
| requirements | string   | Requisitos del puesto (texto libre), requerido |
| companyName  | string   | Nombre de la empresa, requerido           |
| phone        | string   | Contacto, opcional                        |
| email        | string   | Contacto, opcional                        |
| createDate   | datetime | Autogenerada al crear                     |

### Endpoints

Todos requieren autenticación (ver sección 1).

| Método | Ruta        | Descripción                       |
|--------|-------------|-----------------------------------|
| GET    | /jobs       | Listar todas las ofertas          |
| GET    | /jobs/:id   | Obtener una oferta por ID         |
| POST   | /jobs       | Crear una oferta                  |
| PUT    | /jobs/:id   | Actualizar una oferta             |
| DELETE | /jobs/:id   | Eliminar una oferta               |

---
