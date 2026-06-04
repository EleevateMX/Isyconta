"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sendPush } from "@/lib/push";

type Result = { ok?: boolean; error?: string };

/** Crea una empresa (cliente del despacho). Solo staff. */
export async function crearEmpresa(_prev: Result, formData: FormData): Promise<Result> {
  await requireStaff();
  const razon_social = String(formData.get("razon_social") ?? "").trim();
  if (!razon_social) return { error: "La razón social es obligatoria." };

  const supabase = await createClient();
  const { error } = await supabase.from("empresas").insert({
    razon_social,
    rfc: String(formData.get("rfc") ?? "").trim() || null,
    regimen: String(formData.get("regimen") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    telefono: String(formData.get("telefono") ?? "").trim() || null,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { ok: true };
}

/** Aprueba una cuenta y (opcional) le asigna empresa. Solo staff. */
export async function aprobarCuenta(formData: FormData): Promise<void> {
  await requireStaff();
  const perfilId = String(formData.get("perfilId") ?? "");
  const empresaId = String(formData.get("empresaId") ?? "");
  if (!perfilId) return;

  const supabase = await createClient();
  await supabase
    .from("perfiles")
    .update({
      estado: "APROBADO",
      ...(empresaId ? { empresa_id: empresaId } : {}),
    })
    .eq("id", perfilId);

  void sendPush(
    { title: "¡Tu cuenta fue activada!", body: "Ya puedes entrar a tu portal de Isyconta.", url: "/dashboard" },
    [perfilId],
  ).catch(() => {});

  revalidatePath("/admin");
}

/** Cambia el estado de una cuenta (APROBADO / SUSPENDIDO / PENDIENTE). */
export async function cambiarEstado(formData: FormData): Promise<void> {
  await requireStaff();
  const perfilId = String(formData.get("perfilId") ?? "");
  const estado = String(formData.get("estado") ?? "");
  if (!perfilId || !["PENDIENTE", "APROBADO", "SUSPENDIDO"].includes(estado)) return;

  const supabase = await createClient();
  await supabase.from("perfiles").update({ estado }).eq("id", perfilId);
  revalidatePath("/admin");
}

/** Asigna / reasigna la empresa de un cliente. */
export async function asignarEmpresa(formData: FormData): Promise<void> {
  await requireStaff();
  const perfilId = String(formData.get("perfilId") ?? "");
  const empresaId = String(formData.get("empresaId") ?? "");
  if (!perfilId) return;

  const supabase = await createClient();
  await supabase
    .from("perfiles")
    .update({ empresa_id: empresaId || null })
    .eq("id", perfilId);
  revalidatePath("/admin");
}
