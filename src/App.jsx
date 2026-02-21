import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

const Landing = lazy(() => import("./pages/Landing.jsx"));
const DashboardClient = lazy(() => import("./pages/DashboardClient.jsx"));
const DashboardClientLayout = lazy(() => import("./pages/DashboardClientLayout.jsx"));
const Orders = lazy(() => import("./pages/Orders.jsx"));
const OrderDetails = lazy(() => import("./pages/OrderDetails.jsx"));
const Invoices = lazy(() => import("./pages/Invoices.jsx"));
const Addresses = lazy(() => import("./pages/Addresses.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const Settings = lazy(() => import("./pages/Settings.jsx"));
const DashboardAdmin = lazy(() => import("./pages/DashboardAdmin.jsx"));
const DashboardAdminLayout = lazy(() => import("./pages/DashboardAdminLayout.jsx"));
const AdminOrders = lazy(() => import("./pages/AdminOrders.jsx"));
const AdminOrderDetails = lazy(() => import("./pages/AdminOrderDetails.jsx"));
const AdminInvoices = lazy(() => import("./pages/AdminInvoices.jsx"));
const AdminInvoiceDetails = lazy(() => import("./pages/AdminInvoiceDetails.jsx"));
const AdminClients = lazy(() => import("./pages/AdminClients.jsx"));
const AdminClientDetails = lazy(() => import("./pages/AdminClientDetails.jsx"));
const AdminDrivers = lazy(() => import("./pages/AdminDrivers.jsx"));
const AdminDriverDetails = lazy(() => import("./pages/AdminDriverDetails.jsx"));
const AdminChat = lazy(() => import("./pages/AdminChat.jsx"));
const ClientChat = lazy(() => import("./pages/ClientChat.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const RegisterDriver = lazy(() => import("./pages/RegisterDriver.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const GuestOrder = lazy(() => import("./pages/GuestOrder.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Privacy = lazy(() => import("./pages/Privacy.jsx"));
const CoursierB2BParis = lazy(() => import("./pages/CoursierB2BParis.jsx"));
const CoursierIDF = lazy(() => import("./pages/CoursierIDF.jsx"));
const MessagerieExpressIDF = lazy(() => import("./pages/MessagerieExpressIDF.jsx"));
const DevisCoursierParis = lazy(() => import("./pages/DevisCoursierParis.jsx"));
const TarifsCoursierParis = lazy(() => import("./pages/TarifsCoursierParis.jsx"));
const CoursierOpticienParis = lazy(() => import("./pages/CoursierOpticienParis.jsx"));
const CoursierDentisteParis = lazy(() => import("./pages/CoursierDentisteParis.jsx"));
const CoursierJuridiqueParis = lazy(() => import("./pages/CoursierJuridiqueParis.jsx"));
const CoursierEvenementielParis = lazy(() => import("./pages/CoursierEvenementielParis.jsx"));
const CoursierAutomobileParis = lazy(() => import("./pages/CoursierAutomobileParis.jsx"));
const NavetteReguliereIDF = lazy(() => import("./pages/NavetteReguliereIDF.jsx"));
const DashboardDriver = lazy(() => import("./pages/DashboardDriver.jsx"));
const DashboardDriverLayout = lazy(() => import("./pages/DashboardDriverLayout.jsx"));

const Loading = () => (
  <div className="flex items-center justify-center p-12 text-sm font-semibold text-slate-500">
    Chargement...
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
          <Route path="/inscription-driver" element={<RegisterDriver />} />
          <Route path="/guest-order" element={<GuestOrder />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/confidentialite" element={<Privacy />} />
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
          <Route
            path="/dashboard-client"
            element={
              <ProtectedRoute>
                <DashboardClientLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardClient />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetails />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="addresses" element={<Addresses />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="chat" element={<ClientChat />} />
          </Route>
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
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
          <Route
            path="/dashboard-driver"
            element={
              <ProtectedRoute>
                <DashboardDriverLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardDriver />} />
            <Route path="chat" element={<ClientChat />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
