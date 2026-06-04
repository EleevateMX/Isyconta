# Isyconta — Snapshot de contexto para Claude

> **Léelo completo antes de hacer cambios.** Este archivo es para que cualquier sesión futura tome el hilo sin re-descubrir el proyecto. Última actualización: 2026-06-04.

---

## TL;DR

**Isyconta** es un despacho contable **100% digital** en **Mérida, Yucatán** (+20 años). Este repo es su **portal de clientes + app PWA**: login propio aprobado por la contadora, avisos/push, seguimiento fiscal y mensajería interna (para sacar la operación de WhatsApp).

**Importante:** Isyconta **ya opera su contabilidad sobre Contadigital** (`app.contadigital.mx`). Este proyecto **NO factura** — solo da *seguimiento*. La facturación real (timbrado CFDI) llegaría en una fase futura vía la **API REST de Contadigital** (Isyconta ya es cliente; pedir credenciales). Plan B si su API no alcanza: PAC directo (Facturapi / Facturama).

**Stack**: Next.js 15 App Router + Supabase (Auth/Postgres/Storage) + Vercel + PWA instalable con Web Push. Mismo patrón que el proyecto hermano **Vortex** (MHS Integradora).

---

## Datos reales del despacho (scraping isyconta.mx, jun 2026)

- **Nombre:** Isyconta — "Contabilidad Digital, CFDI y Control Fiscal en Mérida"
- **Dirección:** Calle 46 #513 x 33 y 33a, Col. Nuevo Yucatán, Mérida, Yuc. CP 97147
- **Tel:** +52 990 269 0980 · alterno +52 999 173 9646
- **Email:** contacto@isyconta.mx · alterno isyconta.merida@gmail.com
- **Facebook:** facebook.com/isyconta
- **Servicios:** CFDI 4.0, nómina electrónica, contabilidad automatizada, control fiscal/impuestos, Carta Porte, legal/laboral/auditoría, CRM/ERP. Timbres desde $1 MXN.
- El sitio público bloquea fetch automatizado (403). Para HTML literal, pedir el código fuente.

---

## Repo y comandos

```
github: eleevatemx/isyconta
branch de desarrollo: claude/upbeat-brahmagupta-EZ1Dc
```

```bash
pnpm install          # instalar deps
pnpm dev              # desarrollo local
pnpm typecheck        # tsc --noEmit (exactOptionalPropertyTypes: true)
pnpm build            # build de producción
```

App single-package (no monorepo). Si más adelante quieren app nativa, se agrega `apps/mobile` (Expo) como en Vortex.

---

## Variables de entorno (`.env.local`, ver `.env.example`)

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...      # npx web-push generate-vapid-keys
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=https://isyconta.mx
CRON_SECRET=...
CONTADIGITAL_API_BASE=               # FUTURO (facturación)
CONTADIGITAL_API_TOKEN=              # FUTURO
```

> Proyecto Supabase **nuevo y separado** de Vortex (datos de clientes contables aislados).

---

## Roles y aprobación

`perfiles.rol` (enum `rol_usuario`):
- `CLIENTE` — cliente del despacho. Ve solo lo de **su empresa** (RLS por `empresa_id`).
- `CONTADOR` — staff del despacho. Ve y gestiona todo.
- `ADMIN` — full access.

`perfiles.estado` (enum `estado_cuenta`): `PENDIENTE` → `APROBADO` → `SUSPENDIDO`.

**Flujo de acceso propio (sin Google):**
1. El cliente se registra en `/registro` (Supabase Auth email+password).
2. Un trigger crea su `perfil` en estado `PENDIENTE` (rol `CLIENTE`).
3. La contadora lo **aprueba** y le asigna su `empresa_id` (módulo admin — pendiente de UI).
4. `requirePerfil()` redirige a `/pendiente` mientras no esté `APROBADO`.

Helpers: `src/lib/auth.ts` → `getPerfil()`, `requirePerfil()`, `requireStaff()`, `esStaff()`.
SQL: `es_staff()`, `mi_empresa_id()`, `cuenta_aprobada()` (todas SECURITY DEFINER).

---

## Estructura

```
src/
  middleware.ts                      # refresca sesión + protege rutas privadas
  lib/
    auth.ts                          # perfiles, roles, gates
    supabase/{server,client,middleware}.ts
  components/
    AppShell.tsx                     # shell autenticado (topbar + bottom nav móvil)
    AuthForm.tsx, Chat.tsx, NuevoAviso.tsx, ServiceWorkerRegister.tsx
  app/
    page.tsx                         # landing pública (web mejorada)
    login/ , registro/ , pendiente/  # auth propio
    (app)/                           # rutas protegidas (layout con requirePerfil)
      dashboard/  avisos/  fiscal/  mensajes/
    api/ping/                        # detector de red (edge)
