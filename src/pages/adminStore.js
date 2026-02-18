import { INVOICES, ORDERS } from "./adminData.js";

const ORDERS_KEY = "adminOrders";
const INVOICES_KEY = "adminInvoices";

export function getAdminOrders() {
  try {
    const saved = localStorage.getItem(ORDERS_KEY);
    return saved ? JSON.parse(saved) : ORDERS;
  } catch {
    return ORDERS;
  }
}

export function setAdminOrders(list) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
}

export function getAdminInvoices() {
  try {
    const saved = localStorage.getItem(INVOICES_KEY);
    const list = saved ? JSON.parse(saved) : INVOICES;

    // Lightweight migration: older invoices may miss issuedAt/dueDate.
    const todayIso = new Date().toISOString().slice(0, 10);
    const addDaysIso = (iso, days) => {
      const d = new Date(`${iso}T00:00:00`);
      if (Number.isNaN(d.getTime())) return null;
      d.setDate(d.getDate() + days);
      return d.toISOString().slice(0, 10);
    };

    const migrated = Array.isArray(list)
      ? list.map((i) => {
          const issuedAt = i.issuedAt || todayIso;
          const dueDate = i.dueDate || addDaysIso(issuedAt, 10) || todayIso;
          return { ...i, issuedAt, dueDate };
        })
      : INVOICES;

    return migrated;
  } catch {
    return INVOICES;
  }
}

export function setAdminInvoices(list) {
  localStorage.setItem(INVOICES_KEY, JSON.stringify(list));
}

// Monthly invoice: one invoice per client per month, containing all completed orders.
export function upsertMonthlyInvoiceFromOrder(order, { status = "À payer" } = {}) {
  const invoices = getAdminInvoices();
  const now = new Date();

  const period = now.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });

  const idx = invoices.findIndex((i) => i.client === order.client && i.period === period);

  if (idx >= 0) {
    const existing = invoices[idx];
    const orderIds = Array.isArray(existing.orderIds) ? existing.orderIds : [];
    const nextOrderIds = orderIds.includes(order.id) ? orderIds : [...orderIds, order.id];

    // Recompute amount as sum of all linked orders (safer)
    const orders = getAdminOrders();
    const amount = nextOrderIds.reduce((sum, id) => {
      const o = orders.find((x) => x.id === id);
      return sum + Number(o?.total || 0);
    }, 0);

    const nextInvoice = {
      ...existing,
      status: existing.status || status,
      orderIds: nextOrderIds,
      amount,
    };

    const next = [...invoices];
    next[idx] = nextInvoice;
    setAdminInvoices(next);
    return nextInvoice;
  }

  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const suffix = String(invoices.length + 1).padStart(4, "0");

  const issuedAt = now.toISOString().slice(0, 10);
  const due = new Date(now);
  due.setDate(due.getDate() + 10);
  const dueDate = due.toISOString().slice(0, 10);

  const invoice = {
    id: `INV-${yyyy}-${mm}${suffix}`,
    client: order.client,
    period,
    amount: Number(order.total || 0),
    status,
    orderIds: [order.id],
    issuedAt,
    dueDate,
  };

  const next = [invoice, ...invoices];
  setAdminInvoices(next);
  return invoice;
}
