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
    case "pending": return "En attente";
    case "assigned": return driverId ? "Dispatchée" : "Acceptée";
    case "picked_up": return "En cours";
    case "delivered": return "Terminée";
    case "cancelled": return "Annulée";
    default: return status || "—";
  }
}

function statusColor(status) {
  switch (status) {
    case "pending": return "bg-slate-100 text-slate-600";
    case "assigned": return "bg-blue-50 text-blue-600";
    case "picked_up": return "bg-orange-50 text-orange-600";
    case "delivered": return "bg-emerald-50 text-emerald-600";
    case "cancelled": return "bg-red-50 text-red-600";
    default: return "bg-slate-100";
  }
}

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
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
    date: "",
    pickupTime: "",
    deliveryDeadline: "",
    vehicle: "moto", // lowercase for DB enum
    service: "normal", // lowercase
    packageType: "Pli",
    packageDesc: "",
    packageWeight: "",
    packageSize: "",
    contactPhone: "",
    accessCode: "",
    pickupCity: "",
    deliveryCity: "",
    pickupPostcode: "",
    deliveryPostcode: "",
    pickupName: "",
    deliveryName: "",
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
      delivery_address: form.delivery,
      delivery_city: form.deliveryCity || form.delivery.split(',').find(p => p.trim().match(/^\d{5}\s/))?.trim().split(' ').slice(1).join(' ') || form.delivery.split(',').pop()?.trim(),
      delivery_postal_code: form.deliveryPostcode || getPostcode(form.delivery),
      delivery_name: form.deliveryName,
      vehicle_type: form.vehicle.toLowerCase(),
      service_level: form.service.toLowerCase(),
      status: 'pending',
      price_ht: price,
      scheduled_at: form.date && form.pickupTime ? `${form.date}T${form.pickupTime}:00` : null,
      delivery_deadline: form.date && form.deliveryDeadline ? `${form.date}T${form.deliveryDeadline}:00` : null,
      notes: `${form.packageType} - ${form.packageDesc}. Poids: ${form.packageWeight}. Dims: ${form.packageSize}. Contact: ${form.contactPhone}. Code: ${form.accessCode}`,
    });

    if (error) {
      alert("Erreur lors de la création: " + error.message);
    } else {
      setOpen(false);
      fetchOrders(); // Refresh list
      // Reset form...
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
    <div>
      <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <header className="mb-6">
          <h1 className="text-4xl font-extrabold text-slate-900">Mes Expéditions 📦</h1>
          <p className="mt-2 text-base font-medium text-slate-500">Suivez l'acheminement de vos colis en .</p>
        </header>
        <button onClick={() => setOpen(true)} className="rounded-full bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">Nouvelle commande</button>
      </header>

      {/* Modal Creation */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 backdrop-blur-sm">
          <div className="w-full max-w-5xl rounded-3xl bg-white p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Créer une commande</h2>
              <button onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-slate-100 transition-colors">✕</button>
            </div>

            <form onSubmit={submit} className="grid gap-6">
              {/* Adresses */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="relative group">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 group-focus-within:text-slate-900 transition-colors">Nom / Entreprise (Enlèvement)</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold mb-3 focus:outline-none focus:ring-2 focus:ring-slate-100"
                    placeholder="Ex: Siège Social"
                    value={form.pickupName}
                    onChange={(e) => setForm({ ...form, pickupName: e.target.value })}
                  />
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 group-focus-within:text-slate-900 transition-colors">Adresse d'enlèvement</label>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                      placeholder="Ex: 12 Rue de la Paix, 75008 Paris"
                      value={form.pickup}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm({ ...form, pickup: val, pickupCity: "", pickupPostcode: "" });
                        fetchSuggestions(val, setPickupSuggestions, setLoadingPickup);
                      }}
                    />
                    <button type="button" onClick={() => { setFavTarget("pickup"); setFavOpen(true); }} className="p-3 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors">★</button>
                  </div>
                  {pickupSuggestions.length > 0 && (
                    <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-100 bg-white p-2 shadow-xl ring-1 ring-slate-100">
                      {pickupSuggestions.map((s, i) => (
                        <button key={i} type="button" className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50 transition-colors"
                          onClick={() => {
                            const city = s.city || s.label.split(",").find(p => p.trim().match(/^\d{5}\s/))?.trim().split(' ').slice(1).join(' ') || s.label.split(",")[0];
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

                <div className="relative group">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 group-focus-within:text-slate-900 transition-colors">Nom / Contact (Livraison)</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold mb-3 focus:outline-none focus:ring-2 focus:ring-slate-100"
                    placeholder="Ex: Client X"
                    value={form.deliveryName}
                    onChange={(e) => setForm({ ...form, deliveryName: e.target.value })}
                  />
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 group-focus-within:text-slate-900 transition-colors">Adresse de livraison</label>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                      placeholder="Ex: Tour First, 92800 Puteaux"
                      value={form.delivery}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm({ ...form, delivery: val, deliveryCity: "", deliveryPostcode: "" });
                        fetchSuggestions(val, setDeliverySuggestions, setLoadingDelivery);
                      }}
                    />
                    <button type="button" onClick={() => { setFavTarget("delivery"); setFavOpen(true); }} className="p-3 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors">★</button>
                  </div>
                  {deliverySuggestions.length > 0 && (
                    <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-100 bg-white p-2 shadow-xl ring-1 ring-slate-100">
                      {deliverySuggestions.map((s, i) => (
                        <button key={i} type="button" className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50 transition-colors"
                          onClick={() => {
                            const city = s.city || s.label.split(",").find(p => p.trim().match(/^\d{5}\s/))?.trim().split(' ').slice(1).join(' ') || s.label.split(",")[0];
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

              {/* Options */}
              <div className="grid gap-4 md:grid-cols-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Date</label>
                  <input type="date" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Heure enlévement</label>
                  <input type="time" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" value={form.pickupTime} onChange={(e) => setForm({ ...form, pickupTime: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Heure livraison max</label>
                  <input type="time" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" value={form.deliveryDeadline} onChange={(e) => setForm({ ...form, deliveryDeadline: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Véhicule</label>
                  <select className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })}>
                    {VEHICLES.map(v => <option key={v} value={v.toLowerCase()}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Formule (Auto)</label>
                  <div className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm font-bold bg-slate-50 uppercase ${form.service === 'super' ? 'text-rose-600 border-rose-100' : form.service === 'exclu' ? 'text-blue-600 border-blue-100' : 'text-emerald-600 border-emerald-100'}`}>
                    {form.service || '—'}
                  </div>
                </div>
              </div>

              {/* Details Colis */}
              <div className="grid gap-4 md:grid-cols-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Détails colis</label>
                  <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Description (ex: Documents)" value={form.packageDesc} onChange={(e) => setForm({ ...form, packageDesc: e.target.value })} />
                  <div className="flex gap-2">
                    <input className="w-1/2 rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Poids (kg)" value={form.packageWeight} onChange={(e) => setForm({ ...form, packageWeight: e.target.value })} />
                    <input className="w-1/2 rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Dims (cm)" value={form.packageSize} onChange={(e) => setForm({ ...form, packageSize: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Accès & Contact</label>
                  <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Téléphone contact" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
                  <input className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Digicode, étage..." value={form.accessCode} onChange={(e) => setForm({ ...form, accessCode: e.target.value })} />
                </div>
              </div>

              {/* Price Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Prix estimé HT</div>
                  <div className="flex items-center gap-2 mt-1">
                    {calculatingPrice ? (
                      <Loader2 className="animate-spin text-slate-400" size={24} />
                    ) : price !== null ? (
                      <span className="text-3xl font-bold text-slate-900">{Number(price).toFixed(2)}€</span>
                    ) : (
                      <span className="text-sm text-slate-400 italic">Saisissez les adresses...</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setOpen(false)} className="px-6 py-3 rounded-full font-bold text-slate-500 hover:bg-slate-100 transition-colors">Annuler</button>
                  <button type="submit" disabled={!price} className="px-8 py-3 rounded-full bg-slate-900 text-white font-bold shadow-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
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

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Generate BC logic
                        const profileDetails = {
                          company: "One paris",
                          contact_person: "giko",
                          email: "cherkinicolas@gmail.com",
                          phone: "0797545037",
                        };
                        import("../lib/pdfGenerator").then(m => m.generateOrderPdf(order, profileDetails));
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
