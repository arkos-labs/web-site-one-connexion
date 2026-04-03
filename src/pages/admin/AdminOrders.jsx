import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Search, X, Download, Truck, MapPin, Bell, CheckCircle2, Package } from "lucide-react";
import AdminOrdersStats from "../../components/admin/orders/AdminOrdersStats";
import AdminOrderModals from "../../components/admin/orders/AdminOrderModals";
import AdminOrdersHistory from "../../components/admin/orders/AdminOrdersHistory";
import AdminOrdersKanban from "../../components/admin/orders/AdminOrdersKanban";
import useAdminOrdersManager from "../../hooks/useAdminOrdersManager";
import AdminPageHeader from "../../components/admin/AdminPageHeader";

export default function AdminOrders() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState("dispatch");

  const {
    loading, drivers, clients,
    activeOrders, historyOrders, kanbanList, historyFiltered,
    decisionOpen, setDecisionOpen, reason, setReason,
    dispatchOpen, setDispatchOpen, dispatchDriver, setDispatchDriver,
    dispatchNote, setDispatchNote,
    query, setQuery, isSearching, setIsSearching,
    statusFilter, derived,
    openDecision, openDispatch, confirmDecision, confirmDispatch, forceComplete, exportCsv
  } = useAdminOrdersManager(searchParams);

  if (loading) return null;

  const TABS = [
    { id: "dispatch", label: "Dispatch", icon: MapPin, count: kanbanList.length },
    { id: "history", label: "Terminées / Refusées", icon: CheckCircle2, count: historyOrders.length },
  ];

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader
        title="Gestion des Missions"
        subtitle="Dispatch en temps réel et historique de toutes les commandes."
        badge={{ label: "Actives", count: activeOrders.length }}
        actions={
          <>
            {view === "history" && (
              <button
                onClick={exportCsv}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
              >
                <Download size={16} /> Exporter CSV
              </button>
            )}
            <div className="flex bg-slate-100 rounded-2xl p-1.5 gap-1">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-200 ${view === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <tab.icon size={13} className={view === tab.id ? "text-[#ed5518]" : ""} />
                  {tab.label}
                  <span className={`h-4 min-w-4 px-1 rounded-full text-[9px] font-black grid place-items-center ${view === tab.id ? 'bg-[#ed5518] text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </>
        }
      />

      {/* Stats Bar */}
      <AdminOrdersStats activeOrders={activeOrders} historyOrders={historyOrders} />

      {/* Main Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/40 flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className={`relative transition-all duration-300 ${isSearching || query ? 'w-64' : 'w-auto'}`}>
            {query || isSearching ? (
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    autoFocus
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                    placeholder="Rechercher…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onBlur={() => !query && setIsSearching(false)}
                  />
                  {query && (
                    <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsSearching(true)}
                className="flex items-center gap-2 rounded-xl bg-slate-100 border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-500 hover:bg-white hover:text-slate-700 transition-all"
              >
                <Search size={14} /> Rechercher
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {view === "history" && (
              <>
                {[{ label: "Toutes", status: "Tous" }, { label: "Terminées", status: "delivered" }, { label: "Refusées", status: "cancelled" }].map(({ label, status }) => (
                  <button
                    key={status}
                    onClick={() => setSearchParams({ status })}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${statusFilter === status ? "bg-slate-900 text-white shadow" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  >
                    {label}
                  </button>
                ))}
              </>
            )}
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {view === "dispatch" ? `${kanbanList.length} active(s)` : `${historyFiltered.length} commande(s)`}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[500px]">
          {view === "history" ? (
            <AdminOrdersHistory
              query={query} setQuery={setQuery}
              statusFilter={statusFilter} setSearchParams={setSearchParams}
              historyFiltered={historyFiltered} clients={clients} navigate={navigate}
            />
          ) : (
            <AdminOrdersKanban
              kanbanList={kanbanList} navigate={navigate} drivers={drivers}
              openDecision={openDecision} openDispatch={openDispatch} derived={derived}
              forceComplete={forceComplete}
            />
          )}
        </div>
      </div>

      <AdminOrderModals
        decisionOpen={decisionOpen} setDecisionOpen={setDecisionOpen}
        reason={reason} setReason={setReason} confirmDecision={confirmDecision}
        dispatchOpen={dispatchOpen} setDispatchOpen={setDispatchOpen}
        dispatchDriver={dispatchDriver} setDispatchDriver={setDispatchDriver}
        drivers={drivers} dispatchNote={dispatchNote} setDispatchNote={setDispatchNote}
        confirmDispatch={confirmDispatch}
      />
    </div>
  );
}

