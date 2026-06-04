import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Cliente Supabase para Server Components / Server Actions / Route Handlers.
 * Lee y escribe la sesión desde las cookies de la request.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set({ name, value, ...(options ?? {}) }),
            );
          } catch {
            // Llamado desde un Server Component: lo maneja el middleware.
          }
        },
      },
    },
  );
}

/**
 * Cliente con service-role para tareas administrativas (crear usuarios,
 * aprobar accesos, enviar push). NUNCA exponer al cliente.
 */
export async function createAdminClient() {
  const { createClient: createSb } = await import("@supabase/supabase-js");
  return createSb(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `Falta la variable de entorno ${name}. Copia .env.example a .env.local y llénala.`,
    );
  }
  // Saneo defensivo: en algunos shells se cuela \r\n al final.
  return v.replace(/[\r\n\s]+$/g, "");
}
