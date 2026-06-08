import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { Logo } from "@/components/Logo";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-b from-brand-50 to-white px-5">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 flex justify-center">
          <Logo symbolClassName="h-10 w-10" wordClassName="text-2xl text-brand-900" />
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
