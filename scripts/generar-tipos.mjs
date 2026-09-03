/**
 * Genera src/lib/supabase/tipos.ts leyendo el catálogo de Postgres.
 *
 * Existe porque `supabase gen types` necesita Docker; esto solo necesita psql.
 * Con Docker a la mano, `npx supabase gen types typescript --local` equivale.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const PUERTO = process.env.PGPORT_LOCAL ?? "54322";
const BASE = process.env.PGDATABASE_LOCAL ?? "discucharlas_test";

function consultar(sql) {
  const salida = execFileSync(
    "psql",
    ["-h", "/tmp", "-p", PUERTO, "-U", "postgres", "-d", BASE, "-t", "-A", "-c", sql],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
  ).trim();
  return salida ? JSON.parse(salida) : [];
}

// --- relaciones -------------------------------------------------------------
const RELACIONES = `
select coalesce(json_agg(r), '[]') from (
  select
    src.relname as tabla,
    c.conname   as nombre,
    tgt.relname as referencia,
    array_agg(sa.attname order by k.ord) as columnas,
    array_agg(ta.attname order by k.ord) as columnas_referidas
  from pg_constraint c
  join pg_class src on src.oid = c.conrelid
  join pg_class tgt on tgt.oid = c.confrelid
  join lateral unnest(c.conkey)  with ordinality k(attnum, ord) on true
  join lateral unnest(c.confkey) with ordinality f(attnum, ord) on f.ord = k.ord
  join pg_attribute sa on sa.attrelid = c.conrelid  and sa.attnum = k.attnum
  join pg_attribute ta on ta.attrelid = c.confrelid and ta.attnum = f.attnum
  where c.contype = 'f' and src.relnamespace = 'public'::regnamespace
  group by src.relname, c.conname, tgt.relname
) r;`;

// --- tablas y vistas --------------------------------------------------------
const RELS = `
select coalesce(json_agg(t), '[]') from (
  select
    c.relname as nombre,
    c.relkind as clase,
    json_agg(json_build_object(
      'columna', a.attname,
      'tipo',    format_type(a.atttypid, a.atttypmod),
      'nulo',    not a.attnotnull,
      'default', pg_get_expr(d.adbin, d.adrelid) is not null
    ) order by a.attnum) as columnas
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  join pg_attribute a on a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
  left join pg_attrdef d on d.adrelid = c.oid and d.adnum = a.attnum
  where n.nspname = 'public' and c.relkind in ('r','v')
  group by c.relname, c.relkind
  order by c.relname
) t;`;

// --- funciones RPC ----------------------------------------------------------
const FUNCIONES = `
select coalesce(json_agg(f), '[]') from (
  select
    p.proname as nombre,
    coalesce(p.proargnames, '{}'::text[]) as nombres,
    coalesce((
      select array_agg(format_type(u.t, null) order by u.ord)
      from unnest(string_to_array(nullif(p.proargtypes::text, ''), ' ')::oid[])
        with ordinality u(t, ord)
    ), '{}'::text[]) as tipos,
    p.pronargdefaults as con_default,
    pg_get_function_result(p.oid) as resultado
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.prokind = 'f'
    and p.prorettype <> 'trigger'::regtype
  order by p.proname
) f;`;

const relaciones = consultar(RELS);
const fks = consultar(RELACIONES);
const funciones = consultar(FUNCIONES);

function aTipoTS(pg) {
  const limpio = pg.replace(/^setof\s+/i, "").trim();
  if (limpio.endsWith("[]")) return `${aTipoTS(limpio.slice(0, -2))}[]`;
  if (/^(uuid|text|character varying|character|citext|name)$/.test(limpio)) return "string";
  if (/^(timestamp|date|time|interval)/.test(limpio)) return "string";
  if (/^(smallint|integer|bigint|numeric|real|double precision|decimal)$/.test(limpio)) return "number";
  if (limpio === "boolean") return "boolean";
  if (/^(json|jsonb)$/.test(limpio)) return "Json";
  if (limpio === "void") return "undefined";
  return "unknown";
}

function relacionesDe(tabla) {
  const propias = fks.filter((f) => f.tabla === tabla);
  if (propias.length === 0) return "      Relationships: []";
  const cuerpo = propias
    .map(
      (f) =>
        `        {\n` +
        `          foreignKeyName: "${f.nombre}"\n` +
        `          columns: [${f.columnas.map((c) => `"${c}"`).join(", ")}]\n` +
        `          referencedRelation: "${f.referencia}"\n` +
        `          referencedColumns: [${f.columnas_referidas.map((c) => `"${c}"`).join(", ")}]\n` +
        `        }`
    )
    .join(",\n");
  return `      Relationships: [\n${cuerpo}\n      ]`;
}

function bloqueRelacion(rel) {
  const fila = rel.columnas
    .map((c) => `        ${c.columna}: ${aTipoTS(c.tipo)}${c.nulo ? " | null" : ""}`)
    .join(",\n");

  if (rel.clase === "v") {
    return `    ${rel.nombre}: {\n      Row: {\n${fila}\n      }\n${relacionesDe(rel.nombre)}\n    }`;
  }

  const insert = rel.columnas
    .map((c) => {
      const opcional = c.nulo || c.default;
      return `        ${c.columna}${opcional ? "?" : ""}: ${aTipoTS(c.tipo)}${c.nulo ? " | null" : ""}`;
    })
    .join(",\n");
  const update = rel.columnas
    .map((c) => `        ${c.columna}?: ${aTipoTS(c.tipo)}${c.nulo ? " | null" : ""}`)
    .join(",\n");

  return (
    `    ${rel.nombre}: {\n      Row: {\n${fila}\n      }\n` +
    `      Insert: {\n${insert}\n      }\n` +
    `      Update: {\n${update}\n      }\n${relacionesDe(rel.nombre)}\n    }`
  );
}

function bloqueFuncion(f) {
  const total = f.nombres.length;
  // Los últimos `con_default` argumentos tienen valor por omisión.
  const desdeOpcional = total - (f.con_default ?? 0);
  const args =
    total === 0
      ? "      Args: Record<PropertyKey, never>"
      : `      Args: {\n${f.nombres
          .map(
            (n, i) =>
              `        ${n}${i >= desdeOpcional ? "?" : ""}: ${aTipoTS(f.tipos[i] ?? "text")}`
          )
          .join("\n")}\n      }`;
  return `    ${f.nombre}: {\n${args}\n      Returns: ${aTipoTS(f.resultado)}\n    }`;
}

const tablas = relaciones.filter((r) => r.clase === "r");
const vistas = relaciones.filter((r) => r.clase === "v");

const contenido = `// Generado por scripts/generar-tipos.mjs desde el esquema real. No editar a mano.
// Regenerar con: npm run tipos

export type Json = string | number | boolean | null | { [k: string]: Json } | Json[]

export type Database = {
  public: {
    Tables: {
${tablas.map(bloqueRelacion).join("\n")}
    }
    Views: {
${vistas.map(bloqueRelacion).join("\n")}
    }
    Functions: {
${funciones.map(bloqueFuncion).join("\n")}
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

type Publico = Database["public"]

export type Tabla<N extends keyof Publico["Tables"]> = Publico["Tables"][N]["Row"]
export type Insertar<N extends keyof Publico["Tables"]> = Publico["Tables"][N]["Insert"]
export type Actualizar<N extends keyof Publico["Tables"]> = Publico["Tables"][N]["Update"]
export type Vista<N extends keyof Publico["Views"]> = Publico["Views"][N]["Row"]
`;

writeFileSync("src/lib/supabase/tipos.ts", contenido);
console.log(
  `tipos generados: ${tablas.length} tablas, ${vistas.length} vistas, ${funciones.length} funciones`
);
