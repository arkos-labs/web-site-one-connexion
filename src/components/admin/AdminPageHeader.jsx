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
        <header className="pb-12 border-b border-noir/5 mb-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="space-y-4">
                    {backTo && (
                        <button
                            onClick={() => navigate(backTo)}
                            className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-noir/30 hover:text-noir transition-colors"
                        >
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Retour</span>
                        </button>
                    )}

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-4 flex-wrap">
                            <h1 className="text-5xl font-display italic tracking-tight text-noir">
                                {title}.
                            </h1>
                            {badge && (
                                <span className="inline-flex items-center gap-2 rounded-full border border-noir/5 bg-cream px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-noir/40">
                                    <span className="relative flex h-1.5 w-1.5 mr-1">
                                        <span className="animate-ping absolute h-full w-full rounded-full bg-[#ed5518] opacity-75"></span>
                                        <span className="relative h-1.5 w-1.5 rounded-full bg-[#ed5518]"></span>
                                    </span>
                                    {badge.label}
                                    {badge.count !== undefined && (
                                        <span className="ml-1 text-noir font-black">{badge.count}</span>
                                    )}
                                </span>
                            )}
                        </div>
                        {subtitle && (
                            <p className="text-sm font-medium text-noir/40 italic">{subtitle}</p>
                        )}
                    </div>
                </div>

                {actions && (
                    <div className="flex items-center gap-4 flex-wrap pb-1">
                        {actions}
                    </div>
                )}
            </div>
        </header>
    );
}
