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

`db:test` levanta un Postgres local y corre `supabase/tests/10_rls_test.sql`:
necesita bash y Postgres, así que solo funciona en Linux o en el contenedor.
En Windows el equivalente portable es `npm run db:rls`, que comprueba las
mismas garantías de aislamiento contra el proyecto real entrando con cada
cuenta por la API. No sustituye al de SQL —ese también prueba disparadores,
índices y el arranque del club— pero cubre lo que vive la app.

Para revisar las pantallas contra el prototipo: `npm run capturar` entra como
`ana@discucharlas.local` y deja las capturas en `.prototipo/app/`.

## Cuando llegue una versión nueva del prototipo

El HTML son 9 MB y casi todo su peso son imágenes en base64, así que no se
compara línea a línea. El orden que funciona:

```bash
node scripts/diff-prototipo.mjs <html-viejo> <html-nuevo>   # bloques <style>/<script>
node scripts/diff-cuerpo.mjs    <html-viejo> <html-nuevo>   # marcado, sin estilos ni scripts
node scripts/portar-prototipo.mjs prototipo-sesiones-v2.html  # imágenes
node scripts/portar-estilos.mjs  prototipo-sesiones-v2.html   # CSS desde el DOM ya renderizado
```

`portar-estilos` tiene que ir después y es el que manda: buena parte del
sistema visual lo inyectan los guiones tardíos y solo aparece en el DOM.

El material de origen (`Developer Pack/`, el HTML y `.devpack/`) está en
`.gitignore`: son decenas de megas que no son la app.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
