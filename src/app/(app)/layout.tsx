import { requirePerfil, esStaff } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const perfil = await requirePerfil();
  return (
    <AppShell nombre={perfil.nombre || perfil.email} staff={esStaff(perfil)}>
      {children}
    </AppShell>
  );
}
