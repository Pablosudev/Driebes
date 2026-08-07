# Arquitectura por capas — guía para principiantes

Esta guía explica **cómo está organizado el código** de esta API y **para qué sirve cada carpeta**. Está pensada para quien empieza a estudiar arquitectura de software, así que va paso a paso y con ejemplos.

---

## 1. La idea en una frase

> Dividimos el programa en **capas**, y **cada capa tiene una sola responsabilidad**.

¿Por qué? Porque un código donde "todo hace de todo" es difícil de entender, de probar y de cambiar. Si cada parte tiene un trabajo claro, todo es más fácil.

### La analogía del restaurante 🍽️

Imagina un restaurante. Nadie hace todo a la vez; cada persona tiene su papel:

| En el restaurante | En nuestro código | Su trabajo |
|-------------------|-------------------|------------|
| El **camarero** | **Transporte** (`transport/`) | Recibe lo que pide el cliente y le trae la respuesta. No cocina. |
| El **cocinero** y sus **recetas** | **Dominio** (`domain/`) | Las reglas de verdad: qué se puede hacer y cómo. El corazón del negocio. |
| La **despensa / nevera** | **Persistencia** (`persistence/`) | Guarda y saca los datos (ingredientes). |
| El **encargado** | El fichero `*.module.ts` | Conecta a todos entre sí para que trabajen juntos. |

El cliente (quien usa la API) solo habla con el camarero. No entra en la cocina ni en la despensa. Igual que en el código: el mundo exterior solo habla con la capa de transporte.

---

## 2. Mapa de carpetas

```
src/
├── app.ts                     # Junta toda la app y "monta" los routers
├── server.ts                  # Arranca el servidor (lo pone a escuchar)
│
├── modules/                   # Cada subcarpeta = UNA funcionalidad del negocio
│   ├── bookings/              #   Reservas
│   ├── news/                  #   Noticias
│   └── events/                #   Eventos
│       │
│       ├── events.module.ts   # EL "ENCARGADO": enchufa las piezas del módulo
│       │
│       ├── domain/            # CAPA 1 — REGLAS DE NEGOCIO (el corazón)
│       │   ├── event.interface.ts      # El modelo: cómo es un "evento"
│       │   ├── create-event.use-case.ts# Una acción de negocio (crear)
│       │   ├── ...otros use-case.ts    # Una acción por fichero
│       │   └── errors.ts               # Errores de negocio (p. ej. "no existe")
│       │
│       └── infrastructure/    # CAPA 2 y 3 — EL MUNDO EXTERIOR (lo técnico)
│           ├── persistence/            # Guardar/leer datos
│           │   ├── event.repository.ts         #   contrato + versión en memoria
│           │   └── prisma-event.repository.ts  #   versión con base de datos
│           └── transport/              # Entrada/salida por HTTP
│               └── events.router.ts            #   rutas y respuestas ("controlador")
│
├── db/prisma.ts               # Conexión a la base de datos (cliente Prisma)
├── generated/prisma/          # Código autogenerado por Prisma (NO se edita a mano)
├── types/                     # Tipos generales (de librerías, no del negocio)
└── test/                      # Pruebas automáticas de cada módulo
```

La idea clave: **organizamos primero por funcionalidad** (`bookings`, `news`, `events`) y, **dentro de cada una, por capas** (`domain`, `infrastructure`).

---

## 3. Las capas explicadas (de dentro hacia fuera)

### 🟢 Dominio (`domain/`) — el corazón

Aquí viven las **reglas del negocio**, sin nada técnico. Ni HTTP, ni base de datos.

- **`*.interface.ts`** → describe **cómo es** una cosa del negocio (un evento tiene `title`, `description`, `eventDate`, `category`...). Es "el molde".
- **`*.use-case.ts`** → **una acción** del negocio por fichero (crear, listar, borrar...). Aquí están las decisiones: *"si faltan datos, es un error"*, *"no puede haber dos reservas el mismo día"*.
- **`errors.ts`** → los errores propios del negocio (por ejemplo, `NotFoundError` cuando algo no existe).

> Regla mental: si borraras Express y la base de datos, **el dominio debería seguir teniendo sentido**. Son las reglas puras.

### 🔵 Persistencia (`infrastructure/persistence/`) — la despensa

Se encarga de **guardar y recuperar datos**. Aquí ocurre algo importante:

