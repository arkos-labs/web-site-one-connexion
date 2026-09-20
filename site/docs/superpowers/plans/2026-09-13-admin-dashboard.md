# Dashboard Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an `/admin` space where an admin can dispatch courses (one-off
orders and recurring navette occurrences), manage drivers, see clients, and
track revenue.

**Architecture:** Next.js App Router pages under `app/admin/*`, protected by
`role = admin` on `profiles` (checked in `middleware.ts`). Data lives in the
existing Supabase project (`oggxhosuvbmdmpiziezp`): a new `drivers` table, a
`role` column on `profiles`, and `driver_id` FKs on `orders`/`navettes`. RLS
policies use a `is_admin()` SQL function to avoid recursive-policy issues.
Client components use the existing `lib/supabase/client.ts` browser client,
following the pattern already used in `app/dashboard/*`.

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind, `@supabase/ssr`,
Supabase Postgres (project `oggxhosuvbmdmpiziezp`).

**Spec:** [docs/superpowers/specs/2026-09-13-admin-dashboard-design.md](../specs/2026-09-13-admin-dashboard-design.md)

## Global Constraints
- No test framework exists in this repo (`package.json` has no test script,
  no `*.test.*`/`*.spec.*` files anywhere). Follow the existing convention:
  verify each task with `npm run lint`, `npm run build`, and manual
  browser checks instead of automated tests.
- Apply all schema changes via the Supabase MCP `apply_migration` tool
  against project id `oggxhosuvbmdmpiziezp` (not local `.sql` files only —
  this project's existing tables were created the same way, no local
  migration history is authoritative).
- `orders.status` is constrained to `en_attente | confirmee | en_cours |
  livree | annulee` — reuse these exact values, do not invent new ones.
- Follow existing code style: French UI copy, Tailwind utility classes
  matching `app/dashboard/*` (colors: `bg-[#FBFBFB]`, `border-line`,
  `text-ink`, `text-muted`, `text-accent`, rounded-2xl cards).
- The dev bypass button must be inert unless
  `NEXT_PUBLIC_DEV_ADMIN_BYPASS=true` — never ship it enabled by default.

---

## File Structure

- `supabase` (via MCP `apply_migration`, project `oggxhosuvbmdmpiziezp`):
  one migration adding `profiles.role`, `is_admin()`, `drivers` table,
  `orders.driver_id`, `navettes.driver_id`, and admin RLS policies.
- `middleware.ts` — modify: redirect non-admins away from `/admin/*`.
- `lib/admin-nav.ts` — create: nav items for the admin sidebar (mirrors
  `lib/dashboard-nav.ts`).
- `app/admin/layout.tsx` — create: admin shell (sidebar + logout), guards
  role client-side as a second layer.
- `app/admin/page.tsx` — create: overview (CA, courses en cours, chauffeurs
  dispo, alertes non-dispatché).
- `app/admin/courses/page.tsx` — create: unified dispatch view (orders +
  navette occurrences).
- `app/admin/navettes/page.tsx` — create: CRUD of navette templates
  (no dispatch).
- `app/admin/chauffeurs/page.tsx` — create: drivers CRUD.
- `app/admin/clients/page.tsx` — create: clients list with aggregates.
- `app/admin/chiffre-affaires/page.tsx` — create: revenue aggregation.
- `components/sections/AuthForm.tsx` — modify: add the dev bypass button.

---

### Task 1: Database migration (roles, drivers, dispatch columns, RLS)

**Files:**
- Supabase migration via MCP `apply_migration` (project
  `oggxhosuvbmdmpiziezp`, name `admin_dashboard_setup`).
- Create (local copy for history): `supabase/migrations/20260913_admin_dashboard_setup.sql`