public/
  manifest.webmanifest, sw.js, icons/icon.svg
supabase/migrations/0001_init.sql    # schema + RLS + trigger perfil
```

---

## Módulos del v1

1. **Login + avisos + portal** — auth propio aprobado; `/dashboard` con resumen.
2. **Avisos** (`/avisos`) — staff publica avisos (broadcast / empresa / usuario); cliente los lee. Push pendiente de cablear.
3. **Seguimiento fiscal** (`/fiscal`) — tabla de `obligaciones_fiscales` (IVA/ISR/DIOT/…) con estado y fecha límite + lista de `documentos`. **No factura**, solo seguimiento.
4. **Mensajería** (`/mensajes`) — chat cliente↔contador por empresa (reemplaza WhatsApp).
5. **Web pública** (`/`) — landing rediseñada con servicios reales + CTA instalar/entrar.

---

## Base de datos (migración v1)

Tablas: `empresas`, `perfiles`, `avisos`, `avisos_lecturas`, `obligaciones_fiscales`, `documentos`, `conversaciones`, `mensajes`, `push_subscriptions`. **RLS habilitado en todas.**

Aplicar: Supabase Studio → SQL → pegar `supabase/migrations/0001_init.sql` → Run. Termina con `notify pgrst, 'reload schema'`.

---

## Próximos pasos / TODO

### Inmediato (para que sea usable end-to-end)
- **UI admin de aprobación**: pantalla `/admin` para que la contadora apruebe cuentas y asigne `empresa_id`. Hoy el registro funciona pero la aprobación se hace a mano en Supabase.
- **Crear el primer usuario staff**: `update perfiles set rol='ADMIN', estado='APROBADO' where email='...';` en Supabase.
- **Web Push real**: `lib/push.ts` (web-push), suscripción desde el cliente, cablear en `crearAviso` y `enviarMensaje`. VAPID keys en env.
- **Iconos PNG** (192/512 maskable) — hoy hay un SVG; iOS prefiere PNG.

### Fase siguiente
- **Seguimiento fiscal enriquecido**: captura de obligaciones por el staff, recordatorios automáticos (pg_cron) antes de fechas límite SAT.
- **Documentos**: subida a Storage (buckets `documentos`) + descarga firmada.
- **Integración Contadigital (lectura)**: traer CFDI / constancias / opinión de cumplimiento vía su API REST para mostrarlos al cliente.

### Fase facturación (cuando se decida facturar)
- Integrar **API de Contadigital** para timbrar desde la app (pedir token a Contadigital). Alternativa: Facturapi / Facturama.

---

## Convenciones

- Mensajes a usuarios finales en **español**; código/commits mezcla es+en.
- Server actions devuelven `{ ok: true } | { ok: false, error }` (o `{ error }` en forms).
- `exactOptionalPropertyTypes: true` → declarar `campo?: T | undefined`.
- Paleta `brand` (azul) + `accent` (turquesa) en Tailwind. Fuentes Syne (display) + DM Sans.
- Bumpear `CACHE_VERSION` en `public/sw.js` al cambiar el handler push/cache.
- RLS: funciones que leen tablas restringidas deben ser `SECURITY DEFINER`.

---

## Cómo retomar desde una sesión nueva

1. Lee este archivo entero.
2. `git log --oneline -15` y revisa `supabase/migrations/`.
3. Si el usuario pide algo, **busca en módulos existentes** antes de crear nuevos.
4. Si tocas SQL, añade `notify pgrst, 'reload schema';` al final y hazlo idempotente.
5. Para facturación → **siempre** es vía Contadigital primero (Isyconta ya es su cliente).