- El fichero `*.repository.ts` define un **contrato** (una *interfaz*): *"quien guarde reservas debe saber `save`, `findById`, `delete`..."*.
- Y luego hay **dos implementaciones** de ese contrato:
  - `InMemory...Repository` → guarda en memoria (se borra al apagar). Ideal para **pruebas**.
  - `Prisma...Repository` → guarda en una base de datos de verdad, a través de Prisma.

Como ambas cumplen el mismo contrato, **podemos cambiar una por otra sin tocar las reglas de negocio**. Es como cambiar la nevera por una despensa: al cocinero le da igual, sigue pidiendo "tráeme los huevos".

### 🟠 Transporte (`infrastructure/transport/`) — el camarero

Es la puerta de entrada por **HTTP**. El `*.router.ts` (también llamado *controlador*):

1. Recibe la petición (lee la URL, el `body`, los parámetros).
2. Llama al **use case** correspondiente del dominio.
3. Traduce el resultado a una respuesta HTTP (código `200`, `404`, `400`... y el JSON).

No contiene reglas de negocio: solo **traduce** entre "el mundo HTTP" y "el mundo del dominio".

### ⚙️ El `*.module.ts` — el encargado

Crea las piezas y las **conecta** entre sí: elige qué repositorio usar (memoria o MySQL), crea los use cases con ese repositorio y se los pasa al router. A esto se le llama *inyección de dependencias*.

---

## 4. La regla de oro: las flechas apuntan al centro

```
   Mundo exterior (HTTP, base de datos)
                 │
        depende de ▼
   ┌───────────────────────────┐
   │  Transporte  +  Persistencia   │   (infrastructure = detalles técnicos)
   └───────────────┬───────────────┘
        depende de ▼
        ┌───────────────────┐
        │      Dominio      │   (las reglas, el centro)
        └───────────────────┘
```

- El **dominio NO conoce** a Express ni a MySQL.
- Son las capas de fuera las que **dependen** del dominio, nunca al revés.

Por eso el dominio dice *"necesito algo que sepa guardar reservas"* (define la interfaz) y la persistencia responde *"yo sé hacerlo"* (la implementa). El corazón manda; los detalles se adaptan.

---

## 5. Ejemplo real: crear una reserva (`POST /bookings`)

Sigue el recorrido de una petición por las capas:

```
1. Llega  POST /bookings  con { name, phone, startDate, endDate }
                                   │
2. TRANSPORTE  (bookings.router.ts)
      Lee el body y llama a  createBooking.execute(...)
                                   │
3. DOMINIO  (create-booking.use-case.ts)
      Comprueba que no falten datos        → si faltan, ValidationError (400)
      Comprueba que el día esté libre       → si está ocupado, ConflictError (409)
      Si todo va bien, pide guardar la reserva
                                   │
4. PERSISTENCIA  (booking.repository.ts)
      Guarda la reserva (en memoria o en MySQL)
                                   │
5. La respuesta vuelve hacia fuera y el TRANSPORTE responde  201  con el JSON
```

Fíjate: cada capa hace **solo su parte** y le pasa el trabajo a la siguiente.

---

## 6. ¿Por qué molestarse en separar tanto?

- ✅ **Se entiende mejor**: cada fichero tiene un objetivo claro.
- ✅ **Se prueba fácil**: podemos testear las reglas usando el repositorio en memoria, **sin necesidad de una base de datos**.
- ✅ **Se cambia sin miedo**: pasar de memoria a MySQL **no obliga a tocar las reglas de negocio** (solo cambiamos la implementación del repositorio).
- ✅ **Crece ordenado**: para añadir una función nueva, se sabe exactamente dónde va cada cosa.

---

## 7. Ficheros de apoyo (fuera de los módulos)

| Fichero / carpeta | Para qué sirve |
|-------------------|----------------|
| `app.ts` | Crea la aplicación Express y **monta** los routers de cada módulo (`/bookings`, `/news`, `/events`). |
| `server.ts` | Pone la aplicación **a escuchar** en un puerto (el arranque). |
| `db/prisma.ts` | La **conexión** a la base de datos, compartida por los repositorios Prisma. |
| `generated/prisma/` | Código que **Prisma genera solo** a partir del esquema. No se edita a mano. |
| `types/` | Tipos generales que **no son del negocio** (por ejemplo, de una librería). |
| `test/` | Las **pruebas automáticas** que comprueban que todo funciona. |

---

### Resumen de una línea

> **Transporte** habla HTTP · **Dominio** pone las reglas · **Persistencia** guarda los datos · y las flechas siempre apuntan hacia el **dominio**.
