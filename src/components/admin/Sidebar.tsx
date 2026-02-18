import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Package,
    LayoutDashboard,
    Truck,
    FileText,
    MessageSquare,
    Settings,
    HelpCircle,
    LogOut,
    Users,
    BarChart3,
    User,
    MapPin,
    Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface SidebarProps {
    type: "client" | "admin";
    onClose?: () => void; // For mobile drawer
}

export const Sidebar = ({ type, onClose }: SidebarProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { profile } = useProfile();
    const { unreadCount } = useUnreadMessages(type, type === "client" ? profile?.id : undefined);
    const [user, setUser] = useState<SupabaseUser | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, []);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            toast.success("Déconnexion réussie");
            navigate("/connexion");
        } catch (error) {
            console.error("Erreur lors de la déconnexion:", error);
            toast.error("Erreur lors de la déconnexion");
        }
    };

    const clientNavItems = [
        {
            label: "Tableau de bord",
            icon: LayoutDashboard,
            path: "/client/tableau-de-bord",
        },
        {
            label: "Commandes",
            icon: Package,
            path: "/client/commandes",
        },
        {
            label: "Factures",
            icon: FileText,
            path: "/client/factures",
        },
        {
            label: "Messages",
            icon: MessageSquare,
            path: "/client/messages",
        },
        {
            label: "Paramètres",
            icon: Settings,
            path: "/client/parametres",
        },
        {
            label: "Centre d'aide",
            icon: HelpCircle,
            path: "/client/aide",
        },
    ];

    const adminNavItems = [
        {
            label: "Tableau de bord",
            icon: LayoutDashboard,
            path: "/admin/tableau-de-bord",
        },
        {
            label: "Commandes",
            icon: Package,
            path: "/admin/commandes",
        },
        {
            label: "Dispatch",
            icon: Send,
            path: "/admin/dispatch",
        },
        {
            label: "Chauffeurs",
            icon: Truck,
            path: "/admin/chauffeurs",
        },
        {
            label: "Clients",
            icon: Users,
            path: "/admin/clients",
        },
        {
            label: "Statistiques",
            icon: BarChart3,
            path: "/admin/statistiques",
        },
        {
            label: "Factures",
            icon: FileText,
            path: "/admin/factures",
        },
        {
            label: "Carte en Direct",
            icon: MapPin,
            path: "/admin/carte-live",
        },
        {
            label: "Messagerie",
            icon: MessageSquare,
            path: "/admin/messagerie",
        },
        {
            label: "Paramètres",
            icon: Settings,
            path: "/admin/parametres",
        },
    ];

    const navItems = type === "client" ? clientNavItems : adminNavItems;

    // Logic to determine display name and email
    const displayName = type === "client"
        ? (profile?.company_name || user?.user_metadata?.company_name || profile?.first_name || user?.user_metadata?.first_name || "Client")
        : "Administrateur";

    const displayEmail = type === "client"
        ? (profile?.email || user?.email || "")
        : "admin@one-connexion.com";

    return (
        <div className="h-full flex flex-col bg-[#0B1525] text-white transition-all duration-300">
            {/* Logo Section */}
            <div
                className="px-6 border-b border-white/10 shrink-0 py-4"
                onClick={onClose}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 border border-[#D4AF37]/50 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <span className="text-[#D4AF37] text-lg font-serif font-bold">OC</span>
                    </div>
                    <div>
                        <span className="text-xl font-serif font-bold tracking-wide text-white block">
                            One Connexion
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 block mt-0.5">
                            {type === "client" ? "Espace Client" : "Administration"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className={cn(
                "flex-1 px-3 py-3",
                type === "admin" ? "overflow-hidden" : "overflow-y-auto custom-scrollbar"
            )}>
                <div className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold px-3 mb-2">
                    Menu Principal
                </div>
                <ul className="space-y-0.5">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center gap-3 px-3 rounded-lg transition-all duration-200 relative group overflow-hidden py-2.5",
                                        isActive
                                            ? "bg-[#D4AF37] text-white font-medium shadow-md"
                                            : "text-gray-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <item.icon className={cn(
                                        "flex-shrink-0 transition-transform duration-300 h-[18px] w-[18px]",
                                        isActive ? "scale-110" : "group-hover:scale-110"
                                    )} />
                                    <span className="flex-1 tracking-wide text-[15px]">{item.label}</span>

                                    {/* Badge pour les messages non lus */}
                                    {(item.label === "Messages" || item.label === "Messagerie") && unreadCount > 0 && (
                                        <Badge
                                            className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center border-none"
                                        >
                                            {unreadCount}
                                        </Badge>
                                    )}

                                    {/* Active Indicator Line for non-active items hover effect */}
                                    {!isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity rounded-l-lg" />
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User Section */}
            <div className="border-t border-white/10 bg-[#08101C] shrink-0 p-2">
                <div className="bg-white/5 rounded-xl border border-white/5 hover:border-[#D4AF37]/30 transition-colors group p-2">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-[#D4AF37]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate group-hover:text-[#D4AF37] transition-colors text-sm">
                                {displayName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {displayEmail}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-gray-400 hover:text-white hover:bg-white/10 text-xs uppercase tracking-wider h-8"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-3 w-3 mr-2" />
                        Se déconnecter
                    </Button>
                </div>
            </div>
        </div>
    );
};

