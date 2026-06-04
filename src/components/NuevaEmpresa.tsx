"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { crearEmpresa } from "@/app/(app)/admin/actions";

const initial: { ok?: boolean; error?: string } = {};

export function NuevaEmpresa() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(crearEmpresa, initial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setOpen(false);
    }
  }, [state.ok]);

  if (!open) {
    return (
      <button className="btn-ghost" onClick={() => setOpen(true)}>
        + Nueva empresa
      </button>
    );
  }

  return (
    <form ref={formRef} action={action} className="space-y-3 rounded-xl bg-slate-50 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="razon_social">
            Razón social *
          </label>
          <input id="razon_social" name="razon_social" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="rfc">
            RFC
          </label>
          <input id="rfc" name="rfc" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="regimen">
            Régimen
          </label>
          <input id="regimen" name="regimen" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="email">
            Correo
          </label>
          <input id="email" name="email" type="email" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="telefono">
            Teléfono
          </label>
          <input id="telefono" name="telefono" className="input" />
        </div>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Guardando…" : "Crear empresa"}
        </button>
        <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
