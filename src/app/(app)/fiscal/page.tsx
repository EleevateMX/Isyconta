import { requirePerfil, esStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const estadoColor: Record<string, string> = {
  PENDIENTE: "bg-slate-100 text-slate-600",
  EN_PROCESO: "bg-amber-100 text-amber-700",
  PRESENTADA: "bg-blue-100 text-blue-700",
  PAGADA: "bg-emerald-100 text-emerald-700",
  VENCIDA: "bg-red-100 text-red-700",
};

export default async function FiscalPage() {
  const perfil = await requirePerfil();
  const staff = esStaff(perfil);
  const supabase = await createClient();

  const { data: obligaciones } = await supabase
    .from("obligaciones_fiscales")
    .select("id, tipo, periodo, fecha_limite, estado, monto, notas")
    .order("fecha_limite", { ascending: true })
    .limit(100);

  const { data: documentos } = await supabase
    .from("documentos")
    .select("id, tipo, nombre, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-900">Seguimiento fiscal</h1>
        <p className="text-sm text-slate-500">
          Estado de tus obligaciones y documentos. (Por ahora solo seguimiento; la facturación
          llegará en una fase futura vía la API de Contadigital.)
        </p>
      </div>

      {/* Obligaciones */}
      <section className="card">
        <h2 className="font-display font-semibold text-brand-900">Obligaciones</h2>
        <div className="mt-3 overflow-x-auto">
          {obligaciones && obligaciones.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-slate-400">
                  <th className="pb-2">Tipo</th>
                  <th className="pb-2">Periodo</th>
                  <th className="pb-2">Vence</th>
                  <th className="pb-2">Monto</th>
                  <th className="pb-2">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {obligaciones.map((o) => (
                  <tr key={o.id}>
                    <td className="py-2 font-medium text-slate-800">{o.tipo}</td>
                    <td className="py-2 text-slate-600">{o.periodo}</td>
                    <td className="py-2 text-slate-600">{o.fecha_limite ?? "—"}</td>
                    <td className="py-2 text-slate-600">
                      {o.monto != null
                        ? Number(o.monto).toLocaleString("es-MX", {
                            style: "currency",
                            currency: "MXN",
                          })
                        : "—"}
                    </td>
                    <td className="py-2">
                      <span className={`badge ${estadoColor[o.estado as string] ?? estadoColor.PENDIENTE}`}>
                        {(o.estado as string).replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="py-6 text-center text-sm text-slate-400">
              {staff
                ? "Aún no hay obligaciones registradas. Captúralas desde el panel del despacho."
                : "Tu contador aún no ha registrado obligaciones."}
            </p>
          )}
        </div>
      </section>

      {/* Documentos */}
      <section className="card">
        <h2 className="font-display font-semibold text-brand-900">Documentos</h2>
        <ul className="mt-3 space-y-2">
          {documentos && documentos.length > 0 ? (
            documentos.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-slate-800">{d.nombre}</p>
                  <p className="text-xs text-slate-500">
                    {d.tipo} · {new Date(d.created_at as string).toLocaleDateString("es-MX")}
                  </p>
                </div>
                <span className="badge bg-brand-50 text-brand-700">{d.tipo as string}</span>
              </li>
            ))
          ) : (
            <p className="py-4 text-center text-sm text-slate-400">Sin documentos por ahora.</p>
          )}
        </ul>
      </section>
    </div>
  );
}
