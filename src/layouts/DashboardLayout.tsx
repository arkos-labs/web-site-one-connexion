import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/admin/Sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { useNewOrderNotifications } from "@/hooks/useNewOrderNotifications";
import { useNavigate } from "react-router-dom";
import AdminAssistant from "@/components/admin/AdminAssistant";

interface DashboardLayoutProps {
  type: "client" | "admin";
}

const DashboardLayout = ({ type }: DashboardLayoutProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  // Set up new order notifications for admin (hook is always called, callback only executes for admin)
  useNewOrderNotifications(
    type === "admin"
      ? () => navigate("/admin/commandes")
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
        <header className="sticky top-0 z-40 bg-[#0B1525]/90 backdrop-blur-md border-b border-white/10 p-4 flex items-center justify-between md:hidden">
          <div className="font-black text-xl text-[#ed5518] tracking-tighter uppercase">
            One Connexion
          </div>
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" aria-label="Ouvrir le menu">
                <Menu className="h-7 w-7" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 border-r-0">
              <Sidebar type={type} onClose={() => setIsMobileOpen(false)} />
            </SheetContent>
          </Sheet>
        </header>

        {/* Floating menu button (mobile safety) */}
        <div className="md:hidden fixed bottom-6 right-6 z-50">
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button className="rounded-full h-14 w-14 shadow-2xl bg-[#ed5518] hover:bg-[#ed5518]/90 text-white border-none" aria-label="Ouvrir le menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 border-r-0">
              <Sidebar type={type} onClose={() => setIsMobileOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="container mx-auto px-4 py-6 md:px-8 md:py-8 max-w-7xl">
            <Outlet />
          </div>
          {type === "admin" && <AdminAssistant />}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;



