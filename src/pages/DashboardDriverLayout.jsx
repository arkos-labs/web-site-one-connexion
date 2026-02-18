import { Link, Outlet, useLocation } from "react-router-dom";
import { Truck, MapPin, User, LogOut, MessageSquare } from "lucide-react";

export default function DashboardDriverLayout() {
    const { pathname } = useLocation();
    const isActive = (path) => pathname === path || pathname.startsWith(path + "/");

    return (
        <div className="flex h-screen flex-col bg-slate-50 font-sans text-slate-900">
            {/* Mobile-first Header */}
            <header className="flex items-center justify-between bg-white px-4 py-4 shadow-sm z-20">
                <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white font-bold">OC</div>
                    <span className="text-lg font-bold tracking-tight">Espace Chauffeur</span>
                </div>
                <Link to="/login" className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200">
                    <LogOut size={20} />
                </Link>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 pb-24">
                <Outlet />
            </main>

            {/* Bottom Navigation (Mobile Style) */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <Link to="/dashboard-driver" className={`flex flex-col items-center gap-1 ${isActive("/dashboard-driver") && !isActive("/dashboard-driver/history") && !isActive("/dashboard-driver/profile") ? "text-slate-900" : "text-slate-400"}`}>
                    <Truck size={24} strokeWidth={isActive("/dashboard-driver") && !isActive("/dashboard-driver/history") && !isActive("/dashboard-driver/profile") ? 2.5 : 2} />
                    <span className="text-[10px] font-bold uppercase tracking-wide">Missions</span>
                </Link>

                <Link to="/dashboard-driver/history" className={`flex flex-col items-center gap-1 ${isActive("/dashboard-driver/history") ? "text-slate-900" : "text-slate-400"}`}>
                    <MapPin size={24} strokeWidth={isActive("/dashboard-driver/history") ? 2.5 : 2} />
                    <span className="text-[10px] font-bold uppercase tracking-wide">Historique</span>
                </Link>

                <Link to="/dashboard-driver/chat" className={`flex flex-col items-center gap-1 ${isActive("/dashboard-driver/chat") ? "text-slate-900" : "text-slate-400"}`}>
                    <MessageSquare size={24} strokeWidth={isActive("/dashboard-driver/chat") ? 2.5 : 2} />
                    <span className="text-[10px] font-bold uppercase tracking-wide">Tchat</span>
                </Link>

                <Link to="/dashboard-driver/profile" className={`flex flex-col items-center gap-1 ${isActive("/dashboard-driver/profile") ? "text-slate-900" : "text-slate-400"}`}>
                    <User size={24} strokeWidth={isActive("/dashboard-driver/profile") ? 2.5 : 2} />
                    <span className="text-[10px] font-bold uppercase tracking-wide">Profil</span>
                </Link>
            </nav>
        </div>
    );
}
