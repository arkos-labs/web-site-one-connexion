import { useEffect, useState } from "react";
import { User, Mail, Phone, Building2, MapPin, FileText, BadgeCheck, CreditCard, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { fetchSiret } from "../../lib/siret.js";


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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        const d = data.details || {};
        setForm({
          ...form,
          company: d.company || "",
          contact: d.contact || d.full_name || d.contact_name || "",
          phone: d.phone || d.phone_number || "",
          address: data.address || d.address || "",
          city: data.city || d.city || "",
          zip: data.postal_code || d.zip || d.postal_code || "",
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
    fetchProfile();
  };

  const save = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let autoSiret = form.siret;
    if (!autoSiret && form.company) {
      autoSiret = await fetchSiret(form.company, form.zip || form.city);
    }
    const updatedForm = { ...form, siret: autoSiret };

    const { error } = await supabase.from('profiles').update({
      address: updatedForm.address,
      city: updatedForm.city,
      postal_code: updatedForm.zip,
      details: updatedForm
    }).eq('id', user.id);

    if (!error) {
      setEditing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-noir/10" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-noir/20">Accès au compte</p>
      </div>
    );
  }

  return (
    <div className="font-body pb-20">
      <header className="mb-16 space-y-4 border-b border-noir/5 pb-10 flex flex-col md:flex-row md:items-end md:justify-between">
        <div className="space-y-4">
          <h1 className="text-6xl font-display italic text-noir leading-none">
            Mon <span className="text-[#ed5518]">Profil.</span>
          </h1>
          <p className="text-noir/40 font-medium tracking-[0.1em]">Gérez vos informations et préférences de compte.</p>
        </div>
        {!editing && (
          <div className="flex gap-4">
            <button
              onClick={() => setEditing(true)}
              className="px-8 py-4 rounded-xl bg-noir text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#ed5518] transition-all active:scale-95 shadow-lg shadow-noir/10"
            >
              Modifier le profil
            </button>
          </div>
        )}
      </header>

      <div className="bg-white rounded-[2.5rem] border border-noir/5 overflow-hidden flex flex-col md:flex-row">
        {/* Avatar Sidebar */}
        <div className="md:w-1/3 bg-noir/[0.01] p-12 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-noir/5">
          <div className="relative group">
            <img
              className="h-40 w-40 rounded-[2.5rem] object-cover ring-1 ring-noir/5"
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(form.company || form.contact)}&background=0A0A0A&color=fff&font-size=0.35&italic=true`}
              alt="Profile"
            />
            <div className="absolute inset-0 rounded-[2.5rem] bg-noir/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <User className="text-white" size={32} strokeWidth={1} />
            </div>
          </div>
          <div className="mt-8 space-y-2">
            <h2 className="text-3xl font-display italic text-noir tracking-tight leading-none">{form.company || form.contact}</h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-noir/20">Client Partenaire</p>
          </div>

          <div className="mt-12 w-full pt-12 border-t border-noir/5 space-y-6">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
              <span className="text-noir/20">ID Compte</span>
              <span className="text-noir/60 italic font-medium">#{form.siret?.slice(0, 8) || "REF-001"}</span>
            </div>
            <button className="w-full py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-noir/30 border border-noir/5 rounded-xl hover:text-noir hover:border-noir/20 transition-colors">
              Sécurité & Accès
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 p-12">
          {!editing ? (
            <div className="grid gap-12 md:grid-cols-2">
              <section className="space-y-8">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] text-noir/30 flex items-center gap-3 px-2">Identité <span className="h-px flex-1 bg-noir/5"></span></h3>
                <div className="space-y-6">
                  <InfoRow icon={Building2} label="Société" value={form.company} />
                  <InfoRow icon={User} label="Contact" value={form.contact} />
                  <InfoRow icon={Mail} label="Email" value={form.email} />
                  <InfoRow icon={Phone} label="Téléphone" value={form.phone} />
                </div>
              </section>

              <section className="space-y-8">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] text-noir/30 flex items-center gap-3 px-2">Comptabilité <span className="h-px flex-1 bg-noir/5"></span></h3>
                <div className="space-y-6">
                  <InfoRow icon={FileText} label="SIRET" value={form.siret} />
                  <InfoRow icon={MapPin} label="Siège Social" value={`${form.address}, ${form.zip} ${form.city}`} />
                  <InfoRow icon={CreditCard} label="IBAN" value={form.iban} />
                </div>
              </section>
            </div>
          ) : (
            <form onSubmit={save} className="space-y-12">
              <div className="grid gap-8 md:grid-cols-2">
                <section className="space-y-6">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] text-noir/30 flex items-center gap-3 px-2">Coordonnées</h3>
                  <Field label="Nom société" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
                  <Field label="Contact" value={form.contact} onChange={(v) => setForm({ ...form, contact: v })} />
                  <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} disabled />
                  <Field label="Téléphone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                </section>

                <section className="space-y-6">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] text-noir/30 flex items-center gap-3 px-2">Facturation</h3>
                  <Field label="TVA" value={form.tva} onChange={(v) => setForm({ ...form, tva: v })} />
                  <Field label="Adresse" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Code postal" value={form.zip} onChange={(v) => setForm({ ...form, zip: v })} />
                    <Field label="Ville" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
                  </div>
                  <Field label="IBAN (optionnel)" value={form.iban} onChange={(v) => setForm({ ...form, iban: v })} />
                </section>
              </div>

              <div className="flex justify-end items-center gap-6 pt-10 border-t border-noir/5">
                <button type="button" onClick={cancel} className="text-[10px] font-bold uppercase tracking-widest text-noir/30 hover:text-noir transition-colors">
                  Annuler les modifications
                </button>
                <button type="submit" className="px-10 py-5 rounded-xl bg-noir text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#ed5518] transition-all shadow-xl shadow-noir/20">
                  Enregistrer
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4">
      <div className="h-10 w-10 shrink-0 rounded-xl bg-noir/[0.02] border border-noir/5 flex items-center justify-center text-noir/20 group-hover:text-noir transition-colors">
        <Icon size={18} strokeWidth={1.5} />
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-noir/20 leading-none">{label}</p>
        <p className="text-[13px] font-medium text-noir leading-relaxed">{value || "—"}</p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, disabled }) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-noir/30 ml-1">{label}</label>
      <input
        className={`w-full rounded-2xl border border-noir/5 px-6 py-4 text-sm font-medium transition-all outline-none ${disabled
          ? 'bg-noir/[0.02] text-noir/30 cursor-not-allowed border-transparent italic'
          : 'bg-white text-noir focus:border-[#ed5518]/30 focus:shadow-xl focus:shadow-noir/5'
          }`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}

