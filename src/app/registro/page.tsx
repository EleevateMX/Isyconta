import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function RegistroPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-b from-brand-50 to-white px-5">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 font-display text-lg font-bold text-white">
            I
          </div>
          <span className="font-display text-2xl font-bold text-brand-900">Isyconta</span>
        </Link>
        <div className="card">
          <h1 className="font-display text-xl font-semibold text-brand-900">Solicitar acceso</h1>
          <p className="mt-1 text-sm text-slate-500">
            Crea tu cuenta. Tu contadora la autorizará antes de que puedas entrar.
          </p>
          <AuthForm mode="registro" />
        </div>
        <p className="mt-5 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-brand-700">
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
