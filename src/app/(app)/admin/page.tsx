import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { aprobarCuenta, cambiarEstado, asignarEmpresa } from "@/app/(app)/admin/actions";
import { NuevaEmpresa } from "@/components/NuevaEmpresa";

export const dynamic = "force-dynamic";

type Perfil = {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  estado: string;
  empresa_id: string | null;
};
type Empresa = { id: string; razon_social: string; rfc: string | null };

const estadoColor: Record<string, string> = {
  PENDIENTE: "bg-amber-100 text-amber-700",
  APROBADO: "bg-emerald-100 text-emerald-700",
  SUSPENDIDO: "bg-red-100 text-red-700",
};

export default async function AdminPage() {
  await requireStaff();
  const supabase = await createClient();

  const { data: perfilesData } = await supabase
    .from("perfiles")
    .select("id, email, nombre, rol, estado, empresa_id")
    .order("created_at", { ascending: false });
  const { data: empresasData } = await supabase
    .from("empresas")
    .select("id, razon_social, rfc")
    .order("razon_social");

  const perfiles = (perfilesData ?? []) as Perfil[];
  const empresas = (empresasData ?? []) as Empresa[];
  const pendientes = perfiles.filter((p) => p.estado === "PENDIENTE");
  const resto = perfiles.filter((p) => p.estado !== "PENDIENTE");
  const empresaNombre = (id: string | null) =>
    id ? empresas.find((e) => e.id === id)?.razon_social ?? "—" : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-900">Administración</h1>
        <p className="text-sm text-slate-500">Aprueba clientes, asigna empresas y gestiona cuentas.</p>
      </div>

      {/* Pendientes de aprobación */}
      <section className="card">
        <h2 className="font-display font-semibold text-brand-900">
          Pendientes de aprobación{" "}
          {pendientes.length > 0 && (
            <span className="badge bg-amber-100 text-amber-700">{pendientes.length}</span>
          )}
        </h2>
        <div className="mt-3 space-y-3">
          {pendientes.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">No hay cuentas pendientes.</p>
          ) : (
            pendientes.map((p) => (
              <form
                key={p.id}
                action={aprobarCuenta}
                className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-3"
              >
                <input type="hidden" name="perfilId" value={p.id} />
                <div className="min-w-[160px] flex-1">
                  <p className="text-sm font-medium text-slate-800">{p.nombre || "(sin nombre)"}</p>
                  <p className="text-xs text-slate-500">{p.email}</p>
                </div>
                <select name="empresaId" className="input max-w-[200px]" defaultValue="">
                  <option value="">Sin empresa…</option>
                  {empresas.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.razon_social}
                    </option>
                  ))}
                </select>
                <button className="btn-primary" type="submit">
                  Aprobar
                </button>
              </form>
            ))
          )}
        </div>
      </section>

      {/* Empresas */}
      <section className="card">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-brand-900">Empresas</h2>
          <span className="text-sm text-slate-400">{empresas.length} registradas</span>
        </div>
        <div className="mt-3">
          <NuevaEmpresa />
        </div>
        <ul className="mt-3 divide-y divide-slate-100">
          {empresas.map((e) => (
            <li key={e.id} className="flex items-center justify-between py-2 text-sm">
              <span className="font-medium text-slate-800">{e.razon_social}</span>
              <span className="text-slate-500">{e.rfc ?? "—"}</span>
            </li>
          ))}
          {empresas.length === 0 && (
            <li className="py-4 text-center text-sm text-slate-400">Aún no hay empresas.</li>
          )}
        </ul>
      </section>

      {/* Todas las cuentas */}
      <section className="card">
        <h2 className="font-display font-semibold text-brand-900">Cuentas</h2>
        <div className="mt-3 space-y-3">
          {resto.map((p) => (
            <div key={p.id} className="rounded-xl bg-slate-50 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {p.nombre || "(sin nombre)"}{" "}
                    <span className="badge ml-1 bg-brand-50 text-brand-700">{p.rol}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {p.email} · Empresa: {empresaNombre(p.empresa_id)}
                  </p>
                </div>
                <span className={`badge ${estadoColor[p.estado] ?? ""}`}>{p.estado}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <form action={asignarEmpresa} className="flex items-center gap-1">
                  <input type="hidden" name="perfilId" value={p.id} />
                  <select name="empresaId" className="input py-1.5" defaultValue={p.empresa_id ?? ""}>
                    <option value="">Sin empresa</option>
                    {empresas.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.razon_social}
                      </option>
                    ))}
                  </select>
                  <button className="btn-ghost py-1.5" type="submit">
                    Guardar empresa
                  </button>
                </form>
                <form action={cambiarEstado} className="flex items-center gap-1">
                  <input type="hidden" name="perfilId" value={p.id} />
                  <select name="estado" className="input py-1.5" defaultValue={p.estado}>
                    <option value="APROBADO">Aprobado</option>
                    <option value="SUSPENDIDO">Suspendido</option>
                    <option value="PENDIENTE">Pendiente</option>
                  </select>
                  <button className="btn-ghost py-1.5" type="submit">
                    Cambiar estado
                  </button>
                </form>
              </div>
            </div>
          ))}
          {resto.length === 0 && (
            <p className="py-4 text-center text-sm text-slate-400">Sin cuentas activas todavía.</p>
          )}
        </div>
      </section>
    </div>
  );
}
