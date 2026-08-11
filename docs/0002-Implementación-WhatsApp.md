# 0002 - Compartir contenido mediante WhatsApp

## Objetivo

Incorporar al dashboard la posibilidad de compartir mediante **WhatsApp** la información almacenada en los módulos de:

* Eventos.
* Noticias.
* Ofertas de trabajo.

La finalidad es que el personal del ayuntamiento pueda reutilizar directamente la información ya introducida en el dashboard y compartirla con los vecinos sin tener que volver a redactar manualmente cada publicación.

La comunicación actual del ayuntamiento se realiza mediante un **grupo de WhatsApp con más de 100 participantes**, por lo que la solución debe ser compatible con este sistema de comunicación.

---

## Planteamiento inicial

Inicialmente se estudió realizar una integración directa entre el backend del dashboard y la **WhatsApp Business Platform / Cloud API**, de forma que al pulsar un botón desde el dashboard se enviase automáticamente una noticia, evento u oferta de trabajo al grupo de WhatsApp.

El flujo ideal habría sido:

```text
Dashboard
    ↓
Backend
    ↓
WhatsApp Cloud API
    ↓
Grupo del Ayuntamiento
    ↓
Vecinos
```

Sin embargo, antes de implementar esta arquitectura se revisaron las posibilidades y limitaciones de la API oficial de WhatsApp.

---

## Limitación de la API oficial

WhatsApp dispone actualmente de una **Groups API** dentro de WhatsApp Business Platform que permite crear y gestionar grupos mediante la API y utilizar el identificador del grupo como destinatario de mensajes.

Sin embargo, actualmente existe una limitación determinante para nuestro caso de uso:

> Los grupos gestionados mediante Groups API admiten un máximo de **8 participantes**.

Nuestro sistema de comunicación utiliza un grupo de WhatsApp con **más de 100 personas**, por lo que una integración directa mediante Groups API no cubre las necesidades actuales del Ayuntamiento.

Por este motivo se descarta, para esta fase del proyecto, la integración directa con WhatsApp Cloud API.

---

# Solución adoptada

Se utilizará el sistema de **compartir contenido mediante WhatsApp desde el frontend**.

En lugar de enviar automáticamente el mensaje al grupo, el dashboard generará el contenido que debe publicarse y abrirá WhatsApp con dicho mensaje ya preparado.

El trabajador únicamente tendrá que:

1. Pulsar **Compartir por WhatsApp**.
2. Seleccionar el grupo del Ayuntamiento.
3. Pulsar **Enviar**.

Por tanto, el flujo será:

```text
Dashboard
    ↓
Evento / Noticia / Oferta
    ↓
Generación automática del mensaje
    ↓
Compartir por WhatsApp
    ↓
WhatsApp
    ↓
Seleccionar grupo
    ↓
Enviar
```

Esta solución introduce únicamente un pequeño paso manual, pero permite mantener el grupo de WhatsApp que ya utiliza actualmente el Ayuntamiento.

---

# Motivos de la decisión

La decisión se toma principalmente por dos motivos.

## 1. Limitación técnica de WhatsApp Groups API

La API oficial no permite cubrir nuestro escenario actual debido al número de participantes del grupo.

Nuestro grupo:

```text
Grupo Ayuntamiento
        ↓
+100 participantes
```

Límite actual de Groups API:

```text
Grupo Groups API
        ↓
Máximo 8 participantes
```

Por tanto, adaptar el sistema de comunicación actual a Groups API obligaría a modificar completamente la forma en la que el Ayuntamiento se comunica actualmente con los vecinos.

---

## 2. No necesitamos automatización completa

El volumen de publicaciones de eventos, noticias y ofertas de trabajo no requiere inicialmente un sistema complejo de envío automatizado.

El objetivo principal es evitar que el trabajador tenga que:

```text
Consultar el dashboard
        ↓
Copiar el título
        ↓
Copiar la descripción
        ↓
Copiar fecha / ubicación
        ↓
Abrir WhatsApp
        ↓
Redactar nuevamente el mensaje
```

Con la solución adoptada:

```text
Consultar publicación
        ↓
Compartir por WhatsApp
        ↓
Seleccionar grupo
        ↓
Enviar
```

El dashboard se encargará automáticamente de preparar el contenido.

Esto reduce considerablemente el trabajo manual sin introducir infraestructura adicional.

---

# Arquitectura

Esta funcionalidad será responsabilidad exclusiva del **frontend**.

No será necesario modificar el backend.

Actualmente el backend ya proporciona mediante los diferentes endpoints CRUD toda la información necesaria:

```text
API
│
├── Events
├── News
└── Jobs
```

React obtiene estos datos y los almacena/gestiona mediante Redux Toolkit.

Por tanto, el proceso será:

```text
Backend
   ↓
GET recurso
   ↓
Redux Toolkit
   ↓
Componente React
   ↓
Formatter WhatsApp
   ↓
Servicio Share WhatsApp
   ↓
WhatsApp
```

