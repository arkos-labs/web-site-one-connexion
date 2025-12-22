import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./Home";
import CreateDriver from "./CreateDriver";
import AuthPage from "./auth/AuthPage";
import Expertises from "./Expertises";
import Tarifs from "./Tarifs";
import FAQ from "./FAQ";
import Contact from "./Contact";
import About from "./About";
import Privacy from "./Privacy";
import Medical from "./expertises/Medical";
import Juridique from "./expertises/Juridique";
import Evenementiel from "./expertises/Evenementiel";
import Automobile from "./expertises/Automobile";
import CommandeSansCompte from "./CommandeSansCompte";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import SetDriverPassword from "./driver/SetPassword";
import CGV from "./CGV";
import MentionsLegales from "./MentionsLegales";
import Cookies from "./Cookies";
import PolitiqueConfidentialite from "./PolitiqueConfidentialite";
import CookiesPolicy from "./CookiesPolicy";
import NotFound from "./NotFound";
import HowItWorks from "./HowItWorks";
import Reviews from "./Reviews";
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardClient from "./client/DashboardClient";
import Orders from "./client/Orders";
import OrderDetailClient from "./client/OrderDetail";
import Tracking from "./client/Tracking";
import Invoices from "./client/Invoices";
import Messages from "./client/Messages";
import SettingsClient from "./client/Settings";
import Help from "./client/Help";
import DashboardAdmin from "./admin/DashboardAdmin";
import OrdersAdmin from "./admin/OrdersAdmin";
import OrderDetailAdmin from "./admin/OrderDetailAdmin";
import Drivers from "./admin/Drivers";
import DriverDetail from "./admin/DriverDetail";
import Clients from "./admin/Clients";
import ClientDetail from "./admin/ClientDetail";
import Statistics from "./admin/Statistics";
import SettingsAdmin from "./admin/Settings";
import Messaging from "./admin/Messaging";
import InvoicesAdmin from "./admin/InvoicesAdmin";
import LiveMap from "./admin/LiveMap";
import Dispatch from "./admin/Dispatch";
import DriverDashboard from "./driver/Dashboard";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { ClientRoute } from "@/components/auth/ClientRoute";
import { preloadCityPricingCache } from "@/utils/pricingEngineDb";

import { useEffect } from "react";

const Index = () => {
  // Précharger le cache de tarification au démarrage de l'application
  useEffect(() => {
    preloadCityPricingCache().catch(console.error);
  }, []);

  return (
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
  );
};

export default Index;
