import Link from "next/link";
import { logoutAction } from "@/app/login/actions";
import { IconClock } from "@/components/icons";

export default async function PendientePage({
  searchParams,
}: {
  searchParams: Promise<{ nuevo?: string }>;
}) {
  const { nuevo } = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-b from-brand-50 to-white px-5 text-center">
      <div className="card max-w-md">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent-500/10 text-accent-600">
          <IconClock className="h-7 w-7" />
        </div>
        <h1 className="mt-4 font-display text-xl font-semibold text-brand-900">
          {nuevo ? "¡Solicitud enviada!" : "Cuenta pendiente de autorización"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Tu cuenta está esperando la autorización de tu contadora. Te avisaremos en cuanto quede
          activada y podrás entrar a tu portal.
        </p>
        <form action={logoutAction} className="mt-6">
          <button className="btn-ghost w-full">Cerrar sesión</button>
        </form>
        <Link href="/" className="mt-3 block text-sm text-slate-500">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
