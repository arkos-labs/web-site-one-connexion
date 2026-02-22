import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Truck, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { autocompleteAddress } from "../lib/autocomplete";

const VEHICLES = ["Moto", "Voiture"];
const SERVICES = ["Normal", "Exclu", "Super"];
const LOCATIONIQ_KEY = import.meta.env.VITE_LOCATIONIQ_API_KEY;
const LOCATIONIQ_URL = "https://api.locationiq.com/v1/autocomplete";

const FAVORITES = [
  { label: "Siège One Connexion", address: "10 Rue de Paris, 75008 Paris", contact: "Accueil • 01 00 00 00 00" },
  { label: "Entrepôt Nord", address: "12 Rue des Entreprises, 93200 Saint-Denis", contact: "Karim • 06 00 00 00 00" },
];

const getPostcode = (str = "") => {
  const match = String(str).match(/\b\d{5}\b/);
  return match ? match[0] : "";
};

const formatAddress = (d) => {
  if (d.full) return d.full;
  const a = d.address || {};
  const street = [a.house_number, a.road].filter(Boolean).join(" ");
  const city = [a.postcode, a.city || a.town || a.village].filter(Boolean).join(" ");
  if (street && city) return `${street}, ${city}`;
  return d.display_name;
};

function clientStatusLabel(order) {
  const status = typeof order === 'string' ? order : order.status;
  const driverId = typeof order === 'string' ? null : order.driver_id;

  switch (status) {
    case "pending_acceptance":
    case "pending": return "En attente";
    case "accepted":
    case "assigned": return driverId ? "Dispatchée" : "Acceptée";
    case "dispatched":
    case "driver_accepted":
    case "in_progress":
    case "picked_up": return "En cours";
    case "delivered": return "Terminée";
    case "cancelled": return "Annulée";
    default: return status || "—";
  }
}

