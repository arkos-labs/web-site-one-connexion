import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { MapPin, Plus, Edit2, Trash2 } from "lucide-react";
import { autocompleteAddress } from "../lib/autocomplete";

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

  // Autocomplete state
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
    <div className="p-8 pt-0 space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <header className="mb-6">
          <h1 className="text-4xl font-extrabold text-slate-900">Carnet d'Adresses 📍</h1>
          <p className="mt-2 text-base font-medium text-slate-500">Enregistrez vos lieux fréquents pour commander plus vite.</p>
        </header>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition-transform hover:scale-105">
          <Plus size={16} /> Ajouter une adresse
        </button>
      </header>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Chargement...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 rounded-[2rem] bg-slate-50 border border-slate-100">
          <MapPin className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-900">Aucune adresse enregistrée</h3>
          <p className="text-slate-500 mb-6">Ajoutez vos lieux fréquents pour gagner du temps.</p>
          <button onClick={openCreate} className="px-6 py-2 rounded-full bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50">Ajouter maintenant</button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <div key={a.id} className="group relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight">{a.name}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{a.city || 'Ville inconnue'}</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-6 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {a.address_line}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(a)}
                  className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-slate-800 flex items-center justify-center gap-2"
                >
                  <Edit2 size={14} /> Modifier
                </button>
                <button
                  onClick={() => askRemove(a.id)}
                  className="rounded-xl bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100 flex items-center justify-center"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">{editingId ? "Modifier l'adresse" : "Nouvelle adresse"}</h3>
              <button onClick={() => setOpen(false)} className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900">✕</button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Nom du lieu</label>
                <input
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all placeholder:text-slate-300"
                  placeholder="Ex: Siège Social, Entrepôt B..."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="relative">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Adresse complète</label>
                <div className="relative">
                  <textarea
                    rows={3}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all placeholder:text-slate-300 resize-none"
                    placeholder="Ex: 14 Rue des Lilas, 75019 Paris"
                    value={form.line}
                    onChange={handleAddressChange}
                  />
                  {loadingSuggestions && (
                    <div className="absolute right-4 top-[50%] -translate-y-[50%] pt-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500"></div>
                    </div>
                  )}
                </div>
                {suggestions.length > 0 && (
                  <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
                    {suggestions.map((s, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => selectSuggestion(s)}
                        className="w-full border-b border-slate-50 px-4 py-3 text-left text-sm hover:bg-slate-50 last:border-0"
                      >
                        <div className="font-medium text-slate-900">{s.label}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors">Annuler</button>
                <button type="submit" className="flex-1 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/20 hover:scale-105 transition-transform">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-6 shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <Trash2 size={32} />
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-900">Confirmer la suppression ?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Cette action est irréversible. L'adresse sera retirée de votre carnet.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setConfirmOpen(false); setConfirmId(null); }} className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors">Annuler</button>
              <button onClick={confirmRemove} className="rounded-xl bg-rose-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/30 hover:bg-rose-600 transition-colors">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
