import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Landing from "./pages/Landing.jsx";
import DashboardClient from "./pages/DashboardClient.jsx";
import DashboardClientLayout from "./pages/DashboardClientLayout.jsx";
import Orders from "./pages/Orders.jsx";
import OrderDetails from "./pages/OrderDetails.jsx";
import Invoices from "./pages/Invoices.jsx";
import Addresses from "./pages/Addresses.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";
import DashboardAdmin from "./pages/DashboardAdmin.jsx";
import DashboardAdminLayout from "./pages/DashboardAdminLayout.jsx";
import AdminOrders from "./pages/AdminOrders.jsx";
import AdminOrderDetails from "./pages/AdminOrderDetails.jsx";
import AdminInvoices from "./pages/AdminInvoices.jsx";
import AdminInvoiceDetails from "./pages/AdminInvoiceDetails.jsx";
import AdminClients from "./pages/AdminClients.jsx";
import AdminClientDetails from "./pages/AdminClientDetails.jsx";
import AdminDrivers from "./pages/AdminDrivers.jsx";
import AdminDriverDetails from "./pages/AdminDriverDetails.jsx";
import AdminChat from "./pages/AdminChat.jsx";
import ClientChat from "./pages/ClientChat.jsx";
import Login from "./pages/Login.jsx";
import RegisterDriver from "./pages/RegisterDriver.jsx";
import Register from "./pages/Register.jsx";
import GuestOrder from "./pages/GuestOrder.jsx";
import Contact from "./pages/Contact.jsx";
import About from "./pages/About.jsx";
import Privacy from "./pages/Privacy.jsx";
import CoursierB2BParis from "./pages/CoursierB2BParis.jsx";
import CoursierIDF from "./pages/CoursierIDF.jsx";
import MessagerieExpressIDF from "./pages/MessagerieExpressIDF.jsx";
import DevisCoursierParis from "./pages/DevisCoursierParis.jsx";
import TarifsCoursierParis from "./pages/TarifsCoursierParis.jsx";
import CoursierOpticienParis from "./pages/CoursierOpticienParis.jsx";
import CoursierDentisteParis from "./pages/CoursierDentisteParis.jsx";
import CoursierJuridiqueParis from "./pages/CoursierJuridiqueParis.jsx";
import CoursierEvenementielParis from "./pages/CoursierEvenementielParis.jsx";
import CoursierAutomobileParis from "./pages/CoursierAutomobileParis.jsx";
import NavetteReguliereIDF from "./pages/NavetteReguliereIDF.jsx";
import DashboardDriver from "./pages/DashboardDriver.jsx";
import DashboardDriverLayout from "./pages/DashboardDriverLayout.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-driver" element={<RegisterDriver />} />
        <Route path="/guest-order" element={<GuestOrder />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
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
          path="/dashboard-admin"
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
    </BrowserRouter>
  );
}