No existe ninguna nueva comunicación:

```text
Backend → WhatsApp
```

ni será necesario almacenar tokens, credenciales o configuraciones relacionadas con WhatsApp Business Platform.

---

# Responsabilidades

La funcionalidad se dividirá en dos responsabilidades.

## Generación del mensaje

Cada tipo de recurso tendrá su propio formato de publicación.

Por ejemplo:

```text
Evento
↓
formatEventWhatsApp()

Noticia
↓
formatNewsWhatsApp()

Oferta de trabajo
↓
formatJobWhatsApp()
```

Esto permite que cada módulo decida qué información debe aparecer en WhatsApp.

Un evento podría generar:

```text
📢 NUEVO EVENTO

🎉 Fiesta de Verano

Celebración organizada por el Ayuntamiento.

📅 22 de agosto de 2026
📍 Plaza Mayor

Más información:
https://...
```

Mientras que una oferta de empleo podría generar:

```text
💼 NUEVA OFERTA DE EMPLEO

Auxiliar administrativo

Empresa: XXXXX
Ubicación: XXXXX

Descripción:
...

Más información:
https://...
```

---

## Compartir mediante WhatsApp

Existirá una función común encargada exclusivamente de recibir un mensaje y abrir WhatsApp.

Conceptualmente:

```ts
shareOnWhatsApp(message)
```

Esta función:

```text
Mensaje
   ↓
encodeURIComponent()
   ↓
URL de WhatsApp
   ↓
Abrir WhatsApp
```

De esta forma la lógica para abrir WhatsApp no estará duplicada en los módulos de eventos, noticias y empleo.

---

# Organización del proyecto

Dado que el proyecto utiliza una arquitectura organizada por módulos, mantendremos esta filosofía.

Cada módulo será responsable de construir su propio mensaje.

Una posible organización será:

```text
src/
├── modules/
│   │
│   ├── events/
│   │   ├── Features/
│   │   └── utils/
│   │       └── formatEventWhatsApp.ts
│   │
│   ├── news/
│   │   ├── Features/
│   │   └── utils/
│   │       └── formatNewsWhatsApp.ts
│   │
│   └── jobs/
│       ├── Features/
│       └── utils/
│           └── formatJobWhatsApp.ts
│
└── services/
    └── whatsapp/
        └── whatsapp.service.ts
```

Los formatters pertenecen a cada módulo porque conocen la estructura de su dominio.

Por ejemplo:

```text
formatEventWhatsApp
```

conoce propiedades como:

```text
title
description
date
location
```

mientras que:

```text
formatJobWhatsApp
```

puede trabajar con:

```text
title
company
description
location
requirements
```

El servicio:

```text
whatsapp.service.ts
```

no conocerá eventos, noticias ni ofertas.

Únicamente tendrá la responsabilidad de compartir un texto mediante WhatsApp.

Esto mantiene separadas las responsabilidades y evita acoplar la lógica de WhatsApp con los diferentes CRUD.

---

# Implementación conceptual

El servicio tendrá una función similar a:

```ts
export const shareOnWhatsApp = (message: string) => {
  const encodedMessage = encodeURIComponent(message);

  const whatsappUrl =
    `https://wa.me/?text=${encodedMessage}`;

  window.open(whatsappUrl, "_blank");
};
```

Un formatter de eventos podría tener una estructura similar a:

```ts
export const formatEventWhatsApp = (event: Event) => {
  return `
📢 NUEVO EVENTO

🎉 ${event.title}

${event.description}

📅 ${event.date}
📍 ${event.location}
  `.trim();
};
```

Y desde el componente:

```ts
const handleShareWhatsApp = () => {
  const message = formatEventWhatsApp(event);

  shareOnWhatsApp(message);
};
```

De esta forma cada parte tiene una única responsabilidad:

```text
Componente
    ↓
Solicita compartir

Formatter
    ↓
Construye el mensaje

WhatsApp Service
    ↓
Abre WhatsApp
```

---

# Integración en la interfaz

La funcionalidad se añadirá principalmente a las páginas de detalle de cada recurso.

Por ejemplo:

```text
EventDetail
NewsDetail
JobDetail
```

Dentro de estas páginas tendremos una sección de acciones similar a:

```text
[ Editar ]

[ Eliminar ]

[ Compartir por WhatsApp ]
```

El trabajador podrá revisar primero la información guardada antes de compartirla.

Esto evita realizar envíos accidentales directamente desde formularios de creación o edición.

---

# Backend

No se realizará ninguna modificación en el backend durante esta fase.

No será necesario crear:

```text
POST /events/:id/whatsapp

POST /news/:id/whatsapp

