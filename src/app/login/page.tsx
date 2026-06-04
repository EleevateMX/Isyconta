import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
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
          <h1 className="font-display text-xl font-semibold text-brand-900">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-slate-500">Acceso autorizado por tu contadora.</p>
          <AuthForm mode="login" next={next ?? "/dashboard"} />
        </div>
        <p className="mt-5 text-center text-sm text-slate-500">
          ¿Aún no tienes acceso?{" "}
          <Link href="/registro" className="font-semibold text-brand-700">
            Solicítalo aquí
          </Link>
        </p>
      </div>
    </main>
  );
}
