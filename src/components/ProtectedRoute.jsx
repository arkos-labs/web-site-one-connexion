import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { DashboardLoading } from "./ui/DashboardLoading";

const ADMIN_ROLES = new Set(["admin", "super_admin", "dispatcher"]);

function normalizeRole(rawRole) {
  if (!rawRole) return null;
  const role = String(rawRole).toLowerCase();
  if (role === "courier") return "driver";
  return role;
}

function getDefaultRouteForRole(role) {
  if (!role) return "/connexion";
  if (ADMIN_ROLES.has(role)) return "/admin";
  if (role === "driver") return "/dashboard-driver";
  return "/dashboard-client";
}

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const [loading, setLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const startLoadingTime = Date.now();

    const loadSessionAndRole = async (nextSession) => {
      try {
        setSession(nextSession || null);

        if (!nextSession?.user?.id) {
          setRole(null);
          return;
        }

        const userId = nextSession.user.id;
        const { data: profileData } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .maybeSingle();

        const normalizedProfileRole = normalizeRole(profileData?.role);
        if (normalizedProfileRole) {
          setRole(normalizedProfileRole);
          return;
        }

        const { data: driverData } = await supabase
          .from("drivers")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (driverData?.id) {
          setRole("driver");
          return;
        }

        const { data: clientData } = await supabase
          .from("clients")
          .select("id")
          .eq("id", userId)
          .maybeSingle();

        setRole(clientData?.id ? "client" : null);
      } catch (err) {
        console.error("Auth Load Error:", err);
        setRole(null);
      } finally {
        finishLoading();
      }
    };

    const finishLoading = () => {
      const elapsed = Date.now() - startLoadingTime;
      const remaining = Math.max(0, 500 - elapsed);
      setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => setLoading(false), 500); // 500ms fade animation
      }, remaining);
    };

    supabase.auth.getSession().then(({ data }) => {
      loadSessionAndRole(data.session || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      loadSessionAndRole(newSession || null);
    });

    return () => listener?.subscription?.unsubscribe();
  }, []);

  if (loading) return <DashboardLoading isExiting={isExiting} />;
  if (!session) return <Navigate to="/connexion" replace />;

  if (allowedRoles.length > 0) {
    const normalizedAllowed = allowedRoles.map(normalizeRole);
    if (!role || !normalizedAllowed.includes(role)) {
      return <Navigate to={getDefaultRouteForRole(role)} replace />;
    }
  }

  return children;
}



