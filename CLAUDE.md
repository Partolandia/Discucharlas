# Discucharlas — guía para trabajar en este repo

App de un club privado de escucha de podcasts. Mobile-first, en español de México.

## Fuentes de verdad

El paquete de handoff en Drive (PRD, brief técnico, modelo de datos, flujos y
permisos, backlog, criterios de QA) y el documento maestro v1.1. Cuando una
decisión no esté ahí, **señala el hueco y propone; no lo inventes** — en
particular valores HEX, tipografías, métricas e integraciones.

## Reglas que no se rompen

- Una sola sesión `upcoming` y una sola votación `open`. Está en índices únicos
  parciales, no solo en la UI.
- `session_private_notes` es solo de su autora. No hay excepción de admin.
- Siempre queda al menos una administradora activa (`set_member_role` /
  `set_member_status` lo garantizan transaccionalmente).
- Las invitadas nunca se autentican. No dar permisos al rol `anon`: su acceso se
  resuelve en el servidor tras validar la clave.
- La UI puede esconder cosas, pero quien autoriza es la base de datos: toda
  server action valida sesión y permiso **además** de RLS.
- Sin reacciones negativas en Comunidad.

## Convenciones

- Rutas y nombres de dominio en español (`/propuestas`, `/discucharla/[id]`).
- Copy cálido y directo; el vocabulario del club está en el documento maestro
  ("¿Vienes?", "¿Qué llevas?", "Nuestro círculo", "Volver a inicio").
- El color vive en tokens (`src/app/globals.css`), extraídos del prototipo
  V135. Nada de HEX sueltos en componentes.
- Propuestas va en olivo, nunca en lila o violeta.
- Fechas en UTC en la base; se muestran en `CLUB_TIMEZONE`.

## Antes de dar algo por terminado

```bash
npm run lint && npm run build && npm run db:test
```
