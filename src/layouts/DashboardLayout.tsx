import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/admin/Sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { useNewOrderNotifications } from "@/hooks/useNewOrderNotifications";
import { useNavigate } from "react-router-dom";

interface DashboardLayoutProps {
  type: "client" | "admin";
}

const DashboardLayout = ({ type }: DashboardLayoutProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  // Set up new order notifications for admin (hook is always called, callback only executes for admin)
  useNewOrderNotifications(
    type === "admin"
      ? () => navigate("/dashboard-admin/commandes")
      : undefined
  );

  return (
    <div className="min-h-screen flex w-full bg-gradient-subtle">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 shadow-strong z-30">
        <Sidebar type={type} />
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header (Mobile & Desktop) */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between md:hidden">
          <div className="font-semibold text-lg text-primary">
            One Connexion
          </div>
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 border-r-0">
              <Sidebar type={type} onClose={() => setIsMobileOpen(false)} />
            </SheetContent>
          </Sheet>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="container mx-auto px-4 py-6 md:px-8 md:py-8 max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
