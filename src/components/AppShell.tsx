"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/login/actions";

const NAV = [
  { href: "/dashboard", label: "Inicio", icon: "🏠" },
  { href: "/avisos", label: "Avisos", icon: "🔔" },
  { href: "/fiscal", label: "Fiscal", icon: "📊" },
  { href: "/mensajes", label: "Mensajes", icon: "💬" },
] as const;

export function AppShell({
  children,
  nombre,
  staff,
}: {
  children: React.ReactNode;
  nombre: string;
  staff: boolean;
}) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 font-display text-sm font-bold text-white">
              I
            </div>
            <span className="font-display text-lg font-bold text-brand-900">Isyconta</span>
            {staff && (
              <span className="badge bg-accent-500/10 text-accent-600">Despacho</span>
            )}
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">{nombre}</span>
            <form action={logoutAction}>
              <button className="text-sm font-medium text-slate-500 hover:text-brand-700">
                Salir
              </button>
            </form>
          </div>
        </div>
        {/* Nav desktop */}
        <nav className="mx-auto hidden max-w-5xl gap-1 px-4 pb-2 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                pathname.startsWith(n.href)
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>

      {/* Bottom nav móvil */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {NAV.map((n) => {
            const active = pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-xs ${
                  active ? "text-brand-700" : "text-slate-400"
                }`}
              >
                <span className="text-lg">{n.icon}</span>
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