**Interfaces:**
- Produces: `profiles.role` (`'client' | 'admin'`), `is_admin()` SQL
  function (`boolean`, no args, checks `auth.uid()`'s profile role),
  table `drivers(id uuid pk, name text, phone text, vehicle text,
  status text check in ('disponible','en_course','hors_service') default
  'disponible', notes text, created_at timestamptz default now())`,
  `orders.driver_id uuid null references drivers(id)`,
  `navettes.driver_id uuid null references drivers(id)`.

- [ ] **Step 1: Write the migration SQL**

```sql
-- 20260913_admin_dashboard_setup.sql

-- Roles
alter table public.profiles
  add column if not exists role text not null default 'client';

alter table public.profiles
  add constraint profiles_role_check check (role in ('client', 'admin'));

-- Helper used by RLS policies below (security definer avoids recursive
-- RLS evaluation on profiles when profiles' own policies check role).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Drivers
create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  vehicle text,
  status text not null default 'disponible'
    check (status in ('disponible', 'en_course', 'hors_service')),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.drivers enable row level security;

create policy "Admins manage drivers" on public.drivers
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- Dispatch columns
alter table public.orders
  add column if not exists driver_id uuid references public.drivers(id);

alter table public.navettes
  add column if not exists driver_id uuid references public.drivers(id);

-- Admin RLS: admins can see/manage every row, in addition to existing
-- owner-scoped policies.
create policy "Admins manage all orders" on public.orders
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins manage all navettes" on public.navettes
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins view all profiles" on public.profiles
  for select
  using (public.is_admin());

create policy "Admins update all profiles" on public.profiles
  for update
  using (public.is_admin())
  with check (public.is_admin());
```

- [ ] **Step 2: Apply the migration**

Use the Supabase MCP tool:
`apply_migration(project_id="oggxhosuvbmdmpiziezp", name="admin_dashboard_setup", query=<SQL above>)`

- [ ] **Step 3: Save a local copy for history**

Write the same SQL to `supabase/migrations/20260913_admin_dashboard_setup.sql`.

- [ ] **Step 4: Verify with a read-only query**

Run via MCP `execute_sql` on project `oggxhosuvbmdmpiziezp`:

```sql
select column_name from information_schema.columns
where table_name = 'profiles' and column_name = 'role';

select table_name from information_schema.tables
where table_name = 'drivers';
```

Expected: both queries return one row each.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260913_admin_dashboard_setup.sql
git commit -m "feat(db): add admin role, drivers table, dispatch columns and RLS

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Promote a dev admin account and seed the dev bypass credentials

**Files:**
- None (data-only setup) — but produces the account the bypass button in
  Task 7 depends on.

**Interfaces:**
- Produces: one row in `auth.users` / `profiles` with `role = 'admin'`,
  email `admin@one-connexion.dev`, whose password matches
  `NEXT_PUBLIC_DEV_ADMIN_PASSWORD` set in Task 7.

- [ ] **Step 1: Create the account through the app's own signup flow**

In the browser preview, go to `/inscription` and sign up with:
- Email: `admin@one-connexion.dev`
- Password: a password of your choice (this exact value will be reused
  as `NEXT_PUBLIC_DEV_ADMIN_PASSWORD` in Task 7 — keep it noted).

- [ ] **Step 2: Promote the account to admin**

Run via MCP `execute_sql` on project `oggxhosuvbmdmpiziezp`:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'admin@one-connexion.dev');
```

- [ ] **Step 3: Verify**

```sql
select p.role from public.profiles p
join auth.users u on u.id = p.id
where u.email = 'admin@one-connexion.dev';
```

Expected: `role = 'admin'`.

- [ ] **Step 4: No commit** (data-only step, nothing to commit).

---

### Task 3: Middleware guard for `/admin/*`

**Files:**
- Modify: `middleware.ts`

**Interfaces:**
- Consumes: `profiles.role` from Task 1.
- Produces: non-admins hitting `/admin/*` are redirected to `/dashboard`;
  unauthenticated users hitting `/admin/*` are redirected to `/connexion`
  (reuses the existing `!user` branch).

- [ ] **Step 1: Add the admin check**

Modify `middleware.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protéger les routes /dashboard et /admin
  if (!user && (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/admin"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    return NextResponse.redirect(url);
  }

  // Réserver /admin aux comptes admin
  if (user && request.nextUrl.pathname.startsWith("/admin")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // Rediriger vers dashboard si déjà connecté
  if (user && (request.nextUrl.pathname === "/connexion" || request.nextUrl.pathname === "/inscription")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/connexion", "/inscription"],
};
```

- [ ] **Step 2: Verify manually**

Run `npm run build` — expect success. Then in the browser preview: visit
`/admin` while logged out → redirected to `/connexion`. Log in as a normal
(non-admin) client account → visit `/admin` → redirected to `/dashboard`.

- [ ] **Step 3: Commit**

```bash
git add middleware.ts
git commit -m "feat(auth): restrict /admin routes to admin role

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Admin nav config and layout shell

**Files:**
- Create: `lib/admin-nav.ts`
- Create: `app/admin/layout.tsx`

**Interfaces:**
- Produces: `ADMIN_NAV_ITEMS: AdminNavItem[]` (exported from
  `lib/admin-nav.ts`), consumed by `app/admin/layout.tsx` and any admin
  page that needs the list of sections.
- Consumes: `createClient()` from `lib/supabase/client.ts` (browser
  client, same as `app/dashboard/layout.tsx`).

- [ ] **Step 1: Create `lib/admin-nav.ts`**

```typescript
/**
 * lib/admin-nav.ts
 * Source unique des entrées de navigation du dashboard admin.
 */