POST /jobs/:id/whatsapp
```

porque el servidor no realizará ningún envío.

El backend seguirá teniendo únicamente la responsabilidad de gestionar y proporcionar los recursos del sistema mediante los CRUD existentes.

```text
Backend
├── Auth
├── Events CRUD
├── News CRUD
├── Jobs CRUD
└── Bookings CRUD
```

La funcionalidad de compartir será una capacidad de presentación del frontend.

---

# Redux Toolkit

Tampoco será necesario incorporar nuevos thunks o estados Redux específicos para WhatsApp.

No tendremos operaciones como:

```text
sendWhatsAppThunk
```

porque no existe ninguna petición asíncrona hacia nuestra API.

Redux seguirá proporcionando los datos del recurso y el componente utilizará esos datos para generar el mensaje.

```text
Redux
   ↓
event
   ↓
formatEventWhatsApp(event)
   ↓
shareOnWhatsApp(message)
```

---

# Testing

La funcionalidad se cubrirá principalmente mediante tests unitarios de los formatters.

Por ejemplo:

```text
formatEventWhatsApp.test.ts

formatNewsWhatsApp.test.ts

formatJobWhatsApp.test.ts
```

Se comprobará que:

* Se incluye correctamente el título.
* Se incluye la descripción.
* Las fechas aparecen correctamente formateadas.
* Se incluyen los campos necesarios de cada recurso.
* No aparecen valores `undefined` o `null` en el mensaje.
* El resultado mantiene el formato esperado.

También se podrá comprobar que el servicio genera correctamente la URL utilizando `encodeURIComponent`.

No será necesario realizar tests contra la API de WhatsApp, ya que nuestra aplicación no realiza ninguna comunicación directa con ella.

---

# Ventajas de la solución

La arquitectura seleccionada presenta varias ventajas:

* No requiere modificar el backend.
* No requiere una cuenta de WhatsApp Business Platform para esta funcionalidad.
* No requiere almacenar tokens o credenciales de Meta.
* No introduce costes derivados del envío mediante API.
* Permite continuar utilizando el grupo actual del Ayuntamiento.
* Es compatible con grupos de más de 100 participantes al delegar en el usuario la selección del chat.
* Reduce significativamente el trabajo manual del trabajador.
* La implementación en React es pequeña y fácilmente mantenible.
* La lógica puede reutilizarse entre eventos, noticias y ofertas de empleo.
* No introduce nuevas dependencias externas.
* Permite evolucionar posteriormente hacia una integración más automatizada.

---

# Limitación asumida

La principal limitación de esta solución es que el dashboard **no puede seleccionar automáticamente el grupo del Ayuntamiento ni enviar el mensaje sin intervención del usuario**.

El sistema prepara el contenido y abre WhatsApp, pero el trabajador deberá seleccionar manualmente el grupo y confirmar el envío.

```text
Automático:

✅ Recuperar información
✅ Construir mensaje
✅ Formatear mensaje
✅ Abrir WhatsApp


Manual:

👤 Seleccionar grupo
👤 Pulsar enviar
```

Esta limitación se considera aceptable teniendo en cuenta el volumen de publicaciones y las restricciones actuales de la API oficial.

---

# Posible evolución futura

Esta decisión no impide incorporar WhatsApp Cloud API posteriormente.

Si en el futuro cambia el modelo de comunicación y el Ayuntamiento quiere enviar mensajes individuales a ciudadanos que hayan solicitado recibir comunicaciones mediante WhatsApp, se podrá estudiar una arquitectura diferente:

```text
Dashboard
    ↓
Backend
    ↓
WhatsApp Cloud API
    ↓
Suscriptores
```

WhatsApp Cloud API permite realizar comunicaciones programáticas mediante su API oficial y recibir eventos mediante webhooks.

Esta evolución requeriría analizar independientemente:

* Gestión de suscriptores.
* Consentimiento de los ciudadanos.
* WhatsApp Business Account.
* Plantillas de mensajes.
* Credenciales y tokens.
* Backend de mensajería.
* Registro de envíos.
* Gestión de errores.
* Costes asociados al servicio.

Estas necesidades quedan fuera del alcance de la implementación actual.

---

# Decisión final

Para esta fase se implementará **Compartir por WhatsApp desde el frontend**.

La decisión se basa en que el canal de comunicación existente es un grupo con más de 100 participantes, mientras que la Groups API oficial de WhatsApp tiene actualmente un límite de 8 participantes por grupo.

Por tanto, no resulta adecuado introducir una integración directa con WhatsApp Business Platform para resolver esta necesidad.

La solución elegida permite mantener el sistema de comunicación actual y simplificar notablemente el proceso de publicación:

```text
ANTES

Dashboard
   ↓
Consultar publicación
   ↓
Copiar información
   ↓
Abrir WhatsApp
   ↓
Redactar mensaje
   ↓
Seleccionar grupo
   ↓
Enviar


DESPUÉS

Dashboard
   ↓
Compartir por WhatsApp
   ↓
Seleccionar grupo
   ↓
Enviar
```

Se obtiene así una solución sencilla, mantenible y suficiente para las necesidades actuales, manteniendo abierta la posibilidad de evolucionar hacia WhatsApp Cloud API si los requisitos del proyecto cambian en el futuro.
