import Link from "next/link";
import { Logo } from "@/components/Logo";
import {
  IconFile,
  IconUsers,
  IconChart,
  IconShield,
  IconScale,
  IconTrending,
  IconCheck,
} from "@/components/icons";

const servicios = [
  {
    titulo: "Facturación CFDI 4.0",
    desc: "Timbrado de facturas, complementos y Carta Porte. Tus comprobantes siempre disponibles y respaldados.",
    Icon: IconFile,
  },
  {
    titulo: "Nómina electrónica",
    desc: "Cálculo y timbrado de recibos, control laboral y cumplimiento ante el IMSS.",
    Icon: IconUsers,
  },
  {
    titulo: "Contabilidad automatizada",
    desc: "Pólizas generadas desde tus CFDI y descarga automática de tus XML del SAT.",
    Icon: IconChart,
  },
  {
    titulo: "Control fiscal",
    desc: "Seguimiento de impuestos, declaraciones y fechas límite. Sin sorpresas con el SAT.",
    Icon: IconShield,
  },
  {
    titulo: "Asesoría legal y laboral",
    desc: "Acompañamiento en temas legales, laborales y de auditoría para tu empresa.",
    Icon: IconScale,
  },
  {
    titulo: "Reportes a tu medida",
    desc: "Información financiera clara y exportable cuando la necesites, desde cualquier dispositivo.",
    Icon: IconTrending,
  },
];

export default function Landing() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-brand-50/40">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo symbolClassName="h-9 w-9" wordClassName="text-xl text-brand-900" withTagline />
        <nav className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost">
            Iniciar sesión
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-10 text-center md:pt-16">
        <span className="badge bg-accent-500/10 text-accent-600">
          Despacho 100% digital · Mérida, Yucatán
        </span>
        <h1 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-brand-950 md:text-6xl">
          Tu contabilidad, clara y en tu bolsillo.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          Más de 20 años llevando la contabilidad, el CFDI y el control fiscal de empresas y
          emprendedores. Ahora con un portal y una app para que tengas todo a la mano: tus avisos,
          tus documentos y el seguimiento de tus obligaciones, sin depender de WhatsApp.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/login" className="btn-primary px-6 py-3 text-base">
            Entrar a mi portal
          </Link>
          <Link href="/registro" className="btn-ghost px-6 py-3 text-base">
            Solicitar acceso
          </Link>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Instálala como app desde tu navegador: <strong>Compartir → Agregar a inicio</strong>.
        </p>
      </section>

      {/* Servicios */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="text-center font-display text-3xl font-bold text-brand-900">
          Todo tu cumplimiento en un solo lugar
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {servicios.map((s) => (
            <div key={s.titulo} className="card transition hover:shadow-md">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <s.Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold text-brand-900">{s.titulo}</h3>
              <p className="mt-1.5 text-sm text-slate-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* App / valor */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="rounded-3xl bg-brand-900 p-8 text-white md:p-12">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-bold">La app de Isyconta</h2>
              <ul className="mt-5 space-y-3 text-brand-100">
                {[
                  <>Recibe <strong>avisos y recordatorios</strong> directo en tu teléfono.</>,
                  <>Consulta el <strong>estado de tus declaraciones</strong> y fechas límite.</>,
                  <>Descarga tus <strong>CFDI, constancias y reportes</strong> cuando quieras.</>,
                  <><strong>Chatea con tu contador</strong> dentro de la app, sin WhatsApp.</>,
                  <>Acceso seguro <strong>autorizado por tu contadora</strong>.</>,
                ].map((item, i) => (
                  <li key={i} className="flex gap-2.5">
                    <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/login" className="btn mt-7 bg-accent-500 text-white hover:bg-accent-600">
                Comenzar
              </Link>
            </div>
            <div className="rounded-2xl bg-brand-800/60 p-6 ring-1 ring-white/10">
              <div className="mx-auto flex max-w-[220px] flex-col gap-3">
                <div className="rounded-xl bg-white/95 p-4 text-slate-800 shadow-lg">
                  <p className="text-xs font-semibold text-brand-600">AVISO · IVA mayo</p>
                  <p className="mt-1 text-sm">Tu declaración está lista para revisión.</p>
                </div>
                <div className="self-end rounded-xl bg-accent-500 p-4 text-white shadow-lg">
                  <p className="text-xs opacity-80">Tú</p>
                  <p className="mt-1 text-sm">Perfecto, ¿la autorizo?</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="card">
            <h3 className="font-display font-semibold text-brand-900">Teléfono</h3>
            <p className="mt-1 text-sm text-slate-600">+52 990 269 0980</p>
          </div>
          <div className="card">
            <h3 className="font-display font-semibold text-brand-900">Correo</h3>
            <p className="mt-1 text-sm text-slate-600">contacto@isyconta.mx</p>
          </div>
          <div className="card">
            <h3 className="font-display font-semibold text-brand-900">Oficina</h3>
            <p className="mt-1 text-sm text-slate-600">
              Calle 46 #513, Col. Nuevo Yucatán, Mérida, Yuc. CP 97147
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Isyconta · Contabilidad Digital, CFDI y Control Fiscal.
      </footer>
    </main>
  );
}
