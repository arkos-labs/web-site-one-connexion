import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { MapPin, Plus, Edit2, Trash2 } from "lucide-react";
import { autocompleteAddress } from "../../lib/autocomplete";

const LOCATIONIQ_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;
const LOCATIONIQ_URL = "https://api.locationiq.com/v1/autocomplete";

export default function Addresses() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", line: "", city: "", postal_code: "" });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState(null);

  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: "", line: "", city: "", postal_code: "" });
    setSuggestions([]);
    setOpen(true);
  };


  const openEdit = (address) => {
    setEditingId(address.id);
    setForm({
      name: address.name,
      line: address.address_line,
      city: address.city || "",
      postal_code: address.postal_code || ""
    });
    setSuggestions([]);
    setOpen(true);
  };


  const getPostcode = (str) => {
    const match = str.match(/\b\d{5}\b/);
    return match ? match[0] : "";
  };

  const fetchSuggestions = async (query) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      setLoadingSuggestions(true);
      const results = await autocompleteAddress(query);
      const list = results.map(s => ({
        label: s.full,
        city: s.city,
        postcode: s.postcode
      }));
      setSuggestions(list);
    } catch (err) {
      console.error("Autocomplete error:", err);
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleAddressChange = (e) => {
    const val = e.target.value;
    setForm({ ...form, line: val });
    fetchSuggestions(val);
  };

  const selectSuggestion = (s) => {
    setForm({
      ...form,
      line: s.label,
      city: s.city,
      postal_code: s.postcode || getPostcode(s.label)
    });
    setSuggestions([]);
  };


  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.line.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      name: form.name,
      address_line: form.line,
      city: form.city || form.line.split(',').pop()?.trim(),
      postal_code: form.postal_code || getPostcode(form.line),
      client_id: user.id
    };

    if (editingId) {
      const { error } = await supabase
        .from('addresses')
        .update(payload)
        .eq('id', editingId);

      if (!error) fetchAddresses();
    } else {
      const { error } = await supabase
        .from('addresses')
        .insert(payload);

      if (!error) fetchAddresses();
    }
    setOpen(false);
  };

  const askRemove = (id) => {
    setConfirmId(id);
    setConfirmOpen(true);
  };

  const confirmRemove = async () => {
    if (!confirmId) return;
    const { error } = await supabase.from('addresses').delete().eq('id', confirmId);
    if (!error) {
      setItems(prev => prev.filter(i => i.id !== confirmId));
    }
    setConfirmOpen(false);
    setConfirmId(null);
  };

  return (
    <div className="font-body pb-20">
      <header className="mb-16 space-y-4 border-b border-noir/5 pb-10 flex flex-col md:flex-row md:items-end md:justify-between">
        <div className="space-y-4">
          <h1 className="text-6xl font-display italic text-noir leading-none">
            Mon <span className="text-[#ed5518]">Carnet.</span>
          </h1>
          <p className="text-noir/40 font-medium tracking-[0.1em]">Gérez vos lieux fréquents pour commander en quelques secondes.</p>
        </div>
        <button
          onClick={openCreate}
          className="px-8 py-5 rounded-xl bg-noir text-white text-[10px] font-bold uppercase tracking-[0.25em] hover:bg-[#ed5518] transition-all hover:-translate-y-1 active:translate-y-0 shadow-xl shadow-noir/20 flex items-center gap-4"
        >
          <Plus size={16} />
          <span>Nouveau Lieu</span>
        </button>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-noir/10" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-noir/20">Synchronisation des points</p>
        </div>
      ) : items.length === 0 ? (
        <div className="max-w-3xl mx-auto py-20 text-center space-y-12">
          <div className="p-20 rounded-[3rem] border border-noir/5 bg-white/50 flex flex-col items-center space-y-8">
            <div className="h-24 w-24 rounded-full border border-noir/5 flex items-center justify-center text-noir/10 bg-noir/[0.01]">
              <MapPin size={40} strokeWidth={1} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-display italic text-noir">Carnet d'adresses vide.</h3>
              <p className="text-sm text-noir/40 max-w-sm mx-auto leading-relaxed">
                Enregistrez vos adresses favorites pour ne plus avoir à les saisir lors de vos prochaines expéditions.
              </p>
            </div>
            <button
              onClick={openCreate}
              className="px-10 py-5 rounded-xl border border-noir/10 text-noir text-[10px] font-bold uppercase tracking-[0.2em] hover:border-noir transition-all"
            >
              Ajouter une première adresse
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <div key={a.id} className="group relative bg-white rounded-[2.5rem] border border-noir/5 p-8 flex flex-col justify-between shadow-sm hover:shadow-2xl hover:shadow-noir/5 transition-all hover:border-[#ed5518]/20 group">
              <div className="space-y-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-noir/20">Destination</p>
                    <h3 className="text-2xl font-display italic text-noir leading-none group-hover:text-[#ed5518] transition-colors">{a.name}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-noir/[0.02] border border-noir/5 flex items-center justify-center text-noir/10 group-hover:text-[#ed5518]/30 transition-all">
                    <MapPin size={24} strokeWidth={1} />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-noir/[0.01] border border-noir/5 flex-1 max-h-[100px] overflow-hidden">
                  <p className="text-xs font-medium text-noir/60 leading-relaxed italic">
                    {a.address_line}
                  </p>
                  {a.city && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#ed5518] mt-2 opacity-70">
                      {a.city} • {a.postal_code}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-noir/5 flex items-center gap-3">
                <button
                  onClick={() => openEdit(a)}
                  className="flex-1 py-4 px-4 rounded-xl bg-noir text-white text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-[#ed5518] transition-all flex items-center justify-center gap-3"
                >
                  <Edit2 size={12} />
                  <span>Editer</span>
                </button>
                <button
                  onClick={() => askRemove(a.id)}
                  className="h-[52px] w-[52px] rounded-xl flex items-center justify-center bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-colors"
                >
                  <Trash2 size={18} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-noir/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[2.5rem] bg-white p-12 shadow-2xl border border-noir/5 relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-12 right-12 text-noir/20 hover:text-noir transition-colors text-[10px] font-bold uppercase tracking-widest"
            >
              Fermer
            </button>

            <header className="mb-10 space-y-2">
              <h3 className="text-4xl font-display italic text-noir leading-none">
                {editingId ? "Editer." : "Ajouter."}
              </h3>
              <p className="text-xs text-noir/40 font-medium tracking-wide italic">Détails de l'emplacement récurrent.</p>
            </header>

            <form onSubmit={submit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-noir/30 ml-1">Référence du lieu</label>
                <input
                  className="w-full rounded-2xl border border-noir/5 bg-noir/[0.01] px-6 py-4 text-sm font-medium focus:bg-white focus:border-[#ed5518]/30 transition-all outline-none"
                  placeholder="Ex: Entrepôt Nord, Siège, etc."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-noir/30 ml-1">Adresse précise</label>
                  <div className="relative">
                    <textarea
                      rows={3}
                      className="w-full rounded-2xl border border-noir/5 bg-noir/[0.01] px-6 py-4 text-sm font-medium focus:bg-white focus:border-[#ed5518]/30 transition-all outline-none resize-none placeholder:italic"
                      placeholder="Saisissez l'adresse..."
                      value={form.line}
                      onChange={handleAddressChange}
                    />
                    {loadingSuggestions && (
                      <div className="absolute right-6 bottom-6">
                        <Loader2 className="animate-spin text-noir/10 h-5 w-5" />
                      </div>
                    )}
                  </div>
                </div>

                {suggestions.length > 0 && (
                  <div className="overflow-hidden rounded-2xl border border-noir/5 bg-white shadow-xl max-h-64 overflow-y-auto">
                    {suggestions.map((s, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => selectSuggestion(s)}
                        className="w-full border-b border-noir/[0.03] px-6 py-4 text-left text-xs font-medium hover:bg-noir/[0.02] last:border-0 group flex items-center gap-4"
                      >
                        <MapPin size={14} className="text-noir/20 group-hover:text-[#ed5518]" />
                        <span className="text-noir/60">{s.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 py-5 text-[10px] font-bold uppercase tracking-widest text-noir/30 hover:text-noir transition-colors">
                  Annuler
                </button>
                <button type="submit" className="flex-[2] py-5 rounded-xl bg-noir text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#ed5518] shadow-xl shadow-noir/20 transition-all">
                  Enregistrer l'adresse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Remove */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-noir/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-[3rem] bg-white p-12 shadow-2xl border border-noir/5 text-center space-y-8">
            <div className="mx-auto h-20 w-20 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
              <Trash2 size={32} strokeWidth={1} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-display italic text-noir leading-none">Supprimer ?</h3>
              <p className="text-xs text-noir/40 leading-relaxed italic">
                Cette action est irréversible. Le point de passage sera retiré de votre base de données.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { setConfirmOpen(false); setConfirmId(null); }}
                className="py-4 text-[9px] font-black uppercase tracking-widest text-noir/30 hover:text-noir transition-colors"
              >
                Garder
              </button>
              <button
                onClick={confirmRemove}
                className="py-4 rounded-xl bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-rose-900/20 hover:bg-rose-600 transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



