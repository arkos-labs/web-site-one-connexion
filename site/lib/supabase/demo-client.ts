/**
 * lib/supabase/demo-client.ts
 * Mode démo de l'espace client : un faux client Supabase qui répond avec les données de
 * demo-data.ts, sans jamais joindre la vraie base. Sert à voir et à travailler l'interface
 * sans compte.
 *
 * Actif uniquement en développement (`next dev`), et seulement si le cookie `oc_demo=1` est
 * posé : ouvrir http://localhost:3000/dashboard?demo=1 pour l'activer, ?demo=0 pour le couper.
 * En production la condition est fausse à la compilation : ce code ne s'exécute jamais.
 * Les écritures (ajout, modification, suppression) ne touchent que la mémoire de l'onglet.
 */
import { DEMO_TABLES, DEMO_USER, DEMO_DRIVER } from "./demo-data";

export const DEMO_COOKIE = "oc_demo";

export function isDemoMode(): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").includes(`${DEMO_COOKIE}=1`);
}

type Row = Record<string, any>;
type Filter = (row: Row) => boolean;

const tables: Record<string, Row[]> = Object.fromEntries(
  Object.entries(DEMO_TABLES).map(([name, rows]) => [name, rows.map((r) => ({ ...r }))])
);

class DemoQuery {
  private filters: Filter[] = [];
  private sort: { column: string; ascending: boolean } | null = null;
  private max: number | null = null;
  private one: "single" | "maybe" | null = null;
  private head = false;
  private columns = "*";
  private write: { kind: "insert" | "update" | "delete" | "upsert"; values?: Row | Row[] } | null = null;

  constructor(private table: string) {}

  select(columns = "*", options?: { count?: string; head?: boolean }) {
    this.columns = columns;
    if (options?.head) this.head = true;
    return this;
  }
  insert(values: Row | Row[]) { this.write = { kind: "insert", values }; return this; }
  upsert(values: Row | Row[]) { this.write = { kind: "upsert", values }; return this; }
  update(values: Row) { this.write = { kind: "update", values }; return this; }
  delete() { this.write = { kind: "delete" }; return this; }

  eq(column: string, value: unknown) { this.filters.push((r) => r[column] === value); return this; }
  neq(column: string, value: unknown) { this.filters.push((r) => r[column] !== value); return this; }
  in(column: string, values: unknown[]) { this.filters.push((r) => values.includes(r[column])); return this; }
  is(column: string, value: unknown) { this.filters.push((r) => (r[column] ?? null) === value); return this; }
  gt(column: string, value: any) { this.filters.push((r) => r[column] > value); return this; }
  gte(column: string, value: any) { this.filters.push((r) => r[column] >= value); return this; }
  lt(column: string, value: any) { this.filters.push((r) => r[column] < value); return this; }
  lte(column: string, value: any) { this.filters.push((r) => r[column] <= value); return this; }
  not(column: string, operator: string, value: unknown) {
    if (operator === "is" && value === null) this.filters.push((r) => r[column] != null);
    else if (operator === "eq") this.filters.push((r) => r[column] !== value);
    return this;
  }
  // Les filtres « or » de l'appli ne servent qu'à masquer des commandes non payées : sans effet ici.
  or() { return this; }
  ilike() { return this; }
  like() { return this; }
  order(column: string, options?: { ascending?: boolean }) {
    this.sort = { column, ascending: options?.ascending ?? true };
    return this;
  }
  limit(n: number) { this.max = n; return this; }
  range(from: number, to: number) { this.max = to - from + 1; return this; }
  single() { this.one = "single"; return this; }
  maybeSingle() { this.one = "maybe"; return this; }

  private run(): { data: any; error: null; count: number | null } {
    const all = (tables[this.table] ??= []);
    const matches = (r: Row) => this.filters.every((f) => f(r));

    if (this.write) {
      const { kind, values } = this.write;
      let touched: Row[] = [];
      if (kind === "insert" || kind === "upsert") {
        touched = (Array.isArray(values) ? values : [values!]).map((v, i) => ({
          id: `demo-${this.table}-${Date.now()}-${i}`,
          created_at: new Date().toISOString(),
          ...v,
        }));
        all.unshift(...touched);
      } else if (kind === "update") {
        touched = all.filter(matches);
        touched.forEach((r) => Object.assign(r, values));
      } else {
        touched = all.filter(matches);
        tables[this.table] = all.filter((r) => !matches(r));
      }
      const data = this.one ? touched[0] ?? null : touched;
      return { data, error: null, count: touched.length };
    }

    let rows = all.filter(matches);
    if (this.sort) {
      const { column, ascending } = this.sort;
      rows = [...rows].sort((a, b) => (a[column] > b[column] ? 1 : a[column] < b[column] ? -1 : 0) * (ascending ? 1 : -1));
    }
    const count = rows.length;
    if (this.max != null) rows = rows.slice(0, this.max);
    // Liste des factures : la colonne demandée est un simple décompte des lignes.
    if (this.columns.includes("invoice_items(count)")) {
      rows = rows.map((r) => ({ ...r, invoice_items: [{ count: Array.isArray(r.invoice_items) ? r.invoice_items.length : 0 }] }));
    }
    if (this.head) return { data: null, error: null, count };
    if (this.one) return { data: rows[0] ?? null, error: null, count };
    return { data: rows, error: null, count };
  }

  then<T>(resolve: (value: { data: any; error: null; count: number | null }) => T, reject?: (reason: unknown) => T) {
    return Promise.resolve().then(() => this.run()).then(resolve, reject);
  }
}

const session = { access_token: "demo", refresh_token: "demo", user: DEMO_USER };

const channel = () => {
  const c: any = { on: () => c, subscribe: () => c, unsubscribe: () => {} };
  return c;
};

export function createDemoClient(): any {
  return {
    auth: {
      getUser: async () => ({ data: { user: DEMO_USER }, error: null }),
      getSession: async () => ({ data: { session }, error: null }),
      onAuthStateChange: (callback: (event: string, s: typeof session) => void) => {
        setTimeout(() => callback("SIGNED_IN", session), 0);
        return { data: { subscription: { unsubscribe() {} } } };
      },
      updateUser: async () => ({ data: { user: DEMO_USER }, error: null }),
      signOut: async () => {
        document.cookie = `${DEMO_COOKIE}=; path=/; max-age=0`;
        return { error: null };
      },
    },
    from: (table: string) => new DemoQuery(table),
    rpc: async (name: string) => ({ data: name === "get_mission_driver" ? DEMO_DRIVER : null, error: null }),
    channel,
    removeChannel: () => {},
    functions: { invoke: async () => ({ data: null, error: null }) },
  };
}
