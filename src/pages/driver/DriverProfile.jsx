import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  Loader2, User, Mail, Phone, Car, CreditCard,
  Edit2, Save, X, CheckCircle2, Camera, Bike, Truck
} from "lucide-react";
import { toast } from "sonner";

const VEHICLE_OPTIONS = [
  { value: "velo", label: "Vélo / Électrique", icon: "🚴" },
  { value: "scooter", label: "Scooter / Moto", icon: "🛵" },
  { value: "Moto", label: "Moto", icon: "🏍️" },
  { value: "voiture", label: "Voiture / Van", icon: "🚗" },
  { value: "camion", label: "Camion", icon: "🚛" },
];

function Avatar({ name, avatarUrl, size = 80 }) {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-2xl object-cover border-4 border-white shadow-xl"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size, fontSize: size / 3 }}
      className="rounded-2xl bg-[#ed5518] text-white font-black grid place-items-center border-4 border-white shadow-xl"
    >
      {initials}
    </div>
  );
}

function SectionCard({ title, icon, children, onEdit, editing, onSave, onCancel, saving }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500">
            {icon}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {!editing ? (
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
            >
              <Edit2 size={11} /> Modifier
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onCancel}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 active:scale-95"
              >
                <X size={11} /> Annuler
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white hover:bg-[#ed5518] disabled:opacity-50 active:scale-95 transition-all"
              >
                {saving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
                Enregistrer
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, value, editing, name, type = "text", placeholder = "", onChange }) {
  return (
    <div className={`rounded-2xl p-3.5 border transition-all ${editing ? "border-slate-200 bg-white shadow-sm" : "border-transparent bg-slate-50"}`}>
      <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</div>
      {editing ? (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm font-bold text-slate-900 focus:outline-none placeholder:text-slate-300"
        />
      ) : (
        <div className="text-sm font-bold text-slate-900 truncate">{value || <span className="text-slate-300">—</span>}</div>
      )}
    </div>
  );
}

export default function DriverProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [userId, setUserId] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const [editPersonal, setEditPersonal] = useState(false);
  const [editVehicle, setEditVehicle] = useState(false);
  const [editBanking, setEditBanking] = useState(false);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [savingBanking, setSavingBanking] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [personal, setPersonal] = useState({ full_name: "", phone_number: "", email: "" });
  const [vehicle, setVehicle] = useState({ vehicle_type: "", vehicle_model: "", vehicle_plate: "" });
  const [banking, setBanking] = useState({ iban: "", bic: "" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    setUserId(user.id);

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
      const d = data.details || {};
      const av = d.avatar_url || user?.user_metadata?.avatar_url || null;
      setAvatarUrl(av);
      setPersonal({
        full_name: d.full_name || `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        phone_number: d.phone_number || d.phone || "",
        email: data.email || d.email || "",
      });
      setVehicle({
        vehicle_type: d.vehicle_type || "",
        vehicle_model: d.vehicle_model || "",
        vehicle_plate: d.vehicle_plate || "",
      });
      setBanking({
        iban: d.iban || "",
        bic: d.bic || "",
      });
    }
    setLoading(false);
  };

  const handleSave = async (section, data, setSaving, setEdit) => {
    setSaving(true);
    const currentDetails = profile?.details || {};
    const { error } = await supabase
      .from("profiles")
      .update({ details: { ...currentDetails, ...data } })
      .eq("id", userId);

    if (error) {
      toast.error("Erreur : " + error.message);
    } else {
      toast.success("Profil mis à jour ✓");
      setEdit(false);
      await fetchProfile();
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop();
    const path = `drivers/${userId}/avatar.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadErr) {
      toast.error("Erreur upload : " + uploadErr.message);
      setUploadingAvatar(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = urlData?.publicUrl;
    const currentDetails = profile?.details || {};
    await supabase
      .from("profiles")
      .update({ details: { ...currentDetails, avatar_url: publicUrl } })
      .eq("id", userId);
    setAvatarUrl(publicUrl + "?t=" + Date.now());
    toast.success("Photo mise à jour ✓");
    setUploadingAvatar(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
        <Loader2 className="animate-spin" size={22} />
        <span className="text-sm font-bold">Chargement du profil…</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm font-bold">
        Profil introuvable.
      </div>
    );
  }

  const displayName = personal.full_name || profile.email || "Chauffeur";
  const vehicleOption = VEHICLE_OPTIONS.find(v => v.value.toLowerCase() === vehicle.vehicle_type?.toLowerCase());

  return (
    <div className="space-y-5 pb-8">
      {/* Hero Card */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl">
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#ed5518]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-20 bg-white/3 blur-2xl rounded-full" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <Avatar name={displayName} avatarUrl={avatarUrl} size={72} />
            <label className="absolute -bottom-2 -right-2 h-7 w-7 bg-[#ed5518] rounded-xl flex items-center justify-center cursor-pointer hover:bg-orange-500 transition-colors shadow-lg">
              {uploadingAvatar
                ? <Loader2 size={12} className="animate-spin text-white" />
                : <Camera size={13} className="text-white" />
              }
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </label>
          </div>
          <div>
            <h1 className="text-lg font-black leading-tight">{displayName}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {vehicleOption ? `${vehicleOption.icon} ${vehicleOption.label}` : "Chauffeur Partenaire"}
            </p>
            {vehicle.vehicle_plate && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1 text-[10px] font-black tracking-widest">
                🚘 {vehicle.vehicle_plate.toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <SectionCard
        title="Informations personnelles"
        icon={<User size={16} />}
        editing={editPersonal}
        onEdit={() => setEditPersonal(true)}
        onCancel={() => { setEditPersonal(false); }}
        onSave={() => handleSave("personal", personal, setSavingPersonal, setEditPersonal)}
        saving={savingPersonal}
      >
        <div className="grid gap-3">
          <Field
            label="Prénom & Nom"
            name="full_name"
            value={personal.full_name}
            editing={editPersonal}
            placeholder="Jean Dupont"
            onChange={e => setPersonal(p => ({ ...p, full_name: e.target.value }))}
          />
          <Field
            label="Téléphone"
            name="phone_number"
            value={personal.phone_number}
            editing={editPersonal}
            type="tel"
            placeholder="06 12 34 56 78"
            onChange={e => setPersonal(p => ({ ...p, phone_number: e.target.value }))}
          />
          <Field
            label="Email"
            name="email"
            value={personal.email}
            editing={false}
            placeholder="email@exemple.com"
          />
        </div>
      </SectionCard>

      {/* Vehicle Info */}
      <SectionCard
        title="Mon véhicule"
        icon={<Car size={16} />}
        editing={editVehicle}
        onEdit={() => setEditVehicle(true)}
        onCancel={() => setEditVehicle(false)}
        onSave={() => handleSave("vehicle", vehicle, setSavingVehicle, setEditVehicle)}
        saving={savingVehicle}
      >
        <div className="grid gap-3">
          {/* Vehicle type selector */}
          <div className={`rounded-2xl p-3.5 border transition-all ${editVehicle ? "border-slate-200 bg-white shadow-sm" : "border-transparent bg-slate-50"}`}>
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Type de véhicule</div>
            {editVehicle ? (
              <div className="grid grid-cols-2 gap-2">
                {VEHICLE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setVehicle(v => ({ ...v, vehicle_type: opt.value }))}
                    className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-bold border transition-all ${
                      vehicle.vehicle_type === opt.value
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span>{opt.icon}</span> {opt.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-sm font-bold text-slate-900">
                {vehicleOption ? `${vehicleOption.icon} ${vehicleOption.label}` : <span className="text-slate-300">—</span>}
              </div>
            )}
          </div>
          <Field
            label="Modèle"
            name="vehicle_model"
            value={vehicle.vehicle_model}
            editing={editVehicle}
            placeholder="Honda CBF 125"
            onChange={e => setVehicle(v => ({ ...v, vehicle_model: e.target.value }))}
          />
          <Field
            label="Plaque d'immatriculation"
            name="vehicle_plate"
            value={vehicle.vehicle_plate}
            editing={editVehicle}
            placeholder="AB-123-CD"
            onChange={e => setVehicle(v => ({ ...v, vehicle_plate: e.target.value.toUpperCase() }))}
          />
        </div>
      </SectionCard>

      {/* Banking Info */}
      <SectionCard
        title="Coordonnées bancaires"
        icon={<CreditCard size={16} />}
        editing={editBanking}
        onEdit={() => setEditBanking(true)}
        onCancel={() => setEditBanking(false)}
        onSave={() => handleSave("banking", banking, setSavingBanking, setEditBanking)}
        saving={savingBanking}
      >
        <div className="mb-4 flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-100 p-3.5">
          <CheckCircle2 size={15} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] font-bold text-amber-700 leading-relaxed">
            Ces informations sont utilisées pour calculer vos reversements de courses. Elles sont chiffrées et sécurisées.
          </p>
        </div>
        <div className="grid gap-3">
          <Field
            label="IBAN"
            name="iban"
            value={banking.iban}
            editing={editBanking}
            placeholder="FR76 1234 5678 9012 3456 7890 123"
            onChange={e => setBanking(b => ({ ...b, iban: e.target.value.toUpperCase() }))}
          />
          <Field
            label="BIC / SWIFT"
            name="bic"
            value={banking.bic}
            editing={editBanking}
            placeholder="BNPAFRPPXXX"
            onChange={e => setBanking(b => ({ ...b, bic: e.target.value.toUpperCase() }))}
          />
        </div>
        {!editBanking && banking.iban && (
          <div className="mt-3 rounded-2xl bg-emerald-50 border border-emerald-100 p-3 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span className="text-[11px] font-bold text-emerald-700">RIB enregistré — {banking.iban.slice(0, 8)}…</span>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
