"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { notifyEmpresa } from "@/lib/push";

type Result = { ok?: boolean; error?: string };

const ESTADOS = ["PENDIENTE", "EN_PROCESO", "PRESENTADA", "PAGADA", "VENCIDA"];

/** Crea una obligación fiscal para una empresa. Solo staff. */
export async function crearObligacion(_prev: Result, formData: FormData): Promise<Result> {
  const perfil = await requireStaff();
  const empresa_id = String(formData.get("empresa_id") ?? "");
  const tipo = String(formData.get("tipo") ?? "").trim();
  const periodo = String(formData.get("periodo") ?? "").trim();
  if (!empresa_id) return { error: "Selecciona una empresa." };
  if (!tipo || !periodo) return { error: "Tipo y periodo son obligatorios." };

  const montoRaw = String(formData.get("monto") ?? "").trim();
  const fechaRaw = String(formData.get("fecha_limite") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase.from("obligaciones_fiscales").insert({
    empresa_id,
    tipo,
    periodo,
    fecha_limite: fechaRaw || null,
    estado: String(formData.get("estado") ?? "PENDIENTE"),
    monto: montoRaw ? Number(montoRaw) : null,
    notas: String(formData.get("notas") ?? "").trim() || null,
    actualizado_por: perfil.id,
  });
  if (error) return { error: error.message };

  void notifyEmpresa(empresa_id, {
    title: "Nueva obligación fiscal",
    body: `${tipo} · ${periodo}`,
    url: "/fiscal",
  }).catch(() => {});

  revalidatePath("/fiscal");
  return { ok: true };
}

/** Cambia el estado de una obligación. Solo staff. */
export async function actualizarEstadoObligacion(formData: FormData): Promise<void> {
  const perfil = await requireStaff();
  const id = String(formData.get("id") ?? "");
  const estado = String(formData.get("estado") ?? "");
  if (!id || !ESTADOS.includes(estado)) return;

  const supabase = await createClient();
  await supabase
    .from("obligaciones_fiscales")
    .update({ estado, actualizado_por: perfil.id, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/fiscal");
}
