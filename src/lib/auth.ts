import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Rol = "CLIENTE" | "CONTADOR" | "ADMIN";
export type EstadoCuenta = "PENDIENTE" | "APROBADO" | "SUSPENDIDO";

export type Perfil = {
  id: string;
  email: string;
  nombre: string;
  rol: Rol;
  estado: EstadoCuenta;
  empresa_id: string | null;
};

/**
 * Devuelve el perfil del usuario autenticado, o null si no hay sesión.
 * El perfil vive en la tabla `perfiles` (1:1 con auth.users).
 */
export async function getPerfil(): Promise<Perfil | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("perfiles")
    .select("id, email, nombre, rol, estado, empresa_id")
    .eq("id", user.id)
    .single();

  return (data as Perfil | null) ?? null;
}

/** Exige sesión + cuenta APROBADA. Redirige si no cumple. */
export async function requirePerfil(): Promise<Perfil> {
  const perfil = await getPerfil();
  if (!perfil) redirect("/login");
  if (perfil.estado !== "APROBADO") redirect("/pendiente");
  return perfil;
}

/** Exige rol de despacho (contador o admin). */
export async function requireStaff(): Promise<Perfil> {
  const perfil = await requirePerfil();
  if (perfil.rol === "CLIENTE") redirect("/dashboard");
  return perfil;
}

export function esStaff(perfil: Perfil): boolean {
  return perfil.rol === "CONTADOR" || perfil.rol === "ADMIN";
}
