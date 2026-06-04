import { requirePerfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Chat } from "@/components/Chat";

export const dynamic = "force-dynamic";

export default async function MensajesPage() {
  const perfil = await requirePerfil();
  const supabase = await createClient();

  // Conversación de la empresa (la más reciente), o se crea al enviar el 1er mensaje.
  const { data: conversaciones } = await supabase
    .from("conversaciones")
    .select("id, asunto, estado")
    .order("updated_at", { ascending: false })
    .limit(1);

  const conv = conversaciones?.[0] ?? null;

  let mensajes: { id: string; cuerpo: string; autor_id: string | null; created_at: string }[] = [];
  if (conv) {
    const { data } = await supabase
      .from("mensajes")
      .select("id, cuerpo, autor_id, created_at")
      .eq("conversacion_id", conv.id)
      .order("created_at", { ascending: true })
      .limit(200);
    mensajes = (data ?? []) as typeof mensajes;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-900">Mensajes</h1>
        <p className="text-sm text-slate-500">
          Habla directo con tu contador. Todo queda registrado aquí, sin WhatsApp.
        </p>
      </div>
      <Chat
        conversacionId={conv?.id ?? null}
        empresaId={perfil.empresa_id}
        miId={perfil.id}
        inicial={mensajes}
      />
    </div>
  );
}
