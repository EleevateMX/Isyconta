"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { crearAviso, type AvisoState } from "@/app/(app)/avisos/actions";

const initial: AvisoState = {};

export function NuevoAviso() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(crearAviso, initial);
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
        + Nuevo aviso
      </button>
    );
  }

  return (
    <form ref={formRef} action={action} className="card space-y-3">
      <h2 className="font-display font-semibold text-brand-900">Nuevo aviso</h2>
      <div>
        <label className="label" htmlFor="titulo">
          Título
        </label>
        <input id="titulo" name="titulo" className="input" required />
      </div>
      <div>
        <label className="label" htmlFor="cuerpo">
          Mensaje
        </label>
        <textarea id="cuerpo" name="cuerpo" className="input min-h-[100px]" required />
      </div>
      <div>
        <label className="label" htmlFor="prioridad">
          Prioridad
        </label>
        <select id="prioridad" name="prioridad" className="input">
          <option value="NORMAL">Normal</option>
          <option value="IMPORTANTE">Importante</option>
          <option value="URGENTE">Urgente</option>
        </select>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Publicando…" : "Publicar"}
        </button>
        <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
