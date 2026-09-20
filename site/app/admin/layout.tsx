"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";
import { ADMIN_NAV_ITEMS } from "@/lib/admin-nav";
import { createClient } from "@/lib/supabase/client";
import { PHONE_TEL } from "@/lib/site-content";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const loadPendingCount = async () => {
      const todayIso = new Date().toISOString().slice(0, 10);
      const WEEKDAY_IDS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      const todayId = WEEKDAY_IDS[new Date().getDay()];

      const [orders, navettes] = await Promise.all([
        supabase.from("orders").select("id", { count: "exact", head: true }).is("driver_id", null).in("status", ["en_attente", "confirmee"]),
        supabase.from("navettes").select("id", { count: "exact", head: true }).eq("status", "active").contains("days_of_week", [todayId]).or(`driver_id.is.null,last_dispatch_date.is.null,last_dispatch_date.neq.${todayIso}`),
      ]);
      setPendingCount((orders.count ?? 0) + (navettes.count ?? 0));
    };
    loadPendingCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/connexion");
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#FBFBFB]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col items-start gap-8 px-[clamp(20px,4vw,32px)] py-10 lg:flex-row">
        <aside className="hidden w-full shrink-0 lg:block lg:w-[280px]">
          <div className="sticky top-[96px] flex flex-col gap-6">
            <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between gap-3 border-b border-line bg-ink p-5">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]" />
                    <span className="font-mono text-[10px] tracking-[0.18em] text-white/40 uppercase">One Connexion</span>
                  </div>
                  <span className="text-[15px] font-bold text-white">Espace Admin</span>
                </div>
                <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-white/60">v2.4</span>
              </div>

              <nav className="flex flex-col p-3">
                {ADMIN_NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  const badgeCount = item.href === "/admin/courses" ? pendingCount : 0;
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
                      <span className="flex-1">{item.name}</span>

                      {badgeCount > 0 && (
                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-white">
                          {badgeCount}
                        </span>
                      )}
                      {isActive && badgeCount === 0 && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
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

            <div className="flex items-center gap-2.5 px-2 text-[12px] font-medium text-label">
              <ShieldCheck size={14} />
              Session admin sécurisée
            </div>
          </div>
        </aside>
        <main className="flex-1 w-full">{children}</main>
      </div>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-between gap-2 px-[clamp(20px,4vw,32px)] py-5 text-[12.5px] font-medium text-label sm:flex-row">
          <span>© {new Date().getFullYear()} One Connexion · Système de gestion de navettes et courses privées.</span>
          <div className="flex items-center gap-4">
            <a href={`tel:${PHONE_TEL}`} className="hover:text-ink">Aide &amp; Support</a>
            <span className="text-line">·</span>
            <Link href="/admin/courses" className="hover:text-ink">Documentation Dispatch</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
