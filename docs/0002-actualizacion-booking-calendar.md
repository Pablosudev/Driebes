# Actualización — Calendario público de reservas

> Extiende `docs/0001-diseno-api.md`, sección 4 (Reservas del local municipal).

---

## 1. La necesidad

La web municipal necesita mostrar un calendario con la ocupación del local, para que cualquier vecino vea de un vistazo qué días están libres antes de solicitar una reserva.

Hoy eso no se puede hacer, y por dos motivos distintos:

1. **Todos los endpoints de `/bookings` exigen token.** La web es pública y no tiene credenciales, así que no puede consultarlos.
2. **Los endpoints existentes devuelven la reserva completa**, con `name`, `phone` y `notes`. Son datos personales del solicitante y no pueden salir a una página pública.

Hay, por tanto, dos consumidores con necesidades muy distintas:

| Consumidor | Qué necesita | Con qué lo resuelve |
|---|---|---|
| **Panel de administración** | La reserva completa, para gestionarla | Los endpoints protegidos de `/bookings`, sin cambios |
| **Web municipal** | Solo qué días están ocupados, para pintar un calendario | Un endpoint nuevo, público y sin datos personales |

Lo que la web realmente necesita saber se reduce a dos datos: **el día y su estado**.

---

## 2. La decisión

Se añade un endpoint público:

```
GET /bookings/calendar
```

Devuelve **únicamente los días ocupados y su estado**. Ni un campo más.

Los endpoints protegidos de `/bookings` **no cambian**: el panel de administración sigue funcionando exactamente igual. Este endpoint no sustituye a nada, se suma.

Se resuelve con una ruta propia, y no ampliando el listado existente con algún parámetro, porque son dos contratos con reglas de privacidad distintas. Teniéndolos separados, la respuesta pública no puede filtrar un campo personal por descuido al tocar la del panel.

---

## 3. Contrato del endpoint

### Parámetros de consulta

Ambos son opcionales.

| Parámetro | Formato | Por defecto | Descripción |
|---|---|---|---|
| `from` | `YYYY-MM-DD` | El día de hoy | Primer día del rango consultado |
| `to` | `YYYY-MM-DD` | Sin límite | Último día del rango consultado |

El rango es **inclusivo** en ambos extremos, igual que el resto de la lógica de reservas.

### Respuesta

`200 OK` con un array de días ocupados, ordenados cronológicamente:

```json
[
  { "date": "2026-07-01", "state": "reserved" },
  { "date": "2026-07-02", "state": "reserved" },
  { "date": "2026-07-05", "state": "pending" }
]
```

Cada elemento tiene exactamente dos campos:

| Campo | Tipo | Valores |
|---|---|---|
| `date` | string | Día en formato `YYYY-MM-DD` |
| `state` | enum | `pending` o `reserved` |

Un rango sin ocupación devuelve un array vacío (`200`, no `404`).

### Ejemplos

```
GET /bookings/calendar
        → todos los días ocupados desde hoy en adelante

GET /bookings/calendar?from=2026-07-01&to=2026-07-31
        → solo la ocupación de julio de 2026

GET /bookings/calendar?to=2026-12-31
        → desde hoy hasta fin de año
```

### Errores

| Código | Cuándo |
|---|---|
| `400` | `from` o `to` no tienen el formato `YYYY-MM-DD` |
| `500` | Error no contemplado |

No hay `401` (es público) ni `404` (un rango vacío es una respuesta válida).

---

## 4. Reglas

- **Solo se devuelven los días ocupados.** Un día que no aparece en la respuesta está libre. No se envía el estado `libre` ni se rellena el calendario completo: sería mucha respuesta para no añadir información.
- **Una reserva de varios días se expande a un elemento por día.** Una reserva del 1 al 3 de julio produce tres elementos. Así la web pinta el calendario directamente, sin tener que calcular rangos.
- **Solo cuentan los estados que bloquean el calendario:** `pendiente` y `reservado`. Son los mismos que ya definen la ocupación en `domain/availability.ts`, así que el calendario público y la detección de conflictos al crear una reserva no pueden contradecirse.
- **`libre` nunca aparece.** Es un estado calculado que no se persiste, y aquí se expresa por ausencia.
- **Si varias reservas solapan el mismo día**, ese día aparece una sola vez. Prevalece `reservado` sobre `pendiente`: un día confirmado está confirmado, aunque además haya una solicitud pendiente encima.

---

## 5. Privacidad

Lo que **sí** sale: el día y su estado.

Lo que **no** sale, y es lo importante:

| Campo | Motivo |
|---|---|
| `name` | Dato personal del solicitante |
| `phone` | Dato personal del solicitante |
| `notes` | Puede contener información sensible del uso previsto |
| `id` | Evita que se pueda referenciar una reserva concreta desde fuera |
| `createDate` | No aporta nada a la web y revela cuándo se pidió |

Queda una cesión consciente: distinguir `pendiente` de `reservado` revela que **existe** una solicitud sobre una fecha, aunque nunca de quién. Se acepta porque es justo lo que la web necesita para diferenciar un día solicitado de uno confirmado. Si en el futuro se prefiere no revelarlo, la alternativa es colapsar ambos estados en un único valor `occupied`.

---

## 6. Impacto en el código

Este documento fija el contrato; la implementación queda pendiente. Tres puntos a tener en cuenta cuando se aborde:

### El montaje de `/bookings` tiene que cambiar

Ahora mismo `app.ts` protege el módulo entero desde fuera:

```ts
app.use('/bookings', requireAuth, buildBookingsRouter());
```

Con una ruta pública dentro, ese `requireAuth` global ya no sirve. Hay que seguir el patrón que **ya usa el módulo de eventos**, que tiene el mismo problema (lecturas públicas, escrituras protegidas): pasar el middleware al router y aplicarlo ruta por ruta.

```ts
app.use('/bookings', buildBookingsRouter(requireAuth));
```

### Orden de declaración de las rutas

`GET /bookings/calendar` debe declararse **antes** de `GET /bookings/:id`. Express resuelve por orden de registro, así que si `:id` va primero capturaría el texto `calendar` como identificador y el endpoint respondería un `404` en lugar del calendario.

### Dónde vive la lógica

Expandir las reservas a días sueltos y decidir qué ocupa el calendario son reglas de negocio, así que van en el dominio, como un caso de uso nuevo del módulo de reservas. Debe reutilizar los estados que bloquean el calendario definidos en `domain/availability.ts`, para no duplicar el criterio de ocupación.

---
