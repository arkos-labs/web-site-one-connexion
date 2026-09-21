"use client";
/**
 * components/Header.tsx
 * En-tête sticky sobre : logo, nav, téléphone, CTA. Toujours opaque
 * (pas de transparence-au-repos) — c'est le registre "société établie",
 * pas "landing page produit".
 *
 * Mobile : tiroir latéral gauche (slide-in depuis la gauche) avec overlay sombre.
 */
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Phone, Menu, X, LogOut } from "lucide-react";
import { PHONE_DISPLAY, PHONE_TEL } from "@/lib/site-content";
import { DASHBOARD_NAV_ITEMS } from "@/lib/dashboard-nav";
import { ADMIN_NAV_ITEMS } from "@/lib/admin-nav";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

// "Services" vise une vraie page ; les autres entrées restent des ancres de la
// homepage, préfixées par "/" pour rester fonctionnelles depuis une sous-page.
const NAV_ITEMS = [
  { label: "Services", href: "/services" },
  { label: "Méthode", href: "/methode" },
  { label: "Flotte", href: "/flotte" },
  { label: "Références", href: "/references" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = pathname.startsWith("/admin");
  const isDashboard = pathname.startsWith("/dashboard") || isAdmin;
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ full_name: string | null; company: string | null; role: string | null } | null>(null);
  const [coursesThisMonth, setCoursesThisMonth] = useState<number | null>(null);

  // Bloque le scroll du body quand le tiroir est ouvert
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Ferme le tiroir au changement de route
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Charge l'utilisateur connecté, son profil et ses courses du mois pour le dashboard
  useEffect(() => {
    if (!isDashboard || isAdmin) return;

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("user_id", data.user.id)
          .gte("created_at", startOfMonth.toISOString())
          .then(({ count }) => setCoursesThisMonth(count ?? 0));

        // la raison sociale vit dans clients, pas dans profiles
        supabase
          .from("profiles")
          .select("full_name, role, clients(company_name)")
          .eq("id", data.user.id)
          .maybeSingle()
          .then(({ data: p }: { data: any }) =>
            setProfile(
              p
                ? {
                    full_name: p.full_name,
                    role: p.role,
                    company: (p.clients as any)?.company_name ?? null,
                  }
                : null
            )
          );
      }
    });
  }, [isDashboard, isAdmin, pathname]);

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
    <>
      <header className="sticky top-0 z-50 bg-ink border-b border-white/10">
        <div className="mx-auto flex h-[80px] max-w-[1240px] items-center justify-between px-[clamp(20px,4vw,28px)]">

          {/* Logo */}
          <Link href="/" className={`flex shrink-0 items-center overflow-visible ${isDashboard ? "order-2" : ""}`}>
            <Image
              src="/logo-white.png"
              alt="Logo ONE CONNEXION, coursier moto B2B à Paris et en Île-de-France"
              width={400}
              height={150}
              className="w-[130px] sm:w-[150px] md:w-[180px] h-auto origin-left object-contain"
              priority
            />
          </Link>

          {/* Navigation centrée */}
          {!isDashboard && (
            <nav className="mx-4 hidden flex-1 items-center justify-center gap-4 whitespace-nowrap lg:flex xl:gap-8">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-[14px] font-medium text-white/78 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Actions à droite */}
          <div className={`hidden shrink-0 items-center gap-3 whitespace-nowrap ${isDashboard ? "lg:flex" : "md:flex"}`}>

            {!isDashboard && (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent("open-order-modal"))}
                className="rounded-[4px] bg-accent px-[18px] py-[11px] text-[13px] font-semibold tracking-[0.01em] text-white transition-colors hover:bg-accent-dark"
              >
                Commander une course
              </button>
            )}

            {!isDashboard && (
              <div className="ml-1 flex items-center border-l border-white/20 pl-4">
                <div className="flex items-center gap-3">
                  <Link
                    href="/connexion"
                    className="text-[13px] font-medium text-white/60 transition-colors hover:text-white"
                  >
                    Se connecter
                  </Link>
                  <Link
                    href="/inscription"
                    className="rounded-[4px] border border-white/40 px-4 py-[9px] text-[13px] font-semibold tracking-[0.01em] text-white transition-colors hover:bg-white/10"
                  >
                    S'inscrire
                  </Link>
                </div>
              </div>
            )}

            <a
              href={`tel:${PHONE_TEL}`}
              className="ml-4 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-mono text-[13px] font-semibold text-white transition-colors hover:bg-white/20"
            >
              <Phone size={14} className="text-accent" />
              {PHONE_DISPLAY}
            </a>
          </div>

          {/* Bouton burger */}
          <button
            className={`flex h-10 w-10 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10 ${isDashboard ? "order-1 lg:hidden" : "ml-auto md:hidden"}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* ── Tiroir latéral gauche ── */}
      {/* Overlay sombre */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 transition-opacity duration-300 ${isDashboard ? "lg:hidden" : "md:hidden"} ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Panneau tiroir */}
      <div
        className={`fixed inset-y-0 left-0 z-[70] w-[300px] max-w-[85vw] bg-ink shadow-2xl transition-transform duration-300 ease-in-out ${isDashboard ? "lg:hidden" : "md:hidden"} ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
      >
        {/* En-tête du tiroir */}
        <div className="flex h-[80px] items-center justify-between border-b border-white/10 px-5">
          <Link href="/" onClick={() => setMenuOpen(false)}>
            {isDashboard ? (
              <Image
                src="/logo-x.png"
                alt="Logo ONE CONNEXION, coursier moto B2B à Paris et en Île-de-France"
                width={400}
                height={150}
                className="w-[115px] h-auto object-contain drop-shadow-sm"
              />
            ) : (
              <Image
                src="/logo-white.png"
                alt="Logo ONE CONNEXION, coursier moto B2B à Paris et en Île-de-France"
                width={400}
                height={150}
                className="w-[120px] h-auto object-contain"
              />
            )}
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Fermer le menu"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="h-[calc(100dvh-80px)] overflow-y-auto px-5 py-6">
          {isDashboard ? (
            <div className="flex flex-col gap-5">
              {!isAdmin && (
                <>
                  {/* Profil */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-[12px] font-bold text-white">
                      {initials}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{displayName}</span>
                      {company && <span className="text-[11px] font-medium text-white/60">{company}</span>}
                    </div>
                  </div>

                  {/* Statistiques */}
                  <div className="flex items-center divide-x divide-white/10 rounded-xl bg-white/5 p-3">
                    <div className="flex flex-1 flex-col items-center justify-center">
                      <span className="text-[10px] font-medium text-white/50">Courses ce mois</span>
                      <span className="mt-0.5 text-sm font-bold text-white">
                        {coursesThisMonth === null ? "…" : `${coursesThisMonth} course${coursesThisMonth > 1 ? "s" : ""}`}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col items-center justify-center">
                      <span className="text-[10px] font-medium text-white/50">Facturation</span>
                      <span className="mt-0.5 text-sm font-bold text-accent">Compte pro</span>
                    </div>
                  </div>
                </>
              )}

              {isAdmin && <span className="text-sm font-bold text-white">Espace Admin</span>}

              {/* Navigation */}
              <nav className="flex flex-col gap-1">
                {(isAdmin ? ADMIN_NAV_ITEMS : DASHBOARD_NAV_ITEMS).map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
                        isActive ? "bg-accent/10 text-accent" : "text-white/78 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                      {item.name}

                      {item.hasDot && isActive && (
                        <div className="absolute right-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-accent" />
                      )}

                      {item.badge && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-yellow-400/20 px-2 py-0.5 text-[10px] font-bold text-yellow-300">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}

                {!isAdmin && profile?.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="mt-2 relative flex items-center gap-3 rounded-xl bg-accent/20 px-3 py-3 text-sm font-bold text-accent transition-colors hover:bg-accent/30"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Espace Admin
                  </Link>
                )}
              </nav>

              <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
                <a
                  href={`tel:${PHONE_TEL}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
                >
                  <Phone size={14} className="text-accent" />
                  Appeler le dispatching
                </a>
                <button
                  onClick={() => { setMenuOpen(false); handleLogout(); }}
                  className="flex items-center gap-2 text-sm font-semibold text-red-400 transition-colors hover:text-red-300"
                >
                  <LogOut size={16} strokeWidth={2} />
                  Déconnexion
                </button>
              </div>
            </div>
          ) : (
            <>
              <nav className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl px-3 py-3 text-sm font-medium text-white/78 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-5 flex flex-col gap-3">
                <a href={`tel:${PHONE_TEL}`} className="flex items-center gap-2 px-3 font-mono text-[12.5px] text-white/60 hover:text-white">
                  <Phone size={13} className="text-accent" />
                  {PHONE_DISPLAY}
                </a>
                <button
                  onClick={() => { setMenuOpen(false); window.dispatchEvent(new CustomEvent("open-order-modal")); }}
                  className="rounded-[4px] bg-accent px-[18px] py-[11px] text-center text-[13px] font-semibold tracking-[0.01em] text-white hover:bg-accent-dark"
                >
                  Commander une course
                </button>
                <div className="flex flex-col gap-3 border-t border-white/10 pt-3">
                  <Link
                    href="/connexion"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl px-3 py-3 text-[14px] font-medium text-white/78 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    Se connecter
                  </Link>
                  <Link
                    href="/inscription"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-[4px] border border-white/20 px-4 py-2 text-center text-[13px] font-semibold tracking-[0.01em] text-white hover:bg-white/10"
                  >
                    S'inscrire
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
