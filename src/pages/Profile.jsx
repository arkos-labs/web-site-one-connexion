import { useEffect, useState } from "react";
import { User, Mail, Phone, Building2, MapPin, FileText, BadgeCheck, CreditCard, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    company: "",
    contact: "",
    email: "",
    phone: "",
    siret: "",
    tva: "",
    address: "",
    city: "",
    zip: "",
    iban: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('details').eq('id', user.id).single();
      if (data && data.details) {
        const d = data.details;
        setForm({
          ...form,
          company: d.company || "",
          contact: d.contact || d.full_name || d.contact_name || "",
          phone: d.phone || d.phone_number || "",
          address: d.address || "",
          city: d.city || "",
          zip: d.zip || d.postal_code || "",
          siret: d.siret || "",
          tva: d.tva || "",
          iban: d.iban || "",
          email: user.email
        });
      } else {
        setForm({ ...form, email: user.email });
      }
    }
    setLoading(false);
  };

  const cancel = () => {
    setEditing(false);
    fetchProfile(); // Reset
  };

  const save = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Save details to 'profiles'
    const { error } = await supabase.from('profiles').update({
      details: form
    }).eq('id', user.id);

    if (!error) {
      setEditing(false);
    } else {
      alert("Erreur lors de la sauvegarde.");
    }
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-4xl font-extrabold text-slate-900">Mon Profil 👤</h1>
        <p className="mt-2 text-base font-medium text-slate-500">Gérez vos informations personnelles et préférences de compte.</p>
      </header>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-slate-400" /></div>
      ) : (
        <div className="rounded-[2.5rem] bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-6">
            <img className="h-16 w-16 rounded-full" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(form.company)}&background=0f172a&color=fff`} alt="Profile" />
            <div className="min-w-[200px]">
              <h2 className="text-xl font-bold text-slate-900">{form.company}</h2>
              <p className="text-sm text-slate-500">{form.plan}</p>
            </div>
            {!editing && (
              <div className="ml-auto flex gap-3">
                <button onClick={() => setEditing(true)} className="rounded-full bg-slate-900 px-5 py-2 text-xs font-bold text-white">Modifier</button>
                <button className="rounded-full bg-slate-100 px-5 py-2 text-xs font-bold text-slate-700">Changer le mot de passe</button>
              </div>
            )}
          </div>

          {!editing ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <InfoRow icon={Building2} label="Société" value={form.company} />
              <InfoRow icon={User} label="Contact" value={form.contact} />
              <InfoRow icon={Mail} label="Email" value={form.email} />
              <InfoRow icon={Phone} label="Téléphone" value={form.phone} />
              <InfoRow icon={FileText} label="SIRET" value={form.siret} />
              <InfoRow icon={BadgeCheck} label="TVA" value={form.tva} />
              <InfoRow icon={MapPin} label="Adresse" value={`${form.address}, ${form.zip} ${form.city}`} />
              <InfoRow icon={CreditCard} label="IBAN" value={form.iban} />
            </div>
          ) : (
            <form onSubmit={save} className="mt-8 grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nom société" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
                <Field label="Contact" value={form.contact} onChange={(v) => setForm({ ...form, contact: v })} />
                <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} disabled />
                <Field label="Téléphone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                <Field label="SIRET" value={form.siret} onChange={(v) => setForm({ ...form, siret: v })} />
                <Field label="TVA" value={form.tva} onChange={(v) => setForm({ ...form, tva: v })} />
                <Field label="Adresse" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Code postal" value={form.zip} onChange={(v) => setForm({ ...form, zip: v })} />
                  <Field label="Ville" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
                </div>
                <div className="md:col-span-2">
                  <Field label="IBAN (optionnel)" value={form.iban} onChange={(v) => setForm({ ...form, iban: v })} />
                </div>
              </div>
              <div className="mt-2 flex justify-end gap-3">
                <button type="button" onClick={cancel} className="rounded-full bg-slate-100 px-5 py-2 text-xs font-bold text-slate-700">Annuler</button>
                <button type="submit" className="rounded-full bg-slate-900 px-5 py-2 text-xs font-bold text-white">Enregistrer</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-500">
        <Icon size={18} />
      </div>
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</div>
        <div className="text-sm font-semibold text-slate-900">{value || "—"}</div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, disabled }) {
  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</label>
      <input
        className={`mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-slate-100 ${disabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}
