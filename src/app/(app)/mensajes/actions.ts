"use server";

import { revalidatePath } from "next/cache";
import { requirePerfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type EnviarState = { ok?: boolean; error?: string; conversacionId?: string };

/**
 * Envía un mensaje. Si no existe conversación para la empresa, la crea.
 * El cliente debe tener empresa asignada (la contadora la asigna al aprobar).
 */
export async function enviarMensaje(_prev: EnviarState, formData: FormData): Promise<EnviarState> {
  const perfil = await requirePerfil();
  const cuerpo = String(formData.get("cuerpo") ?? "").trim();
  let conversacionId = String(formData.get("conversacionId") ?? "").trim();

  if (!cuerpo) return { error: "Escribe un mensaje." };
  if (!perfil.empresa_id && perfil.rol === "CLIENTE") {
    return { error: "Tu cuenta aún no tiene empresa asignada. Avísale a tu contador." };
  }

  const supabase = await createClient();

  if (!conversacionId) {
    if (!perfil.empresa_id) return { error: "No hay empresa para iniciar la conversación." };
    const { data, error } = await supabase
      .from("conversaciones")
      .insert({ empresa_id: perfil.empresa_id, asunto: "Conversación general" })
      .select("id")
      .single();
    if (error || !data) return { error: error?.message ?? "No se pudo iniciar la conversación." };
    conversacionId = data.id as string;
  }

  const { error: msgErr } = await supabase.from("mensajes").insert({
    conversacion_id: conversacionId,
    autor_id: perfil.id,
    cuerpo,
  });
  if (msgErr) return { error: msgErr.message };

  await supabase
    .from("conversaciones")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversacionId);

  // TODO (futuro): Web Push al contador / al cliente según quién escribió.
  revalidatePath("/mensajes");
  return { ok: true, conversacionId };
}
