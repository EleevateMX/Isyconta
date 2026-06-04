"use client";

import { useActionState, useEffect, useRef } from "react";
import { enviarMensaje, type EnviarState } from "@/app/(app)/mensajes/actions";

type Mensaje = { id: string; cuerpo: string; autor_id: string | null; created_at: string };

const initial: EnviarState = {};

export function Chat({
  conversacionId,
  empresaId,
  miId,
  inicial,
}: {
  conversacionId: string | null;
  empresaId: string | null;
  miId: string;
  inicial: Mensaje[];
}) {
  const [state, action, pending] = useActionState(enviarMensaje, initial);
  const formRef = useRef<HTMLFormElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [inicial.length]);

  return (
    <div className="card flex h-[60vh] flex-col p-0">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {inicial.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            {empresaId
              ? "Aún no hay mensajes. Escribe el primero 👇"
              : "Tu cuenta aún no tiene empresa asignada. Tu contador la activará pronto."}
          </p>
        ) : (
          inicial.map((m) => {
            const mio = m.autor_id === miId;
            return (
              <div key={m.id} className={`flex ${mio ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                    mio ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.cuerpo}</p>
                  <p className={`mt-1 text-[10px] ${mio ? "text-brand-100" : "text-slate-400"}`}>
                    {new Date(m.created_at).toLocaleString("es-MX", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        ref={formRef}
        action={action}
        className="flex items-center gap-2 border-t border-slate-100 p-3"
      >
        <input type="hidden" name="conversacionId" value={conversacionId ?? ""} />
        <input
          name="cuerpo"
          className="input"
          placeholder="Escribe tu mensaje…"
          autoComplete="off"
          required
        />
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "…" : "Enviar"}
        </button>
      </form>
      {state.error && <p className="px-4 pb-3 text-sm text-red-600">{state.error}</p>}
    </div>
  );
}
