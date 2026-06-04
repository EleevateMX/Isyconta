"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendPush } from "@/lib/push";

export type AvisoState = { ok?: boolean; error?: string };

/** Crea un aviso broadcast. Solo staff (contador/admin). */
export async function crearAviso(_prev: AvisoState, formData: FormData): Promise<AvisoState> {
  const perfil = await requireStaff();
  const titulo = String(formData.get("titulo") ?? "").trim();
  const cuerpo = String(formData.get("cuerpo") ?? "").trim();
  const prioridad = String(formData.get("prioridad") ?? "NORMAL");

  if (!titulo || !cuerpo) return { error: "Título y mensaje son obligatorios." };

  const supabase = await createClient();
  const { error } = await supabase.from("avisos").insert({
    titulo,
    cuerpo,
    prioridad,
    autor_id: perfil.id,
    publicado: true,
  });
  if (error) return { error: error.message };

  // Push broadcast (fire-and-forget; no bloquea la respuesta).
  void sendPush({ title: `Aviso: ${titulo}`, body: cuerpo, url: "/avisos" }).catch(() => {});

  revalidatePath("/avisos");
  return { ok: true };
}
