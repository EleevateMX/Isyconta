# Isyconta — Portal de clientes (PWA)

Portal y app instalable (PWA) del despacho contable **Isyconta** (Mérida, Yucatán).
Login propio aprobado por la contadora, avisos con push, seguimiento fiscal y mensajería interna (sin WhatsApp).

> Isyconta opera su contabilidad sobre **Contadigital**. Esta app **no factura** todavía: da seguimiento. La facturación futura se integraría con la API de Contadigital.

## Stack

Next.js 15 (App Router) · Supabase (Auth/Postgres/Storage) · Tailwind · PWA + Web Push · Vercel.

## Arranque

```bash
pnpm install
cp .env.example .env.local   # llena las variables de Supabase
pnpm dev
```

1. Crea un proyecto **nuevo** en Supabase.
2. Pega `supabase/migrations/0001_init.sql` en SQL Editor → Run.
3. Llena `.env.local` con las llaves del proyecto.
4. Regístrate en `/registro`, luego en Supabase marca tu perfil como staff:
   ```sql
   update perfiles set rol='ADMIN', estado='APROBADO' where email='tu@correo.mx';
   ```

## Estructura

Ver [`CLAUDE.md`](./CLAUDE.md) para el contexto completo del proyecto, módulos y roadmap.
