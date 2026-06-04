import { requirePerfil, esStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NuevaObligacion } from "@/components/NuevaObligacion";
import { EstadoObligacionSelect } from "@/components/EstadoObligacionSelect";

export const dynamic = "force-dynamic";

const estadoColor: Record<string, string> = {
  PENDIENTE: "bg-slate-100 text-slate-600",
  EN_PROCESO: "bg-amber-100 text-amber-700",
  PRESENTADA: "bg-blue-100 text-blue-700",
  PAGADA: "bg-emerald-100 text-emerald-700",
  VENCIDA: "bg-red-100 text-red-700",
};

type Obligacion = {
  id: string;
  tipo: string;
  periodo: string;
  fecha_limite: string | null;
  estado: string;
  monto: number | null;
  notas: string | null;
  empresas: { razon_social: string } | null;
};

export default async function FiscalPage() {
  const perfil = await requirePerfil();
  const staff = esStaff(perfil);
  const supabase = await createClient();

  const { data: obligacionesData } = await supabase
    .from("obligaciones_fiscales")
    .select("id, tipo, periodo, fecha_limite, estado, monto, notas, empresas(razon_social)")
    .order("fecha_limite", { ascending: true })
    .limit(200);
  const obligaciones = (obligacionesData ?? []) as unknown as Obligacion[];

  const { data: documentos } = await supabase
    .from("documentos")
    .select("id, tipo, nombre, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  let empresas: { id: string; razon_social: string }[] = [];
  if (staff) {
    const { data } = await supabase.from("empresas").select("id, razon_social").order("razon_social");
    empresas = (data ?? []) as typeof empresas;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-900">Seguimiento fiscal</h1>
        <p className="text-sm text-slate-500">
          Estado de las obligaciones y documentos. (Por ahora solo seguimiento; la facturación
          llegará en una fase futura vía la API de Contadigital.)
        </p>
      </div>

      <section className="card">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-brand-900">Obligaciones</h2>
          {staff && <NuevaObligacion empresas={empresas} />}
        </div>
        <div className="mt-3 overflow-x-auto">
          {obligaciones.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-slate-400">
                  {staff && <th className="pb-2 pr-3">Empresa</th>}
                  <th className="pb-2 pr-3">Tipo</th>
                  <th className="pb-2 pr-3">Periodo</th>
                  <th className="pb-2 pr-3">Vence</th>
                  <th className="pb-2 pr-3">Monto</th>
                  <th className="pb-2">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {obligaciones.map((o) => (
                  <tr key={o.id}>
                    {staff && (
                      <td className="py-2 pr-3 text-slate-600">{o.empresas?.razon_social ?? "—"}</td>
                    )}
                    <td className="py-2 pr-3 font-medium text-slate-800">{o.tipo}</td>
                    <td className="py-2 pr-3 text-slate-600">{o.periodo}</td>
                    <td className="py-2 pr-3 text-slate-600">{o.fecha_limite ?? "—"}</td>
                    <td className="py-2 pr-3 text-slate-600">
                      {o.monto != null
                        ? Number(o.monto).toLocaleString("es-MX", {
                            style: "currency",
                            currency: "MXN",
                          })
                        : "—"}
                    </td>
                    <td className="py-2">
                      {staff ? (
                        <EstadoObligacionSelect id={o.id} estado={o.estado} />
                      ) : (
                        <span className={`badge ${estadoColor[o.estado] ?? estadoColor.PENDIENTE}`}>
                          {o.estado.replace("_", " ")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="py-6 text-center text-sm text-slate-400">
              {staff
                ? "Aún no hay obligaciones. Crea la primera con el botón de arriba."
                : "Tu contador aún no ha registrado obligaciones."}
            </p>
          )}
        </div>
      </section>

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
