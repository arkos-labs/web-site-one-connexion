import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute.jsx";

// Public Pages
const Landing = lazy(() => import("../pages/public/Landing.jsx"));
const Login = lazy(() => import("../pages/auth/Login.jsx"));
const Register = lazy(() => import("../pages/auth/Register.jsx"));
const RegisterDriver = lazy(() => import("../pages/auth/RegisterDriver.jsx"));
const GuestOrder = lazy(() => import("../pages/public/GuestOrder.jsx"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword.jsx"));
const Contact = lazy(() => import("../pages/public/Contact.jsx"));
const About = lazy(() => import("../pages/public/About.jsx"));
const Privacy = lazy(() => import("../pages/legal/Privacy.jsx"));
const MentionsLegales = lazy(() => import("../pages/legal/MentionsLegales.jsx"));
const NotFound = lazy(() => import("../pages/public/NotFound.tsx"));

// SEO / Specialized Pages
const CoursierB2BParis = lazy(() => import("../pages/public/CoursierB2BParis.jsx"));
const CoursierIDF = lazy(() => import("../pages/public/CoursierIDF.jsx"));
const MessagerieExpressIDF = lazy(() => import("../pages/public/MessagerieExpressIDF.jsx"));
const DevisCoursierParis = lazy(() => import("../pages/public/DevisCoursierParis.jsx"));
const TarifsCoursierParis = lazy(() => import("../pages/public/TarifsCoursierParis.jsx"));
const CoursierOpticienParis = lazy(() => import("../pages/public/CoursierOpticienParis.jsx"));
const CoursierDentisteParis = lazy(() => import("../pages/public/CoursierDentisteParis.jsx"));
const CoursierJuridiqueParis = lazy(() => import("../pages/public/CoursierJuridiqueParis.jsx"));
const CoursierEvenementielParis = lazy(() => import("../pages/public/CoursierEvenementielParis.jsx"));
const CoursierAutomobileParis = lazy(() => import("../pages/public/CoursierAutomobileParis.jsx"));
const NavetteReguliereIDF = lazy(() => import("../pages/public/NavetteReguliereIDF.jsx"));

// Client Dashboard
const DashboardClient = lazy(() => import("../pages/client/DashboardClient.jsx"));
const DashboardClientLayout = lazy(() => import("../pages/client/DashboardClientLayout.jsx"));
const NouvelleCourse = lazy(() => import("../pages/client/NouvelleCourse.jsx"));
const Orders = lazy(() => import("../pages/client/Orders.jsx"));
const OrderDetails = lazy(() => import("../pages/client/OrderDetails.jsx"));
const Invoices = lazy(() => import("../pages/client/Invoices.jsx"));
const Addresses = lazy(() => import("../pages/client/Addresses.jsx"));
const Profile = lazy(() => import("../pages/client/Profile.jsx"));
const Settings = lazy(() => import("../pages/client/Settings.jsx"));
const ClientChat = lazy(() => import("../pages/client/ClientChat.jsx"));

// Admin Dashboard
const DashboardAdmin = lazy(() => import("../pages/admin/DashboardAdmin.jsx"));
const DashboardAdminLayout = lazy(() => import("../pages/admin/DashboardAdminLayout.jsx"));
const AdminOrders = lazy(() => import("../pages/admin/AdminOrders.jsx"));
const AdminOrderDetails = lazy(() => import("../pages/admin/AdminOrderDetails.jsx"));
const AdminInvoices = lazy(() => import("../pages/admin/AdminInvoices.jsx"));
const AdminInvoiceDetails = lazy(() => import("../pages/admin/AdminInvoiceDetails.jsx"));
const AdminClients = lazy(() => import("../pages/admin/AdminClients.jsx"));
const AdminClientDetails = lazy(() => import("../pages/admin/AdminClientDetails.jsx"));
const AdminDrivers = lazy(() => import("../pages/admin/AdminDrivers.jsx"));
const AdminDriverDetails = lazy(() => import("../pages/admin/AdminDriverDetails.jsx"));
const AdminChat = lazy(() => import("../pages/admin/AdminChat.jsx"));

// Driver Dashboard
const DashboardDriver = lazy(() => import("../pages/driver/DashboardDriver.jsx"));
const DashboardDriverLayout = lazy(() => import("../pages/driver/DashboardDriverLayout.jsx"));
const DriverHistory = lazy(() => import("../pages/driver/DriverHistory.jsx"));
const DriverProfile = lazy(() => import("../pages/driver/DriverProfile.jsx"));

const Loading = () => null;

export const AppRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/connexion" element={<Login />} />
        <Route path="/inscription" element={<Register />} />
        <Route path="/inscription-driver" element={<RegisterDriver />} />
        <Route path="/guest-order" element={<Navigate to="/commande-sans-compte" replace />} />
        <Route path="/commande-sans-compte" element={<GuestOrder />} />
        <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/confidentialite" element={<Privacy />} />
        <Route path="/mentions-legales" element={<MentionsLegales />} />

        {/* Specialized SEO Pages */}
        <Route path="/coursier-b2b-paris" element={<CoursierB2BParis />} />
        <Route path="/coursier-ile-de-france" element={<CoursierIDF />} />
        <Route path="/messagerie-express-ile-de-france" element={<MessagerieExpressIDF />} />
        <Route path="/navette-reguliere-ile-de-france" element={<NavetteReguliereIDF />} />
        <Route path="/devis-coursier-paris" element={<DevisCoursierParis />} />
        <Route path="/tarifs-coursier-paris" element={<TarifsCoursierParis />} />
        <Route path="/coursier-opticien-paris" element={<CoursierOpticienParis />} />
        <Route path="/coursier-dentiste-paris" element={<CoursierDentisteParis />} />
        <Route path="/coursier-juridique-paris" element={<CoursierJuridiqueParis />} />
        <Route path="/coursier-evenementiel-paris" element={<CoursierEvenementielParis />} />
        <Route path="/coursier-automobile-paris" element={<CoursierAutomobileParis />} />

        {/* Client Dashboard Routes */}
        <Route
          path="/dashboard-client"
          element={
            <ProtectedRoute allowedRoles={["client", "user"]}>
              <DashboardClientLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardClient />} />
          <Route path="nouvelle-course" element={<NouvelleCourse />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetails />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="addresses" element={<Addresses />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="chat" element={<ClientChat />} />
        </Route>

        {/* Admin Dashboard Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin", "super_admin", "dispatcher"]}>
              <DashboardAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardAdmin />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetails />} />
          <Route path="invoices" element={<AdminInvoices />} />
          <Route path="invoices/:id" element={<AdminInvoiceDetails />} />
          <Route path="clients" element={<AdminClients />} />
          <Route path="clients/:id" element={<AdminClientDetails />} />
          <Route path="drivers" element={<AdminDrivers />} />
          <Route path="drivers/:id" element={<AdminDriverDetails />} />
          <Route path="chat" element={<AdminChat />} />
        </Route>

        {/* Driver Dashboard Routes */}
        <Route
          path="/dashboard-driver"
          element={
            <ProtectedRoute allowedRoles={["driver", "courier"]}>
              <DashboardDriverLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardDriver />} />
          <Route path="history" element={<DriverHistory />} />
          <Route path="profile" element={<DriverProfile />} />
          <Route path="chat" element={<ClientChat />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};
