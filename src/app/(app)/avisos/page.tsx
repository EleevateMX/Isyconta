import { requirePerfil, esStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NuevoAviso } from "@/components/NuevoAviso";

export const dynamic = "force-dynamic";

const prioridadColor: Record<string, string> = {
  NORMAL: "bg-slate-100 text-slate-600",
  IMPORTANTE: "bg-amber-100 text-amber-700",
  URGENTE: "bg-red-100 text-red-700",
};

export default async function AvisosPage() {
  const perfil = await requirePerfil();
  const staff = esStaff(perfil);
  const supabase = await createClient();

  const { data: avisos } = await supabase
    .from("avisos")
    .select("id, titulo, cuerpo, prioridad, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-brand-900">Avisos</h1>
      </div>

      {staff && <NuevoAviso />}

      <div className="space-y-3">
        {avisos && avisos.length > 0 ? (
          avisos.map((a) => (
            <article key={a.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display font-semibold text-brand-900">{a.titulo}</h2>
                <span className={`badge ${prioridadColor[a.prioridad as string] ?? prioridadColor.NORMAL}`}>
                  {a.prioridad as string}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{a.cuerpo}</p>
              <p className="mt-3 text-xs text-slate-400">
                {new Date(a.created_at as string).toLocaleString("es-MX")}
              </p>
            </article>
          ))
        ) : (
          <div className="card text-center text-sm text-slate-400">
            No hay avisos por el momento.
          </div>
        )}
      </div>
    </div>
  );
}
