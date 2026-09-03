# Discucharlas

App móvil del club privado de escucha y conversación sobre podcasts.
Un solo club: integrantes, administradoras e invitadas.

El ciclo que sostiene el producto es **propuesta → votación → sesión → memoria**.

## Estado

| Área | Estado |
| :-- | :-- |
| Esquema de base de datos, RLS y reglas de negocio | Listo y probado |
| Landing pública + instalación PWA | Listo |
| Autenticación (entrar, salir, recuperar contraseña) | Listo |
| Sistema visual con los tokens del prototipo V135 | Listo |
| Cascarón de navegación, Inicio y Calendario | Listo |
| Detalle de discucharla (RSVP, aportes, notas, comentarios) | Listo |
| Propuestas, Comunidad, Club, Administración | En construcción |

## Stack

- **Next.js 16** (App Router, TypeScript) — UI mobile-first y server actions.
- **Supabase** — PostgreSQL, Auth (email + contraseña), Storage y RLS.
- **Resend** — correo transaccional.
- **Vercel** — despliegue.
- **PWA** — se instala desde el navegador. Sin App Store ni Google Play.

## Poner a correr el proyecto

```bash
npm install
cp .env.example .env.local     # y llena las variables
npm run dev
```

### Base de datos

Hay dos caminos y el código es idéntico en ambos: solo cambian las variables de entorno.

**A. Supabase local (necesita Docker)**

```bash
npx supabase start             # imprime URL y llaves para .env.local
npx supabase db reset          # aplica supabase/migrations y supabase/seed.sql
npm run sembrar                # club de demostración: cuentas, sesiones, votación
```

**B. Supabase en la nube**

```bash
npx supabase link --project-ref <ref>
npx supabase db push
```

La primera cuenta que se crea en un club vacío queda como **propietaria**; el
resto entra como integrante. Con `npm run sembrar` la propietaria es
`ana@discucharlas.local` / `discucharlas123`.

### Probar las reglas sin Docker

`npm run db:test` levanta el esquema sobre un Postgres normal (con un stub
mínimo de `auth`) y corre 43 aserciones de aislamiento de datos y reglas de
negocio: notas privadas, votos, datos de contacto, borradores, propietaria,
última administradora, caducidad de invitaciones, una sola discucharla próxima
y una sola votación activa.

### Tipos de TypeScript

`npm run tipos` regenera `src/lib/supabase/tipos.ts` desde el esquema real
(tablas, vistas, relaciones y funciones RPC). Córrelo después de cada
migración. Con Docker, `npx supabase gen types typescript --local` hace lo mismo.

## Estructura

```
src/app/            rutas (públicas, de integrante y de administración)
src/components/     componentes reutilizables
supabase/migrations esquema, funciones de negocio y políticas RLS
supabase/tests/     stub local de Supabase + pruebas de RLS
scripts/            utilidades de base de datos e iconos
```

## Decisiones que el código da por firmes

Vienen del documento maestro y del paquete de handoff:

- Una sola discucharla en estado *próxima* y una sola votación activa a la vez.
- Las notas privadas son de su autora. **Ni la administración las lee.**
- El club conserva siempre al menos una administradora activa; hay que retirar
  el rol antes de suspender la cuenta.
- Email y teléfono no son públicos entre integrantes; administración sí los ve.
- Las invitadas no se autentican: entran con una clave compartida revocable y
  su acceso se resuelve en el servidor, nunca dando permisos al rol anónimo.
- Solo reacciones positivas en Comunidad.
- Las propuestas que no ganan permanecen en el banco.

## Pendientes de decisión del club

Marcados como PENDIENTE en el documento maestro y **no inventados** aquí:

- Fotografía y collages reales para los headers editoriales.
Ya resueltos por el club (3 de septiembre de 2026): sí hay rol de propietaria,
y las invitaciones caducan un día antes de la próxima discucharla.

## Sistema visual

Los tokens de `src/app/globals.css` salen del prototipo V135 aprobado. Nada más
en la app codifica un color.

| Sección | Color |
| :-- | :-- |
| Inicio | Coral `#F05D50` |
| Calendario | Rosado `#C56F79` |
| Propuestas | Olivo `#7F8750` |
| Comunidad | Beige `#F7F0E5` con acento `#6F8F95` |
| Club | Ocre `#C68A3A` |
| Nuestras discucharlas y Guía | Morado oscuro `#54336E` |

El prototipo declara la votación en violeta y luego la sobrescribe con el bloque
olivo; nos quedamos con el olivo, que es además lo que fija el documento maestro.

Las tipografías del prototipo (Bodoni 72 y Avenir Next) solo existen en
dispositivos Apple. Usamos Playfair Display y DM Sans, que el propio prototipo ya
cargaba, para que se vea igual en Android y Windows.
