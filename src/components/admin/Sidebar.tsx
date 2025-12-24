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
import { Logo } from "@/components/ui/Logo";

interface SidebarProps {
    type: "client" | "admin";
    onClose?: () => void; // For mobile drawer
}

export const Sidebar = ({ type, onClose }: SidebarProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { profile } = useProfile();
    const { unreadCount } = useUnreadMessages(type, type === "client" ? profile?.id : undefined);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            toast.success("Déconnexion réussie");
            navigate("/login");
        } catch (error) {
            console.error("Erreur lors de la déconnexion:", error);
            toast.error("Erreur lors de la déconnexion");
        }
    };

    const clientNavItems = [
        {
            label: "Tableau de bord",
            icon: LayoutDashboard,
            path: "/client/dashboard",
        },
        {
            label: "Commandes",
            icon: Package,
            path: "/client/orders",
        },
        {
            label: "Factures",
            icon: FileText,
            path: "/client/invoices",
        },
        {
            label: "Messages",
            icon: MessageSquare,
            path: "/client/messages",
        },
        {
            label: "Paramètres",
            icon: Settings,
            path: "/client/settings",
        },
        {
            label: "Centre d'aide",
            icon: HelpCircle,
            path: "/client/help",
        },
    ];

    const adminNavItems = [
        {
            label: "Tableau de bord",
            icon: LayoutDashboard,
            path: "/dashboard-admin/tableau-de-bord",
        },
        {
            label: "Commandes",
            icon: Package,
            path: "/dashboard-admin/commandes",
        },
        {
            label: "Dispatch",
            icon: Send,
            path: "/dashboard-admin/dispatch",
        },
        {
            label: "Chauffeurs",
            icon: Truck,
            path: "/dashboard-admin/chauffeurs",
        },
        {
            label: "Clients",
            icon: Users,
            path: "/dashboard-admin/clients",
        },
        {
            label: "Statistiques",
            icon: BarChart3,
            path: "/dashboard-admin/statistiques",
        },
        {
            label: "Factures",
            icon: FileText,
            path: "/dashboard-admin/factures",
        },
        {
            label: "Carte en Direct",
            icon: MapPin,
            path: "/dashboard-admin/carte-live",
        },
        {
            label: "Messagerie",
            icon: MessageSquare,
            path: "/dashboard-admin/messagerie",
        },
        {
            label: "Paramètres",
            icon: Settings,
            path: "/dashboard-admin/parametres",
        },
    ];

    const navItems = type === "client" ? clientNavItems : adminNavItems;

    return (
        <div className="h-full flex flex-col bg-sidebar text-sidebar-foreground">
            {/* Logo */}
            {/* Logo */}
            <div className="px-2 py-6 border-b border-sidebar-border" onClick={onClose}>
                <Logo variant="sidebar" size="lg" className="-ml-1" />
                <span className="text-xs text-sidebar-foreground/70 mt-1 block px-2">
                    {type === "client" ? "Espace Client" : "Espace Admin"}
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 overflow-y-auto">
                <div className="text-xs font-semibold text-sidebar-foreground/50 mb-4 px-4 uppercase tracking-wider">
                    MENU PRINCIPAL
                </div>
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    onClick={onClose}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative",
                                        isActive
                                            ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-medium text-sm"
                                    )}
                                >
                                    <item.icon className="h-5 w-5 flex-shrink-0" />
                                    <span className="flex-1">{item.label}</span>
                                    {/* Badge pour les messages non lus */}
                                    {(item.label === "Messages" || item.label === "Messagerie") && unreadCount > 0 && (
                                        <Badge
                                            className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center animate-pulse"
                                        >
                                            {unreadCount}
                                        </Badge>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User Section */}
            <div className="p-6 border-t border-sidebar-border">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center">
                        <User className="h-5 w-5 text-sidebar-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                            {type === "client"
                                ? (profile ? `CL – ${profile.company_name}` : "Chargement...")
                                : "Administrateur"}
                        </p>
                        <p className="text-xs text-sidebar-foreground/70 truncate">
                            {type === "client" ? (profile?.email) : "admin@test.fr"}
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Se déconnecter
                </Button>
            </div>
        </div>
    );
};
