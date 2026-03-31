import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * AdminPageHeader — shared header for all admin sub-pages.
 *
 * Props:
 *  - title: string
 *  - subtitle: string (optional)
 *  - badge: { label, count } (optional)
 *  - actions: ReactNode (optional)
 *  - backTo: string (optional, url to go back)
 */
export default function AdminPageHeader({ title, subtitle, badge, actions, backTo }) {
    const navigate = useNavigate();

    return (
        <header className="pt-2 pb-2">
            <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                    {backTo && (
                        <button
                            onClick={() => navigate(backTo)}
                            className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
                        >
                            <ArrowLeft size={14} /> Retour
                        </button>
                    )}
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">{title}</h1>
                        {badge && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                                {badge.label}
                                {badge.count !== undefined && (
                                    <span className="rounded-full bg-slate-900 text-white text-[9px] font-black px-1.5 py-0.5 min-w-[18px] text-center">{badge.count}</span>
                                )}
                            </span>
                        )}
                    </div>
                    {subtitle && (
                        <p className="mt-1.5 text-sm font-medium text-slate-400">{subtitle}</p>
                    )}
                </div>
                {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
            </div>
        </header>
    );
}
