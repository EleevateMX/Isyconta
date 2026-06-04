"use client";

import { useRef } from "react";
import { actualizarEstadoObligacion } from "@/app/(app)/fiscal/actions";

const OPCIONES = [
  ["PENDIENTE", "Pendiente"],
  ["EN_PROCESO", "En proceso"],
  ["PRESENTADA", "Presentada"],
  ["PAGADA", "Pagada"],
  ["VENCIDA", "Vencida"],
] as const;

/** Select inline para que el staff cambie el estado de una obligación. */
export function EstadoObligacionSelect({ id, estado }: { id: string; estado: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} action={actualizarEstadoObligacion}>
      <input type="hidden" name="id" value={id} />
      <select
        name="estado"
        defaultValue={estado}
        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
        onChange={() => formRef.current?.requestSubmit()}
      >
        {OPCIONES.map(([v, label]) => (
          <option key={v} value={v}>
            {label}
          </option>
        ))}
      </select>
    </form>
  );
}
