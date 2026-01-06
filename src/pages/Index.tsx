import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { ClientRoute } from "@/components/auth/ClientRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import { preloadCityPricingCache } from "@/utils/pricingEngineDb";

// Lazy loading pages for better performance
const Home = lazy(() => import("./Home"));
const CreateDriver = lazy(() => import("./CreateDriver"));
const AuthPage = lazy(() => import("./auth/AuthPage"));
const Expertises = lazy(() => import("./Expertises"));
const Tarifs = lazy(() => import("./Tarifs"));
const FAQ = lazy(() => import("./FAQ"));
const Contact = lazy(() => import("./Contact"));
const About = lazy(() => import("./About"));
// const Privacy = lazy(() => import("./Privacy")); // Was imported but not used in original file or mapped to same route as PolitiqueConfidentialite
const Medical = lazy(() => import("./expertises/Medical"));
const Juridique = lazy(() => import("./expertises/Juridique"));
const Evenementiel = lazy(() => import("./expertises/Evenementiel"));
const Automobile = lazy(() => import("./expertises/Automobile"));
const CommandeSansCompte = lazy(() => import("./CommandeSansCompte"));
const ForgotPassword = lazy(() => import("./ForgotPassword"));
const ResetPassword = lazy(() => import("./ResetPassword"));
const SetDriverPassword = lazy(() => import("./driver/SetPassword"));
const CGV = lazy(() => import("./CGV"));
const MentionsLegales = lazy(() => import("./MentionsLegales"));
const Cookies = lazy(() => import("./Cookies"));
const PolitiqueConfidentialite = lazy(() => import("./PolitiqueConfidentialite"));
const NotFound = lazy(() => import("./NotFound"));
const HowItWorks = lazy(() => import("./HowItWorks"));
const Reviews = lazy(() => import("./Reviews"));

// Client Dashboard Pages
const DashboardClient = lazy(() => import("./client/DashboardClient"));
const Orders = lazy(() => import("./client/Orders"));
const OrderDetailClient = lazy(() => import("./client/OrderDetail"));
const Tracking = lazy(() => import("./client/Tracking"));
const Invoices = lazy(() => import("./client/Invoices"));
const Messages = lazy(() => import("./client/Messages"));
const SettingsClient = lazy(() => import("./client/Settings"));
const Help = lazy(() => import("./client/Help"));

// Admin Dashboard Pages
const DashboardAdmin = lazy(() => import("./admin/DashboardAdmin"));
const OrdersAdmin = lazy(() => import("./admin/OrdersAdmin"));
const OrderDetailAdmin = lazy(() => import("./admin/OrderDetailAdmin"));
const Drivers = lazy(() => import("./admin/Drivers"));
const DriverDetail = lazy(() => import("./admin/DriverDetail"));
const Clients = lazy(() => import("./admin/Clients"));
const ClientDetail = lazy(() => import("./admin/ClientDetail"));
const Statistics = lazy(() => import("./admin/Statistics"));
const SettingsAdmin = lazy(() => import("./admin/Settings"));
const Messaging = lazy(() => import("./admin/Messaging"));
const InvoicesAdmin = lazy(() => import("./admin/InvoicesAdmin"));
const LiveMap = lazy(() => import("./admin/LiveMap"));
const Dispatch = lazy(() => import("./admin/Dispatch"));

// Driver
const DriverDashboard = lazy(() => import("./driver/Dashboard"));

// Component de chargement élégant
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
    <div className="relative">
      <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="h-2 w-2 rounded-full bg-primary"></div>
      </div>
    </div>
    <p className="text-muted-foreground animate-pulse text-sm font-medium">Chargement...</p>
  </div>
);

const Index = () => {
  // Précharger le cache de tarification au démarrage de l'application
  useEffect(() => {
    preloadCityPricingCache().catch(console.error);
  }, []);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/create-driver" element={<CreateDriver />} />
        <Route path="/auth" element={<Navigate to="/login" replace />} />
        <Route path="/about" element={<About />} />
        <Route path="/a-propos" element={<About />} />
        <Route path="/expertises" element={<Expertises />} />
        <Route path="/expertises/medical" element={<Medical />} />
        <Route path="/expertises/juridique" element={<Juridique />} />
        <Route path="/expertises/evenementiel" element={<Evenementiel />} />
        <Route path="/expertises/automobile" element={<Automobile />} />
        <Route path="/tarifs" element={<Tarifs />} />
        <Route path="/fonctionnement" element={<HowItWorks />} />
        <Route path="/avis" element={<Reviews />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/commande-sans-compte" element={<CommandeSansCompte />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/driver/set-password" element={<SetDriverPassword />} />
        <Route path="/driver/dashboard" element={<DriverDashboard />} />
        <Route path="/app" element={<Navigate to="/driver/dashboard" replace />} />
        <Route path="/cgv" element={<CGV />} />
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
        <Route path="/privacy" element={<PolitiqueConfidentialite />} />

        {/* Client Dashboard Routes */}
        <Route path="/client" element={
          <ClientRoute>
            <DashboardLayout type="client" />
          </ClientRoute>
        }>
          <Route index element={<Navigate to="/client/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardClient />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:orderId" element={<OrderDetailClient />} />
          <Route path="tracking" element={<Tracking />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="messages" element={<Messages />} />
          <Route path="settings" element={<SettingsClient />} />
          <Route path="help" element={<Help />} />
        </Route>

        {/* Admin Dashboard Routes */}
        <Route path="/dashboard-admin" element={
          <AdminRoute>
            <DashboardLayout type="admin" />
          </AdminRoute>
        }>
          <Route index element={<Navigate to="/dashboard-admin/tableau-de-bord" replace />} />
          <Route path="tableau-de-bord" element={<DashboardAdmin />} />
          <Route path="dispatch" element={<Dispatch />} />
          <Route path="commandes" element={<OrdersAdmin />} />
          <Route path="commandes/:id" element={<OrderDetailAdmin />} />
          <Route path="chauffeurs" element={<Drivers />} />
          <Route path="chauffeurs/:id" element={<DriverDetail />} />
          <Route path="clients" element={<Clients />} />
          <Route path="clients/:id" element={<ClientDetail />} />
          <Route path="statistiques" element={<Statistics />} />
          <Route path="factures" element={<InvoicesAdmin />} />
          <Route path="carte-live" element={<LiveMap />} />
          <Route path="messagerie" element={<Messaging />} />
          <Route path="parametres" element={<SettingsAdmin />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default Index;
