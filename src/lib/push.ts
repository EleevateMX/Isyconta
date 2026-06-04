import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/server";

export type PushPayload = { title: string; body: string; url?: string };

let configured = false;

function ready(): boolean {
  // Sin service-role no podemos leer las suscripciones de todos → push deshabilitado.
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return false;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.replace(/[\r\n\s]+/g, "");
  const priv = process.env.VAPID_PRIVATE_KEY?.replace(/[\r\n\s]+/g, "");
  if (!pub || !priv) return false;
  if (!configured) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:contacto@isyconta.mx",
      pub,
      priv,
    );
    configured = true;
  }
  return true;
}

/** Envía push a usuarios específicos (o a todos si no se pasan ids). Fire-and-forget. */
export async function sendPush(payload: PushPayload, usuarioIds?: string[]): Promise<void> {
  if (!ready()) return;
  const admin = await createAdminClient();

  let q = admin.from("push_subscriptions").select("id, endpoint, p256dh, auth");
  if (usuarioIds && usuarioIds.length > 0) q = q.in("usuario_id", usuarioIds);
  const { data } = await q;
  if (!data || data.length === 0) return;

  const body = JSON.stringify(payload);
  await Promise.all(
    data.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint as string, keys: { p256dh: s.p256dh as string, auth: s.auth as string } },
          body,
        );
      } catch (err) {
        const code = (err as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) {
          await admin.from("push_subscriptions").delete().eq("id", s.id);
        }
      }
    }),
  );
}

/** Notifica a todo el staff (contador/admin) aprobado. */
export async function notifyStaff(payload: PushPayload): Promise<void> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  const admin = await createAdminClient();
  const { data } = await admin
    .from("perfiles")
    .select("id")
    .in("rol", ["CONTADOR", "ADMIN"])
    .eq("estado", "APROBADO");
  const ids = (data ?? []).map((p) => p.id as string);
  if (ids.length) await sendPush(payload, ids);
}

/** Notifica a los usuarios de una empresa (clientes). */
export async function notifyEmpresa(empresaId: string, payload: PushPayload): Promise<void> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  const admin = await createAdminClient();
  const { data } = await admin.from("perfiles").select("id").eq("empresa_id", empresaId);
  const ids = (data ?? []).map((p) => p.id as string);
  if (ids.length) await sendPush(payload, ids);
}
