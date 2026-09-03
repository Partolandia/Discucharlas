# Discucharlas

App móvil del club privado de escucha y conversación sobre podcasts.
Un solo club: integrantes, administradoras e invitadas.

El ciclo que sostiene el producto es **propuesta → votación → sesión → memoria**.

## Estado

| Área | Estado |
| :-- | :-- |
| Esquema de base de datos, RLS y reglas de negocio | Listo y probado |
| Landing pública + instalación PWA | Listo |
| Autenticación, alta por invitación y acceso de invitadas | Listo |
| Sistema visual con los tokens del prototipo V135 | Listo |
| Inicio, Calendario y detalle de la discucharla | Listo |
| Propuestas con votación, Comunidad y Club | Listo |
| Administración: discucharlas, votación, integrantes y accesos | Listo |
| Memoria del club, guía y avisos | Listo |
| Exportación del historial a Excel | Listo y probado |
| Correo transaccional | Pendiente (falta la llave de Resend) |
| Collages de los encabezados | Pendiente (ver `public/colaje/`) |

## Stack

- **Next.js 16** (App Router, TypeScript) — UI mobile-first y server actions.
- **Supabase** — PostgreSQL, Auth (email + contraseña), Storage y RLS.
- **Resend** — correo transaccional.
- **Vercel** — despliegue.
- **PWA** — se instala desde el navegador. Sin App Store ni Google Play.

## Primera vez, paso a paso

Todo se corre desde una terminal **dentro de la carpeta del proyecto**. Los
comandos de abajo están escritos para **Git Bash** en Windows, que también
sirven tal cual en Mac y Linux.

### 1. Instala lo necesario

- **Node.js 22 LTS** — https://nodejs.org (el instalador por omisión basta).
- **Git para Windows**, que incluye Git Bash — https://git-scm.com/downloads

Cierra y vuelve a abrir Git Bash, y comprueba que responden:

```bash
node -v
git --version
```

### 2. Baja el proyecto

```bash
cd ~/Documents
git clone https://github.com/Partolandia/Discucharlas.git
cd Discucharlas
npm install
```

A partir de aquí, **todos los comandos se corren dentro de esa carpeta**. Si
abres una terminal nueva, vuelve con `cd ~/Documents/Discucharlas`.

### 3. Conecta la base de datos

Elige un camino. El código es idéntico en los dos: solo cambian tres variables.

**A. Supabase en la nube (recomendado para empezar)**

No hay que instalar nada más y es el mismo camino que usará producción.

1. Crea un proyecto gratis en https://supabase.com.
2. En *Project Settings → API*, copia la URL y las dos llaves.
3. Crea `.env.local` a partir de la plantilla y llena los valores:

```bash
cp .env.example .env.local
```

4. Aplica el esquema:

```bash
npx supabase login
npx supabase link --project-ref TU_REF
npx supabase db push
```

**B. Supabase local (todo en tu máquina, necesita Docker)**

Instala **Docker Desktop** (https://docker.com) y déjalo abierto. Después:

```bash
npx supabase start      # imprime la URL y las llaves para .env.local
npx supabase db reset   # aplica migraciones y contenido inicial
```

### 4. Siembra un club de prueba y arranca

```bash
npm run sembrar
npm run dev
```

Abre http://localhost:3000 y entra con `ana@discucharlas.local` y la contraseña
`discucharlas123`. Esa cuenta es la propietaria del club.

Si estás en el camino A (nube), el sembrado se niega a correr por accidente
contra algo que no sea local. Para autorizarlo:

```bash
SEMBRAR_EN_SERIO=si npm run sembrar
```

### Después de la primera vez

Solo necesitas esto para trabajar:

```bash
npm run dev
```

Y `npx supabase start` antes, si elegiste el camino B.

### Ver el sistema visual sin nada de lo anterior

```bash
npm install
npm run dev
```

Y abre http://localhost:3000/vista-previa/calendario. La landing y la vista
previa funcionan sin base de datos.

### Si algo se atora en Git Bash

Git Bash no siempre entrega bien el teclado a los programas que hacen preguntas
interactivas. Si un comando se queda colgado esperando respuesta, repítelo con
`winpty` delante:

```bash
winpty npx supabase login
```

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
