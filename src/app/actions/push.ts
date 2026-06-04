"use server";

import { requirePerfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type SubJSON = { endpoint: string; keys: { p256dh: string; auth: string } };

/** Guarda (upsert) la suscripción push del usuario autenticado. */
export async function guardarSuscripcion(sub: SubJSON): Promise<{ ok: boolean; error?: string }> {
  const perfil = await requirePerfil();
  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return { ok: false, error: "Suscripción inválida." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        usuario_id: perfil.id,
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
      },
      { onConflict: "endpoint" },
    );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Elimina una suscripción (al desactivar notificaciones en el dispositivo). */
export async function borrarSuscripcion(endpoint: string): Promise<{ ok: boolean }> {
  await requirePerfil();
  const supabase = await createClient();
  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
  return { ok: true };
}
