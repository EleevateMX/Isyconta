"use client";

import { useActionState } from "react";
import { loginAction, registroAction, type FormState } from "@/app/login/actions";

const initial: FormState = {};

export function AuthForm({ mode, next }: { mode: "login" | "registro"; next?: string }) {
  const action = mode === "login" ? loginAction : registroAction;
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="mt-5 space-y-4">
      {mode === "registro" && (
        <div>
          <label className="label" htmlFor="nombre">
            Nombre completo
          </label>
          <input id="nombre" name="nombre" className="input" autoComplete="name" required />
        </div>
      )}
      <div>
        <label className="label" htmlFor="email">
          Correo
        </label>
        <input id="email" name="email" type="email" className="input" autoComplete="email" required />
      </div>
      <div>
        <label className="label" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="input"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
        />
      </div>
      {next && <input type="hidden" name="next" value={next} />}

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Procesando…" : mode === "login" ? "Entrar" : "Solicitar acceso"}
      </button>
    </form>
  );
}
