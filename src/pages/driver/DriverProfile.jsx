import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Loader2, User, Mail, Phone } from "lucide-react";

export default function DriverProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data } = await supabase.from("profiles").select("email, details").eq("id", user.id).maybeSingle();
      setProfile(data || null);
      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500">
        <Loader2 className="mr-2 animate-spin" size={18} />
        Chargement du profil...
      </div>
    );
  }

  const details = profile?.details || {};
  const fullName = details.full_name || [details.first_name, details.last_name].filter(Boolean).join(" ") || "Chauffeur";
  const phone = details.phone || "Non renseigné";
  const email = profile?.email || details.email || "Non renseigné";

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-black text-slate-900">Mon profil</h1>
        <p className="text-sm text-slate-500">Informations de votre compte chauffeur.</p>
      </header>

      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-slate-900">
            <User size={18} />
            <span className="font-semibold">{fullName}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <Mail size={18} />
            <span>{email}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <Phone size={18} />
            <span>{phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