function statusColor(status) {
  switch (status) {
    case "pending_acceptance":
    case "pending": return "bg-slate-100 text-slate-600";
    case "accepted":
    case "assigned": return "bg-blue-50 text-blue-600";
    case "dispatched":
    case "driver_accepted":
    case "in_progress":
    case "picked_up": return "bg-orange-50 text-orange-600";
    case "delivered": return "bg-emerald-50 text-emerald-600";
    case "cancelled": return "bg-red-50 text-red-600";
    default: return "bg-slate-100";
  }
}

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [open, setOpen] = useState(false);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [deliverySuggestions, setDeliverySuggestions] = useState([]);
  const [loadingPickup, setLoadingPickup] = useState(false);
  const [loadingDelivery, setLoadingDelivery] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const [favOpen, setFavOpen] = useState(false);
  const [favTarget, setFavTarget] = useState("pickup");
  const [favQuery, setFavQuery] = useState("");

  const [price, setPrice] = useState(null);
  const [calculatingPrice, setCalculatingPrice] = useState(false);

  const [form, setForm] = useState({
    pickup: "",
    delivery: "",
    date: new Date().toISOString().split('T')[0],
    pickupTime: "09:00",
    deliveryDeadline: "12:00",
    vehicle: "moto",
    service: "normal",
    packageType: "Pli",
    packageTypeOther: "",
    packageDesc: "",
    packageWeight: "",
    packageSize: "",
    pickupName: "",
    pickupContact: "",
    pickupPhone: "",
    pickupEmail: "",
    pickupEmail: "",
    pickupInstructions: "",
    deliveryName: "",
    deliveryContact: "",
    deliveryPhone: "",
    deliveryInstructions: "",
    pickupAccessCode: "",
    deliveryAccessCode: "",
    contactPhone: "", // legacy
  });

  // Load orders
  useEffect(() => {
    fetchOrders();
    fetchAddresses();

    // Subscribe to realtime updates for orders
    const channel = supabase
      .channel('client-orders-list-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAddresses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setLoadingAddresses(true);
    const { data } = await supabase.from('addresses').select('*').eq('client_id', user.id);
    setAddresses(data || []);
    setLoadingAddresses(false);
  };

  const fetchOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch profile
    const { data: pData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (pData) setProfile(pData);

    setLoadingOrders(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching orders:', error);
    else setOrders(data || []);
    setLoadingOrders(false);
  };

  // Formula Calculation based on Deadline
  useEffect(() => {
    if (!form.pickupTime || !form.deliveryDeadline) return;

    const [ph, pm] = form.pickupTime.split(':').map(Number);
    const [dh, dm] = form.deliveryDeadline.split(':').map(Number);

    let start = new Date();
    start.setHours(ph, pm, 0, 0);
    let end = new Date();
    end.setHours(dh, dm, 0, 0);

    // Ajustement si minuit est dépassé
    if (end < start) end.setDate(end.getDate() + 1);

    const diffMinutes = (end - start) / (1000 * 60);

    let autoService = "normal";

    if (diffMinutes <= 0) {
      autoService = "normal";
    } else if (diffMinutes <= 90) {
      autoService = "super";
    } else if (diffMinutes <= 180) { // Jusqu'à 3h -> Exclu
      autoService = "exclu";
    } else {
      autoService = "normal";
    }

    if (form.service !== autoService) {
      setForm(prev => ({ ...prev, service: autoService }));
    }
  }, [form.pickupTime, form.deliveryDeadline]);

  // Calculate Price when inputs change
  useEffect(() => {
    const calc = async () => {
      const pCode = getPostcode(form.pickup);
      const dCode = getPostcode(form.delivery);

      if (!pCode || !dCode || !form.vehicle) {
        setPrice(null);
        return;
      }

      setCalculatingPrice(true);
      const { data, error } = await supabase.rpc('calculate_shipping_cost', {
        p_pickup_postal_code: pCode,
        p_delivery_postal_code: dCode,
        p_vehicle_type: form.vehicle.toLowerCase(),
        p_service_level: form.service.toLowerCase()
      });

      setCalculatingPrice(false);
      if (error) {
        console.error("Price calc error:", error);
        setPrice(null);
      } else {
        setPrice(data); // Can be null if not found
      }
    };

    const timer = setTimeout(calc, 500); // Debounce
    return () => clearTimeout(timer);
  }, [form.pickup, form.delivery, form.vehicle, form.service]);

  // Submit Order
  const submit = async (e) => {
    e.preventDefault();
    if (!price) return alert("Impossible de calculer le prix. Vérifiez les codes postaux.");

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Vous devez être connecté.");

    const { error } = await supabase.from('orders').insert({
      client_id: user.id,
      pickup_address: form.pickup,
      pickup_city: form.pickupCity || form.pickup.split(',').find(p => p.trim().match(/^\d{5}\s/))?.trim().split(' ').slice(1).join(' ') || form.pickup.split(',').pop()?.trim(),
      pickup_postal_code: form.pickupPostcode || getPostcode(form.pickup),
      pickup_name: form.pickupName,
      pickup_phone: form.pickupPhone || form.contactPhone,
      pickup_access_code: form.pickupAccessCode,
      delivery_address: form.delivery,
      delivery_city: form.deliveryCity || form.delivery.split(',').find(p => p.trim().match(/^\d{5}\s/))?.trim().split(' ').slice(1).join(' ') || form.delivery.split(',').pop()?.trim(),
      delivery_postal_code: form.deliveryPostcode || getPostcode(form.delivery),
      delivery_name: form.deliveryName,
      vehicle_type: form.vehicle.toLowerCase(),
      service_level: form.service.toLowerCase(),
      status: 'pending_acceptance',
      price_ht: price,
      scheduled_at: form.date && form.pickupTime ? `${form.date}T${form.pickupTime}:00` : null,
      delivery_deadline: form.date && form.deliveryDeadline ? `${form.date}T${form.deliveryDeadline}:00` : null,
      package_type: form.packageType === "Autre" ? (form.packageTypeOther || "Autre") : form.packageType,
      package_description: form.packageDesc || form.packageSize,
      weight: parseFloat(String(form.packageWeight).replace(',', '.')) || null,
      notes: `Entreprise Pick: ${form.pickupName}. Contact Pick: ${form.pickupContact}. Phone Pick: ${form.pickupPhone || form.contactPhone}. Code Enlev: ${form.pickupAccessCode}. Email Enlev: ${form.pickupEmail}. Entreprise Deliv: ${form.deliveryName}. Contact Deliv: ${form.deliveryContact}. Phone Deliv: ${form.deliveryPhone}. Code Dest: ${form.deliveryAccessCode}. Instructions: ${form.pickupInstructions} / ${form.deliveryInstructions}`,
    });

    if (error) {
      alert("Erreur lors de la création: " + error.message);
    } else {
      setOpen(false);
      fetchOrders(); // Refresh list
    }
  };

  const fetchSuggestions = async (query, setSuggestions, setLoading) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      setLoading(true);
      const results = await autocompleteAddress(query);
      const list = results.map(s => ({
        label: s.full,
        city: s.city,
        postcode: s.postcode,
        street: s.street
      }));
      setSuggestions(list);
    } catch (err) {
      console.error("Autocomplete error:", err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900">Mes Expéditions 📦</h1>
          <p className="mt-2 text-base font-medium text-slate-500">Gérez vos livraisons professionnelles en temps réel.</p>
        </div>
        <button onClick={() => setOpen(true)} className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
          Nouvelle commande
        </button>
      </header>

      {/* Modal Creation */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 backdrop-blur-sm">
          <div className="w-full max-w-5xl rounded-3xl bg-white p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Créer une commande</h2>
              <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-slate-100 transition-colors">✕</button>
            </div>

            <form onSubmit={submit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Pickup Block */}
                <div className="relative group">
                  <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                      📍 Point d'enlèvement
                    </h3>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Entreprise / Nom</label>
                          <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white" placeholder="Ex: Bureau Paris" value={form.pickupName} onChange={(e) => setForm({ ...form, pickupName: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact sur place</label>
                          <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white" placeholder="Ex: Jean" value={form.pickupContact} onChange={(e) => setForm({ ...form, pickupContact: e.target.value })} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Téléphone</label>
                          <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white" placeholder="01..." value={form.pickupPhone} onChange={(e) => setForm({ ...form, pickupPhone: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Code, Étage, Instructions</label>
                          <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white" placeholder="Bât. A, 2ème étage..." value={form.pickupInstructions} onChange={(e) => setForm({ ...form, pickupInstructions: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-1 relative">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Adresse</label>
                        <div className="flex gap-2">
                          <input
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white"
                            placeholder="Saisissez l'adresse..."
                            value={form.pickup}
                            onChange={(e) => {
                              const val = e.target.value;
                              setForm({ ...form, pickup: val, pickupCity: "", pickupPostcode: "" });
                              fetchSuggestions(val, setPickupSuggestions, setLoadingPickup);
                            }}
                          />
                          <button type="button" onClick={() => { setFavTarget("pickup"); setFavOpen(true); }} className="px-3 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300">★</button>
                        </div>
                        {pickupSuggestions.length > 0 && (
                          <div className="absolute z-30 mt-1 w-full rounded-xl border border-slate-100 bg-white p-2 shadow-xl">
                            {pickupSuggestions.map((s, i) => (
                              <button key={i} type="button" className="w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-slate-50"
                                onClick={() => {
                                  const city = s.city || s.label.split(",")[0];
                                  setForm({ ...form, pickup: s.label, pickupCity: city, pickupPostcode: s.postcode });
                                  setPickupSuggestions([]);
                                }}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Block */}
                <div className="relative group">
                  <div className="rounded-2xl bg-blue-50/30 p-5 border border-blue-100">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                      🏁 Destination
                    </h3>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Société / Nom</label>
                          <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white" placeholder="Ex: Client B" value={form.deliveryName} onChange={(e) => setForm({ ...form, deliveryName: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact réception</label>
                          <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white" placeholder="Ex: Marie" value={form.deliveryContact} onChange={(e) => setForm({ ...form, deliveryContact: e.target.value })} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Téléphone</label>
                          <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white" placeholder="06..." value={form.deliveryPhone} onChange={(e) => setForm({ ...form, deliveryPhone: e.target.value })} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Code, Étage, Instructions</label>
                          <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white" placeholder="Bât. B, code 1234..." value={form.deliveryInstructions} onChange={(e) => setForm({ ...form, deliveryInstructions: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-1 relative">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Adresse</label>
                        <div className="flex gap-2">
                          <input
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white"
                            placeholder="Saisissez l'adresse..."
                            value={form.delivery}
                            onChange={(e) => {
                              const val = e.target.value;
                              setForm({ ...form, delivery: val, deliveryCity: "", deliveryPostcode: "" });
                              fetchSuggestions(val, setDeliverySuggestions, setLoadingDelivery);
                            }}
                          />
                          <button type="button" onClick={() => { setFavTarget("delivery"); setFavOpen(true); }} className="px-3 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300">★</button>
                        </div>
                        {deliverySuggestions.length > 0 && (
                          <div className="absolute z-30 mt-1 w-full rounded-xl border border-slate-100 bg-white p-2 shadow-xl">
                            {deliverySuggestions.map((s, i) => (
                              <button key={i} type="button" className="w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-slate-50"
                                onClick={() => {
                                  const city = s.city || s.label.split(",")[0];
                                  setForm({ ...form, delivery: s.label, deliveryCity: city, deliveryPostcode: s.postcode });
                                  setDeliverySuggestions([]);
                                }}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="grid gap-4 md:grid-cols-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date</label>
                  <input type="date" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Départ</label>
                  <input type="time" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white" value={form.pickupTime} onChange={(e) => setForm({ ...form, pickupTime: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Deadline</label>
                  <input type="time" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white" value={form.deliveryDeadline} onChange={(e) => setForm({ ...form, deliveryDeadline: e.target.value })} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Véhicule</label>
                  <select className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })}>
                    {VEHICLES.map(v => <option key={v} value={v.toLowerCase()}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Formule</label>
                  <div className={`mt-1 w-full rounded-xl px-3 py-2 text-sm font-bold uppercase border bg-white ${form.service === 'super' ? 'text-rose-600 border-rose-100' : form.service === 'exclu' ? 'text-blue-600 border-blue-100' : 'text-emerald-600 border-emerald-100'}`}>
                    {form.service || 'Normal'}
                  </div>
                </div>
              </div>

              {/* Package Details */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nature & Dimensions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white font-medium"
                      value={form.packageType}
                      onChange={(e) => setForm({ ...form, packageType: e.target.value })}
                    >
                      {["Pli", "Colis", "Palette", "Sac", "Matériel", "Autre"].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white"
                      value={form.packageWeight}
                      onChange={(e) => setForm({ ...form, packageWeight: e.target.value })}
                    >
                      <option value="" disabled>Poids (kg)</option>
                      {Array.from({ length: 30 }, (_, i) => i + 1).map(w => (
                        <option key={w} value={w}>{w} kg</option>
                      ))}
                      <option value="+30">+ de 30 kg</option>
                    </select>
                  </div>
                  <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white" placeholder="Contenu (ex: Documents d'audit)" value={form.packageDesc} onChange={(e) => setForm({ ...form, packageDesc: e.target.value })} />
                </div>
              </div>

              {/* Footer / Price */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Prix estimé HT</div>
                  <div className="flex items-center gap-2 mt-1">
                    {calculatingPrice ? (
                      <Loader2 className="animate-spin text-slate-400" size={24} />
                    ) : price !== null ? (
                      <span className="text-3xl font-bold text-slate-900">{Number(price).toFixed(2)}€</span>
                    ) : (
                      <span className="text-sm text-slate-400 italic">En attente des adresses...</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setOpen(false)} className="px-6 py-3 rounded-full font-bold text-slate-500 hover:bg-slate-100 transition-colors">Annuler</button>
                  <button type="submit" disabled={!price} className="px-8 py-3 rounded-full bg-slate-900 text-white font-bold shadow-lg hover:bg-slate-800 disabled:opacity-50 transition-all">
                    Confirmer la commande
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Address Book Modal */}
      {favOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Carnet d'adresses</h3>
              <button onClick={() => setFavOpen(false)} className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900">✕</button>
            </div>

            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-4 focus:ring-slate-100"
              placeholder="Rechercher une adresse..."
              value={favQuery}
              onChange={e => setFavQuery(e.target.value)}
              autoFocus
            />

            <div className="space-y-3">
              {loadingAddresses ? (
                <div className="text-center py-8 text-slate-400">Chargement...</div>
              ) : addresses.filter(a => a.name.toLowerCase().includes(favQuery.toLowerCase()) || a.address_line.toLowerCase().includes(favQuery.toLowerCase())).length === 0 ? (
                <div className="text-center py-8 text-slate-400 italic">Aucune adresse trouvée.</div>
              ) : (
                addresses
                  .filter(a => a.name.toLowerCase().includes(favQuery.toLowerCase()) || a.address_line.toLowerCase().includes(favQuery.toLowerCase()))
                  .map(addr => (
                    <button
                      key={addr.id}
                      onClick={() => {
                        if (favTarget === 'pickup') {
                          setForm({ ...form, pickup: addr.address_line, pickupCity: addr.city, pickupPostcode: addr.postal_code, pickupName: addr.name });
                        } else {
                          setForm({ ...form, delivery: addr.address_line, deliveryCity: addr.city, deliveryPostcode: addr.postal_code, deliveryName: addr.name });
                        }
                        setFavOpen(false);
                      }}
                      className="w-full text-left p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all group"
                    >
                      <div className="font-bold text-slate-900 flex items-center justify-between">
                        {addr.name}
                        <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded-lg group-hover:bg-white">{addr.city}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 truncate">{addr.address_line}</div>
                    </button>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* List Orders */}
      <div className="space-y-4">
        {loadingOrders ? (
          <div className="text-center py-10 text-slate-400">Chargement des commandes...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10 text-slate-400 bg-white rounded-[2rem] border border-dashed border-slate-200">
            Aucune commande pour le moment.
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              onClick={() => navigate(`/dashboard-client/orders/${order.id}`, { state: { order } })}
              className="group relative flex w-full cursor-pointer items-center justify-between overflow-hidden rounded-[1.5rem] bg-white p-5 text-left shadow-sm transition-all hover:shadow-md hover:scale-[1.01]"
            >
              <div className="flex items-center gap-4">
                <div className={`grid h-10 w-10 place-items-center rounded-full transition-colors ${statusColor(order.status)}`}>
                  {order.status === 'delivered' ? <Truck size={18} /> : <Clock size={18} />}
                </div>
                <div>
                  <div className="font-bold text-slate-900 leading-none">
                    {order.pickup_city || 'Départ'} → {order.delivery_city || 'Arrivée'}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
                    #{order.id.slice(0, 8)} • {new Date(order.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="text-xs text-slate-400 truncate max-w-[250px]">
                  {order.pickup_address.split(',')[0]} → {order.delivery_address.split(',')[0]}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-slate-900">{(Number(order.price_ht) * 1.2).toFixed(2)}€</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">TTC</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`hidden sm:inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${statusColor(order.status)}`}>
                    {clientStatusLabel(order)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        import("../lib/pdfGenerator").then(m => m.generateOrderPdf(order, profile || {}));
                      }}
                      className="flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-bold text-white shadow-sm ring-1 ring-slate-900 transition-all hover:bg-white hover:text-slate-900 active:scale-95"
                    >
                      <Truck size={12} />
                      <span>PDF BC</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