import { LayoutDashboard, Truck, Calendar, Users, Wallet, type LucideIcon } from "lucide-react";

export type AdminNavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { name: "Vue d'ensemble", href: "/admin", icon: LayoutDashboard },
  { name: "Courses & dispatch", href: "/admin/courses", icon: Truck },
  { name: "Navettes récurrentes", href: "/admin/navettes", icon: Calendar },
  { name: "Chauffeurs", href: "/admin/chauffeurs", icon: Users },
  { name: "Clients", href: "/admin/clients", icon: Users },
  { name: "Chiffre d'affaires", href: "/admin/chiffre-affaires", icon: Wallet },
];
```

- [ ] **Step 2: Create `app/admin/layout.tsx`**

```tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { ADMIN_NAV_ITEMS } from "@/lib/admin-nav";
import { createClient } from "@/lib/supabase/client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="relative min-h-screen bg-[#FBFBFB]">
      <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col items-start gap-8 px-[clamp(20px,4vw,32px)] py-10 lg:flex-row">
        <aside className="hidden w-full shrink-0 lg:block lg:w-[280px]">
          <div className="sticky top-[96px] flex flex-col gap-6">
            <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="border-b border-line p-5">
                <span className="text-[15px] font-bold text-ink">Espace Admin</span>
              </div>
              <nav className="flex flex-col p-3">
                {ADMIN_NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group relative flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-[14px] font-semibold transition-all ${
                        isActive
                          ? "bg-accent/5 text-accent shadow-[inset_0_0_0_1px_rgba(232,93,31,0.15)]"
                          : "text-muted hover:bg-paper hover:text-ink"
                      }`}
                    >
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-accent" : "text-label group-hover:text-ink"} />
                      {item.name}
                    </Link>
                  );
                })}
                <div className="my-2 border-t border-line" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-[14px] font-semibold text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut size={18} strokeWidth={2} className="text-red-400" />
                  Déconnexion
                </button>
              </nav>
            </div>
          </div>
        </aside>
        <main className="flex-1 w-full">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Run `npm run lint` and `npm run build` — expect no errors (the route has
no `page.tsx` yet, so `/admin` itself 404s — that's expected until Task 5).

- [ ] **Step 4: Commit**

```bash
git add lib/admin-nav.ts app/admin/layout.tsx
git commit -m "feat(admin): add admin layout shell and nav config

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Overview page (`/admin`)

**Files:**
- Create: `app/admin/page.tsx`

**Interfaces:**
- Consumes: `createClient()` from `lib/supabase/client.ts`; reads
  `orders` (`status`, `price_estimate`, `driver_id`, `created_at`),
  `drivers` (`status`), `navettes` (`status`).
- Produces: nothing consumed elsewhere (leaf page).

- [ ] **Step 1: Implement the page**

```tsx
"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Stats = {
  caJour: number;
  coursesEnCours: number;
  chauffeursDispo: number;
  nonDispatchees: number;
};

export default function AdminOverviewPage() {
  const supabase = createClient();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const load = async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const [ordersToday, ordersEnCours, ordersNonDispatchees, driversDispo] = await Promise.all([
        supabase.from("orders").select("price_estimate").gte("created_at", startOfDay.toISOString()).neq("status", "annulee"),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "en_cours"),
        supabase.from("orders").select("id", { count: "exact", head: true }).is("driver_id", null).in("status", ["en_attente", "confirmee"]),
        supabase.from("drivers").select("id", { count: "exact", head: true }).eq("status", "disponible"),
      ]);

      const caJour = (ordersToday.data ?? []).reduce((sum, o) => sum + (o.price_estimate ?? 0), 0);

      setStats({
        caJour,
        coursesEnCours: ordersEnCours.count ?? 0,
        chauffeursDispo: driversDispo.count ?? 0,
        nonDispatchees: ordersNonDispatchees.count ?? 0,
      });
    };
    load();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Vue d&apos;ensemble</h1>

      {stats?.nonDispatchees ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
          {stats.nonDispatchees} course{stats.nonDispatchees > 1 ? "s" : ""} en attente de dispatch.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="CA du jour" value={stats ? `${stats.caJour.toFixed(2)} €` : "…"} />
        <StatCard label="Courses en cours" value={stats ? String(stats.coursesEnCours) : "…"} />
        <StatCard label="Chauffeurs disponibles" value={stats ? String(stats.chauffeursDispo) : "…"} />
        <StatCard label="À dispatcher" value={stats ? String(stats.nonDispatchees) : "…"} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      <div className="text-[12px] font-medium text-label">{label}</div>
      <div className="mt-1 text-2xl font-bold text-ink">{value}</div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run `npm run build`. Then, logged in as the admin account from Task 2, in
the browser preview visit `/admin` and confirm the four stat cards render
without console errors (`read_console_messages`).

- [ ] **Step 3: Commit**

```bash
git add app/admin/page.tsx
git commit -m "feat(admin): add overview page with CA and dispatch stats

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: Drivers CRUD (`/admin/chauffeurs`)

**Files:**
- Create: `app/admin/chauffeurs/page.tsx`

**Interfaces:**
- Consumes: `createClient()`.
- Produces: rows in `drivers` that Task 8 (unified dispatch) reads via
  a `<select>` of `{ id, name, status }`.

- [ ] **Step 1: Implement the page**

```tsx
"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus } from "lucide-react";

type Driver = {
  id: string;
  name: string;
  phone: string | null;
  vehicle: string | null;
  status: "disponible" | "en_course" | "hors_service";
  notes: string | null;
};

const STATUS_LABEL: Record<Driver["status"], string> = {
  disponible: "Disponible",
  en_course: "En course",
  hors_service: "Hors service",
};

export default function AdminChauffeursPage() {
  const supabase = createClient();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("drivers").select("*").order("name");
    setDrivers(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return;
    const { error } = await supabase.from("drivers").insert({ name, phone, vehicle });
    if (error) {
      setError("Impossible d'ajouter le chauffeur.");
      return;
    }
    setName("");
    setPhone("");
    setVehicle("");
    load();
  };

  const updateStatus = async (id: string, status: Driver["status"]) => {
    await supabase.from("drivers").update({ status }).eq("id", id);
    load();
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Chauffeurs</h1>

      <form onSubmit={handleAdd} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-bold uppercase text-label">Nom</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-lg border border-line px-3 py-2 text-sm" required />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-bold uppercase text-label">Téléphone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-lg border border-line px-3 py-2 text-sm" />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-bold uppercase text-label">Véhicule</label>
          <input value={vehicle} onChange={(e) => setVehicle(e.target.value)} className="rounded-lg border border-line px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white">
          <Plus size={16} /> Ajouter
        </button>
      </form>
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex flex-col gap-3">
        {drivers.map((d) => (
          <div key={d.id} className="flex flex-col justify-between gap-3 rounded-2xl border border-line bg-white p-4 sm:flex-row sm:items-center">
            <div>
              <div className="font-bold text-ink">{d.name}</div>
              <div className="text-xs text-muted">{d.phone || "—"} · {d.vehicle || "—"}</div>
            </div>
            <select
              value={d.status}
              onChange={(e) => updateStatus(d.id, e.target.value as Driver["status"])}
              className="rounded-lg border border-line px-3 py-2 text-sm"
            >
              {Object.entries(STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        ))}
        {drivers.length === 0 && <p className="text-sm text-muted">Aucun chauffeur pour l&apos;instant.</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run `npm run build`. In the browser preview, log in as admin, go to
`/admin/chauffeurs`, add a driver named "Test Chauffeur", confirm it
appears in the list, change its status to "En course", reload the page
and confirm the status persisted.

- [ ] **Step 3: Commit**

```bash
git add app/admin/chauffeurs/page.tsx
git commit -m "feat(admin): add drivers CRUD page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 7: Unified dispatch view (`/admin/courses`)

**Files:**
- Create: `app/admin/courses/page.tsx`

**Interfaces:**
- Consumes: `drivers` rows (`id`, `name`, `status`) from Task 6's table;
  `orders` (`id`, `pickup_address`, `dropoff_address`, `status`,
  `driver_id`, `created_at`, `tracking_code`); `navettes` (`id`, `name`,
  `pickup_address`, `dropoff_address`, `status`, `driver_id`,
  `days_str`).
- Produces: nothing consumed elsewhere (leaf page). Writes `driver_id`
  back to `orders`/`navettes`.

- [ ] **Step 1: Implement the page**

```tsx
"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Course = {
  key: string;
  type: "commande" | "navette";
  label: string;
  route: string;
  status: string;
  driverId: string | null;
  updateDriver: (driverId: string | null) => Promise<void>;
};

type Driver = { id: string; name: string; status: string };

const ORDER_STATUSES = ["en_attente", "confirmee", "en_cours", "livree", "annulee"];

export default function AdminCoursesPage() {
  const supabase = createClient();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useState<"all" | "dispatched" | "pending">("all");

  const load = async () => {
    const [{ data: driversData }, { data: orders }, { data: navettes }] = await Promise.all([
      supabase.from("drivers").select("id, name, status").order("name"),
      supabase.from("orders").select("id, pickup_address, dropoff_address, status, driver_id, tracking_code").order("created_at", { ascending: false }),
      supabase.from("navettes").select("id, name, pickup_address, dropoff_address, status, driver_id").eq("status", "active"),
    ]);

    setDrivers(driversData ?? []);

    const orderCourses: Course[] = (orders ?? []).map((o) => ({
      key: `order-${o.id}`,
      type: "commande",
      label: o.tracking_code ?? o.id,
      route: `${o.pickup_address} → ${o.dropoff_address}`,
      status: o.status,
      driverId: o.driver_id,
      updateDriver: async (driverId) => {
        await supabase.from("orders").update({ driver_id: driverId }).eq("id", o.id);
        load();
      },
    }));

    const navetteCourses: Course[] = (navettes ?? []).map((n) => ({
      key: `navette-${n.id}`,
      type: "navette",
      label: n.name,
      route: `${n.pickup_address} → ${n.dropoff_address}`,
      status: n.status,
      driverId: n.driver_id,
      updateDriver: async (driverId) => {
        await supabase.from("navettes").update({ driver_id: driverId }).eq("id", n.id);
        load();
      },
    }));

    setCourses([...orderCourses, ...navetteCourses]);
  };

  useEffect(() => {
    load();
  }, []);

  const updateOrderStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    load();
  };

  const visible = courses.filter((c) => {
    if (filter === "dispatched") return !!c.driverId;
    if (filter === "pending") return !c.driverId;
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Courses & dispatch</h1>

      <div className="flex gap-2">
        {(["all", "pending", "dispatched"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold ${filter === f ? "bg-accent text-white" : "bg-white text-muted border border-line"}`}
          >
            {f === "all" ? "Toutes" : f === "pending" ? "À dispatcher" : "Dispatchées"}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {visible.map((c) => (
          <div key={c.key} className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${c.type === "navette" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-700"}`}>
                  {c.type === "navette" ? "Navette" : "Course"}
                </span>
                <span className="font-bold text-ink">{c.label}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.driverId ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                  {c.driverId ? "Dispatchée" : "À dispatcher"}
                </span>
              </div>
              <div className="mt-1 text-xs text-muted">{c.route}</div>
            </div>
            <div className="flex items-center gap-2">
              {c.type === "commande" && (
                <select value={c.status} onChange={(e) => updateOrderStatus(c.key.replace("order-", ""), e.target.value)} className="rounded-lg border border-line px-3 py-2 text-sm">
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              )}
              <select
                value={c.driverId ?? ""}
                onChange={(e) => c.updateDriver(e.target.value || null)}
                className="rounded-lg border border-line px-3 py-2 text-sm"
              >
                <option value="">Non assigné</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
        {visible.length === 0 && <p className="text-sm text-muted">Aucune course dans ce filtre.</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run `npm run build`. In the browser preview as admin: go to
`/admin/courses`, confirm both an order (created earlier from
`/dashboard/commander`) and — after Task 8 exists — a navette appear.
Assign a driver from Task 6 to one course, confirm its badge switches
from "À dispatcher" to "Dispatchée" and the assignment survives a reload.
Change an order's status and confirm it persists.

- [ ] **Step 3: Commit**

```bash
git add app/admin/courses/page.tsx
git commit -m "feat(admin): add unified courses dispatch view

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 8: Navette templates management (`/admin/navettes`)

**Files:**
- Create: `app/admin/navettes/page.tsx`

**Interfaces:**
- Consumes: `navettes` table (all columns, all users' rows via admin RLS).
- Produces: rows Task 7 reads for the unified dispatch view.

- [ ] **Step 1: Implement the page**

```tsx
"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Navette = {
  id: string;
  name: string;
  pickup_address: string;
  dropoff_address: string;
  days_str: string | null;
  status: string;
  estimated_price: number | null;
};

export default function AdminNavettesPage() {
  const supabase = createClient();
  const [navettes, setNavettes] = useState<Navette[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("navettes")
      .select("id, name, pickup_address, dropoff_address, days_str, status, estimated_price")
      .order("created_at", { ascending: false });
    setNavettes(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleStatus = async (id: string, current: string) => {
    await supabase.from("navettes").update({ status: current === "active" ? "inactive" : "active" }).eq("id", id);
    load();
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Navettes récurrentes</h1>
      <p className="text-sm text-muted">
        Gestion des modèles de navettes. Pour dispatcher une navette active à
        un chauffeur, utilisez <a className="text-accent underline" href="/admin/courses">Courses & dispatch</a>.
      </p>

      <div className="flex flex-col gap-3">
        {navettes.map((n) => (
          <div key={n.id} className="flex flex-col justify-between gap-3 rounded-2xl border border-line bg-white p-4 sm:flex-row sm:items-center">
            <div>
              <div className="font-bold text-ink">{n.name}</div>
              <div className="text-xs text-muted">{n.pickup_address} → {n.dropoff_address}</div>
              <div className="text-xs text-muted">{n.days_str} · {n.estimated_price ?? 0} €</div>
            </div>
            <button
              onClick={() => toggleStatus(n.id, n.status)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold ${n.status === "active" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}
            >
              {n.status === "active" ? "Active" : "Inactive"}
            </button>
          </div>
        ))}
        {navettes.length === 0 && <p className="text-sm text-muted">Aucune navette pour l&apos;instant.</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run `npm run build`. As a normal client, create a navette from
`/dashboard/navettes`. As admin, visit `/admin/navettes`, confirm it
appears, toggle it inactive, confirm the badge updates and it disappears
from `/admin/courses` (which only lists `active` navettes).

- [ ] **Step 3: Commit**

```bash
git add app/admin/navettes/page.tsx
git commit -m "feat(admin): add navette templates management page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 9: Clients list (`/admin/clients`)

**Files:**
- Create: `app/admin/clients/page.tsx`

**Interfaces:**
- Consumes: `profiles` (`id`, `full_name`, `company`, `phone`), `orders`
  (`user_id`, `price_estimate`, `status`) for per-client aggregates.

- [ ] **Step 1: Implement the page**

```tsx
"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ClientRow = {
  id: string;
  full_name: string | null;
  company: string | null;
  phone: string | null;
  ordersCount: number;
  revenue: number;
};

export default function AdminClientsPage() {
  const supabase = createClient();
  const [clients, setClients] = useState<ClientRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, company, phone")
        .order("created_at", { ascending: false });

      const { data: orders } = await supabase
        .from("orders")
        .select("user_id, price_estimate, status");

      const rows: ClientRow[] = (profiles ?? []).map((p) => {
        const own = (orders ?? []).filter((o) => o.user_id === p.id);
        const revenue = own
          .filter((o) => o.status !== "annulee")
          .reduce((sum, o) => sum + (o.price_estimate ?? 0), 0);
        return { ...p, ordersCount: own.length, revenue };
      });

      setClients(rows);
    };
    load();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Clients</h1>
      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-bold uppercase text-label">
              <th className="p-4">Client</th>
              <th className="p-4">Société</th>
              <th className="p-4">Téléphone</th>
              <th className="p-4">Commandes</th>
              <th className="p-4">CA généré</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0">
                <td className="p-4 font-semibold text-ink">{c.full_name || "—"}</td>
                <td className="p-4 text-muted">{c.company || "—"}</td>
                <td className="p-4 text-muted">{c.phone || "—"}</td>
                <td className="p-4 text-muted">{c.ordersCount}</td>
                <td className="p-4 font-semibold text-ink">{c.revenue.toFixed(2)} €</td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr><td colSpan={5} className="p-4 text-center text-muted">Aucun client.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run `npm run build`. As admin, visit `/admin/clients`, confirm the seeded
admin account and at least one client account (with the order created in
Task 7's verification) both appear with correct order counts and revenue.

- [ ] **Step 3: Commit**

```bash
git add app/admin/clients/page.tsx
git commit -m "feat(admin): add clients list with per-client aggregates

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 10: Revenue page (`/admin/chiffre-affaires`)

**Files:**
- Create: `app/admin/chiffre-affaires/page.tsx`

**Interfaces:**
- Consumes: `orders` (`price_estimate`, `status`, `created_at`),
  `navettes` (`estimated_price`, `status`).

- [ ] **Step 1: Implement the page**

```tsx
"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Period = "jour" | "semaine" | "mois";

function periodStart(period: Period): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (period === "semaine") d.setDate(d.getDate() - d.getDay());
  if (period === "mois") d.setDate(1);
  return d;
}

export default function AdminChiffreAffairesPage() {
  const supabase = createClient();
  const [ca, setCa] = useState<Record<Period, number> | null>(null);
  const [navettesRevenue, setNavettesRevenue] = useState<number>(0);

  useEffect(() => {
    const load = async () => {
      const { data: orders } = await supabase
        .from("orders")
        .select("price_estimate, status, created_at")
        .neq("status", "annulee");

      const totals: Record<Period, number> = { jour: 0, semaine: 0, mois: 0 };
      (["jour", "semaine", "mois"] as Period[]).forEach((period) => {
        const start = periodStart(period);
        totals[period] = (orders ?? [])
          .filter((o) => new Date(o.created_at) >= start)
          .reduce((sum, o) => sum + (o.price_estimate ?? 0), 0);
      });
      setCa(totals);

      const { data: navettes } = await supabase
        .from("navettes")
        .select("estimated_price")
        .eq("status", "active");
      setNavettesRevenue((navettes ?? []).reduce((sum, n) => sum + (n.estimated_price ?? 0), 0));
    };
    load();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Chiffre d&apos;affaires</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Aujourd'hui" value={ca ? `${ca.jour.toFixed(2)} €` : "…"} />
        <StatCard label="Cette semaine" value={ca ? `${ca.semaine.toFixed(2)} €` : "…"} />
        <StatCard label="Ce mois" value={ca ? `${ca.mois.toFixed(2)} €` : "…"} />
      </div>
      <div className="rounded-2xl border border-line bg-white p-5">
        <div className="text-[12px] font-medium text-label">Estimation navettes actives (mensuel)</div>
        <div className="mt-1 text-2xl font-bold text-ink">{navettesRevenue.toFixed(2)} €</div>
        <p className="mt-2 text-xs text-muted">
          Somme des prix estimés des navettes actives — n&apos;inclut pas
          encore les commandes ponctuelles ci-dessus.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      <div className="text-[12px] font-medium text-label">{label}</div>
      <div className="mt-1 text-2xl font-bold text-ink">{value}</div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run `npm run build`. As admin, visit `/admin/chiffre-affaires`, confirm
the three period totals and the navette estimate render without console
errors.

- [ ] **Step 3: Commit**

```bash
git add app/admin/chiffre-affaires/page.tsx
git commit -m "feat(admin): add revenue aggregation page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 11: Dev bypass login button

**Files:**
- Modify: `components/sections/AuthForm.tsx`
- Modify: `.env.local` (not committed — add the three new variables)

**Interfaces:**
- Consumes: `NEXT_PUBLIC_DEV_ADMIN_BYPASS`, `NEXT_PUBLIC_DEV_ADMIN_EMAIL`,
  `NEXT_PUBLIC_DEV_ADMIN_PASSWORD` env vars; the admin account from Task 2.

- [ ] **Step 1: Add the env vars to `.env.local`**

Append (using the password chosen in Task 2, Step 1):

```
NEXT_PUBLIC_DEV_ADMIN_BYPASS=true
NEXT_PUBLIC_DEV_ADMIN_EMAIL=admin@one-connexion.dev
NEXT_PUBLIC_DEV_ADMIN_PASSWORD=<the password chosen in Task 2>
```

- [ ] **Step 2: Add the button to `AuthForm.tsx`**

In `components/sections/AuthForm.tsx`, add a handler and render a button
below the existing submit button, inside the same `<form>`'s parent
column (after the closing `</form>`, still inside the left column div):

```tsx
  const handleDevBypass = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: process.env.NEXT_PUBLIC_DEV_ADMIN_EMAIL!,
      password: process.env.NEXT_PUBLIC_DEV_ADMIN_PASSWORD!,
    });
    if (error) {
      setError("Connexion admin dev impossible.");
      setLoading(false);
    } else {
      router.push("/admin");
    }
  };
```

Add this function next to `handleSubmit`, then render, right after the
`</form>` closing tag:

```tsx
          {process.env.NEXT_PUBLIC_DEV_ADMIN_BYPASS === "true" && (
            <button
              type="button"
              onClick={handleDevBypass}
              className="mt-4 w-full rounded-[6px] border border-dashed border-accent/40 bg-accent/5 py-3 text-[13px] font-bold text-accent transition-colors hover:bg-accent/10"
            >
              Accès admin (dev, sans identification)
            </button>
          )}
```

- [ ] **Step 3: Verify**

Restart the dev server (env vars are read at build/start time for
`NEXT_PUBLIC_*`). Run `npm run build`. In the browser preview, go to
`/connexion`, confirm the dashed "Accès admin (dev...)" button is
visible, click it, and confirm you land on `/admin` already
authenticated as the admin account.

- [ ] **Step 4: Commit**

```bash
git add components/sections/AuthForm.tsx
git commit -m "feat(auth): add dev-only admin bypass button on connexion page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

(`.env.local` is gitignored and stays local — do not commit it.)

---

## Self-Review Notes

- Spec coverage: rôles/accès → Tasks 1, 3; bouton dev bypass → Tasks 2, 11;
  table drivers → Task 1; dispatch unifié orders+navettes → Task 7;
  gestion modèles navettes → Task 8; chauffeurs CRUD → Task 6; clients →
  Task 9; CA → Task 10; nav/layout → Task 4. All spec sections covered.
- No placeholders: every task has full component code, no TBD/TODO.
- Type consistency: `Driver["status"]` values match the DB check
  constraint from Task 1 across Tasks 6 and 7; `ORDER_STATUSES` in Task 7
  matches the `orders.status` check constraint from the live schema.
