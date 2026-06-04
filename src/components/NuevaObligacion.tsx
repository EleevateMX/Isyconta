"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { crearObligacion } from "@/app/(app)/fiscal/actions";

type Empresa = { id: string; razon_social: string };
const initial: { ok?: boolean; error?: string } = {};

export function NuevaObligacion({ empresas }: { empresas: Empresa[] }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(crearObligacion, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setOpen(false);
    }
  }, [state.ok]);

  if (!open) {
    return (
      <button className="btn-primary" onClick={() => setOpen(true)}>
        + Nueva obligación
      </button>
    );
  }

  return (
    <form ref={formRef} action={action} className="space-y-3 rounded-xl bg-slate-50 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="empresa_id">
            Empresa *
          </label>
          <select id="empresa_id" name="empresa_id" className="input" required defaultValue="">
            <option value="" disabled>
              Selecciona…
            </option>
            {empresas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.razon_social}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="tipo">
            Tipo *
          </label>
          <input id="tipo" name="tipo" className="input" placeholder="IVA, ISR, DIOT…" required />
        </div>
        <div>
          <label className="label" htmlFor="periodo">
            Periodo *
          </label>
          <input id="periodo" name="periodo" className="input" placeholder="2026-05" required />
        </div>
        <div>
          <label className="label" htmlFor="fecha_limite">
            Fecha límite
          </label>
          <input id="fecha_limite" name="fecha_limite" type="date" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="monto">
            Monto (MXN)
          </label>
          <input id="monto" name="monto" type="number" step="0.01" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="estado">
            Estado
          </label>
          <select id="estado" name="estado" className="input" defaultValue="PENDIENTE">
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_PROCESO">En proceso</option>
            <option value="PRESENTADA">Presentada</option>
            <option value="PAGADA">Pagada</option>
            <option value="VENCIDA">Vencida</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="notas">
            Notas
          </label>
          <input id="notas" name="notas" className="input" />
        </div>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Guardando…" : "Crear obligación"}
        </button>
        <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
