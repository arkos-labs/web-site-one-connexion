"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Phone } from "lucide-react";
import { PHONE_TEL } from "@/lib/site-content";
import { DASHBOARD_NAV_ITEMS } from "@/lib/dashboard-nav";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ full_name: string | null; company: string | null; role: string | null } | null>(null);
  const [ordersThisMonth, setOrdersThisMonth] = useState<number | null>(null);
  const [navettesThisMonth, setNavettesThisMonth] = useState<number | null>(null);

  const loadProfile = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    setUser(authUser);
    if (!authUser) return;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    Promise.all([
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("user_id", authUser.id)
        .gte("created_at", startOfMonth.toISOString()),
      supabase
        .from("navettes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", authUser.id)
        .eq("status", "active"),
    ]).then(([ordersRes, navettesRes]) => {
      setOrdersThisMonth(ordersRes.count ?? 0);
      setNavettesThisMonth(navettesRes.count ?? 0);
    });

    // full_name/role viennent de profiles, la raison sociale de clients
    Promise.all([
      supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", authUser.id)
        .maybeSingle(),
      supabase
        .from("clients")
        .select("company_name")
        .eq("id", authUser.id)
        .maybeSingle(),
    ]).then(([profileRes, clientRes]) => {
      setProfile({
        full_name: profileRes.data?.full_name ?? null,
        company: clientRes.data?.company_name ?? null,
        role: profileRes.data?.role ?? null,
      });
    });
  };

  useEffect(() => {
    loadProfile();

    // Recharge le profil quand l'utilisateur revient sur le dashboard après
    // l'avoir modifié dans Paramètres (le sidebar est monté une seule fois
    // par layout, donc il ne voit pas les changements sans ça).
    const handleFocus = () => loadProfile();
    window.addEventListener("focus", handleFocus);
    // Émis par la page Paramètres après une sauvegarde : on reste sur la même
    // route, donc l'effet sur `pathname` ne se déclenche pas.
    window.addEventListener("profile-updated", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("profile-updated", handleFocus);
    };
  }, []);

  useEffect(() => {
    loadProfile();
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/connexion");
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || "Mon compte";
  const company = profile?.company || user?.user_metadata?.company || "";
  const initials = displayName
    ? displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  return (
    <div className="relative min-h-screen bg-[#FBFBFB]">

      <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col items-start gap-8 px-[clamp(16px,4vw,32px)] py-4 sm:py-10 lg:flex-row">

        {/* Sidebar : visible à partir de lg. En dessous, la navigation vit
            dans le menu burger du Header (voir components/Header.tsx). */}
        <aside className="hidden w-full shrink-0 lg:block lg:w-[300px]">
          <div className="sticky top-[96px] flex flex-col gap-6">

            {/* Carte Principale Sidebar */}
            <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)]">

              {/* En-tête profil */}
              <div className="flex items-center gap-4 border-b border-line p-5">
                <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-[#0E0F10] text-[15px] font-bold text-white shadow-sm">
                  {initials}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-bold text-ink">{displayName}</span>
                    <span className="rounded-full bg-green-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-green-600">Vérifié</span>
                  </div>
                  {company && <span className="text-xs font-medium text-muted">{company}</span>}
                </div>
              </div>

              {/* Statistiques (Courses ce mois / Facturation) */}
              <div className="grid grid-cols-3 divide-x divide-line border-b border-line bg-paper/30 p-4">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[11px] font-medium text-label">Courses</span>
                  <span className="mt-0.5 text-sm font-bold text-ink">
                    {ordersThisMonth === null ? "…" : ordersThisMonth}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[11px] font-medium text-label">Navettes</span>
                  <span className="mt-0.5 text-sm font-bold text-ink">
                    {navettesThisMonth === null ? "…" : navettesThisMonth}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[11px] font-medium text-label">Facturation</span>
                  <span className="mt-0.5 text-sm font-bold text-accent">Compte pro</span>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="flex flex-col p-3">
                {DASHBOARD_NAV_ITEMS.map((item) => {
                  const isActive = pathname.startsWith(item.href);
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

                      {item.hasDot && isActive && (
                        <div className="absolute right-4 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-accent" />
                      )}

                      {item.badge && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold text-yellow-800">
                          {item.badge}
                        </div>
                      )}
                    </Link>
                  );
                })}

                {profile?.role === "admin" && (
                  <>
                    <div className="my-2 border-t border-line" />
                    <Link
                      href="/admin"
                      className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-[14px] font-bold text-accent transition-colors hover:bg-accent/10"
                    >
                      <span className="flex items-center justify-center w-[18px] h-[18px] rounded-md bg-accent text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      </span>
                      Accéder à l'Espace Admin
                    </Link>
                  </>
                )}

                <div className="my-2 border-t border-line" />

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-[14px] font-semibold text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut size={18} strokeWidth={2} className="text-red-400" />
                  Déconnexion
                </button>
              </nav>

              {/* Dispatch 24/7 EN LIGNE */}
              <div className="flex flex-col bg-[#1A1C20] text-white p-6">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                  <h3 className="text-sm font-bold tracking-wide">DISPATCH 24/7 EN LIGNE</h3>
                </div>
                <p className="mb-5 text-xs font-medium text-white/70 leading-relaxed">
                  Besoin d'une modification urgente ou d'un itinéraire multi-points ? Nos régulateurs vous répondent en direct.
                </p>
                <a
                  href={`tel:${PHONE_TEL}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-xs font-bold text-white transition-colors hover:bg-white/20"
                >
                  <Phone size={14} className="text-accent" />
                  Appeler le dispatching
                </a>
              </div>
            </div>

          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full">
          {children}
        </main>

      </div>
    </div>
  );
}
