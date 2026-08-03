# 0001 - Planteamiento inicial

## Proyecto

**Dashboard Ayto** — dashboard de gestión para un ayuntamiento.

## Alcance de la Fase 1

La primera fase contempla la gestión de las siguientes herramientas:

1. **Login** — autenticación de usuarios del dashboard.
2. **CRUD de eventos** — gestión de eventos del ayuntamiento.
3. **CRUD de ofertas de trabajo** — gestión de ofertas de empleo publicadas por el ayuntamiento.
4. **CRUD de noticias** — gestión de noticias del ayuntamiento.
5. **CRUD de reservas** — gestión de reservas del local del ayuntamiento.

## Stack tecnológico

- **TypeScript**
- **React** con **Vite**
- **Redux Toolkit** para la gestión de estado
- **Vitest** como framework de testing

## Estructura de carpetas

El proyecto sigue una organización **por módulos** (feature-based), donde cada funcionalidad de negocio vive en su propia carpeta dentro de `src/modules/`, en lugar de agrupar por tipo de archivo (todos los slices juntos, todos los componentes juntos, etc.). Esto mantiene cada CRUD autocontenido y facilita añadir o quitar funcionalidades sin tocar el resto.

```
src/
├── store/
│   └── store.ts
└── modules/
    ├── events/
    │   └── Features/
    │       ├── eventsSlice.ts
    │       └── eventsThunks.ts
    ├── jobs/
    │   └── Features/
    │       ├── jobsSlice.ts
    │       └── jobsThunks.ts
    ├── news/
    │   └── Features/
    │       ├── newsSlice.ts
    │       └── newsThunks.ts
    └── bookings/
        └── Features/
            ├── bookingsSlice.ts
            └── bookingsThunks.ts
```

Cada módulo (`events`, `jobs`, `news`, `bookings`) representa una de las herramientas CRUD de la Fase 1, y dentro de su carpeta `Features/` concentra la lógica de estado de Redux Toolkit:

- **`<modulo>Slice.ts`**: define el `slice` de Redux Toolkit del módulo — estado inicial, reducers síncronos y los `extraReducers` que reaccionan a los thunks (estados `pending` / `fulfilled` / `rejected` de las operaciones CRUD).
- **`<modulo>Thunks.ts`**: define los `createAsyncThunk` del módulo — las llamadas asíncronas a la API para crear, leer, actualizar y eliminar los recursos de ese dominio (eventos, ofertas de trabajo, noticias o reservas).

El módulo `login` sigue el mismo patrón: `src/modules/login/Features/authSlice.ts` y `authThunk.ts`. El hashing de contraseñas (bcrypt) es responsabilidad exclusiva del backend — el frontend envía `email`/`password` en texto plano sobre HTTPS y nunca maneja hashes.

`src/store/store.ts` es el punto central donde se combinan los reducers de todos los módulos (`events`, `jobs`, `news`, `bookings` y, en el futuro, `auth`) en un único store de Redux Toolkit mediante `configureStore`.

Cada módulo, además de `Features/`, incorporará progresivamente sus propios componentes de UI (formularios y listados del CRUD) y sus tests con Vitest, manteniendo la misma carpeta como límite del módulo.
