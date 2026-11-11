/** Cuánto tarda cada viaje a Supabase, para saber qué recortar. */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const linea of readFileSync(".env.local", "utf8").split("\n")) {
  const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}

const cliente = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const medir = async (nombre, fn) => {
  const t = Date.now();
  await fn();
  console.log(`  ${nombre.padEnd(22)} ${String(Date.now() - t).padStart(5)} ms`);
};

const { data } = await cliente.auth.signInWithPassword({
  email: "ana@discucharlas.local",
  password: "discucharlas123",
});

await medir("getUser", () => cliente.auth.getUser());
await medir("getUser (2)", () => cliente.auth.getUser());
await medir("getClaims", () => cliente.auth.getClaims());
await medir("getClaims (2)", () => cliente.auth.getClaims());
await medir("perfil", () =>
  cliente.from("profiles").select("*").eq("id", data.user.id).single()
);
await medir("perfil (2)", () =>
  cliente.from("profiles").select("*").eq("id", data.user.id).single()
);
await medir("perfil (3)", () =>
  cliente.from("profiles").select("*").eq("id", data.user.id).single()
);
await medir("sesión próxima", () =>
  cliente.from("sessions").select("*").eq("status", "upcoming").maybeSingle()
);
await medir("conteo propuestas", () =>
  cliente.from("podcast_proposals").select("id", { count: "exact", head: true })
);
