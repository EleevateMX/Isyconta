import Link from "next/link";
import { requirePerfil, esStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PushToggle } from "@/components/PushToggle";
import { IconChart, IconBell, IconChat } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const perfil = await requirePerfil();
  const supabase = await createClient();
  const staff = esStaff(perfil);

  // Próximas obligaciones (RLS filtra a la empresa del cliente).
  const { data: obligaciones } = await supabase
    .from("obligaciones_fiscales")
    .select("id, tipo, periodo, fecha_limite, estado")
    .neq("estado", "PAGADA")
    .order("fecha_limite", { ascending: true })
    .limit(4);

  const { data: avisos } = await supabase
    .from("avisos")
    .select("id, titulo, prioridad, created_at")
    .eq("publicado", true)
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-900">
          Hola, {(perfil.nombre || perfil.email).split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-slate-500">
          {staff
            ? "Panel del despacho. Gestiona clientes, avisos y obligaciones."
            : "Aquí está el resumen de tu situación fiscal."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Próximas obligaciones */}
        <section className="card">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display font-semibold text-brand-900">
              <IconChart className="h-4 w-4 text-brand-600" />
              Próximas obligaciones
            </h2>
            <Link href="/fiscal" className="text-sm font-medium text-brand-700">
              Ver todo →
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {obligaciones && obligaciones.length > 0 ? (
              obligaciones.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {o.tipo} · {o.periodo}
                    </p>
                    <p className="text-xs text-slate-500">
                      {o.fecha_limite ? `Vence ${o.fecha_limite}` : "Sin fecha"}
                    </p>
                  </div>
                  <EstadoBadge estado={o.estado as string} />
                </li>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-slate-400">Sin obligaciones pendientes.</p>
            )}
          </ul>
        </section>

        {/* Avisos recientes */}
        <section className="card">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display font-semibold text-brand-900">
              <IconBell className="h-4 w-4 text-brand-600" />
              Avisos recientes
            </h2>
            <Link href="/avisos" className="text-sm font-medium text-brand-700">
              Ver todo →
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {avisos && avisos.length > 0 ? (
              avisos.map((a) => (
                <li key={a.id} className="rounded-xl bg-slate-50 px-3 py-2">
                  <p className="text-sm font-medium text-slate-800">{a.titulo}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(a.created_at as string).toLocaleDateString("es-MX")}
                  </p>
                </li>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-slate-400">Sin avisos por ahora.</p>
            )}
          </ul>
        </section>
      </div>

      <section className="card">
        <h2 className="flex items-center gap-2 font-display font-semibold text-brand-900">
          <IconChat className="h-4 w-4 text-brand-600" />
          ¿Necesitas algo?
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Escríbele directo a tu contador desde la app, sin WhatsApp.
        </p>
        <Link href="/mensajes" className="btn-primary mt-3">
          Abrir conversación
        </Link>
      </section>

      <section className="card">
        <h2 className="font-display font-semibold text-brand-900">Notificaciones</h2>
        <p className="mb-3 mt-1 text-sm text-slate-600">
          Recibe tus avisos y mensajes directo en este dispositivo.
        </p>
        <PushToggle />
      </section>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, string> = {
    PENDIENTE: "bg-slate-100 text-slate-600",
    EN_PROCESO: "bg-amber-100 text-amber-700",
    PRESENTADA: "bg-blue-100 text-blue-700",
    PAGADA: "bg-emerald-100 text-emerald-700",
    VENCIDA: "bg-red-100 text-red-700",
  };
  return <span className={`badge ${map[estado] ?? map.PENDIENTE}`}>{estado.replace("_", " ")}</span>;
}
