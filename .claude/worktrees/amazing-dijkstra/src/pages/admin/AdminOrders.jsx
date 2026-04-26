import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Search, X, Download, Truck, MapPin, Bell, CheckCircle2, Package, AlertTriangle } from "lucide-react";
import AdminOrdersStats from "../../components/admin/orders/AdminOrdersStats";
import AdminOrderModals from "../../components/admin/orders/AdminOrderModals";
import AdminOrdersHistory from "../../components/admin/orders/AdminOrdersHistory";
import AdminOrdersKanban from "../../components/admin/orders/AdminOrdersKanban";
import AdminOrdersAll from "../../components/admin/orders/AdminOrdersAll";
import useAdminOrdersManager from "../../hooks/useAdminOrdersManager";
import AdminPageHeader from "../../components/admin/AdminPageHeader";

export default function AdminOrders() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState("dispatch");

  const {
    loading, drivers, clients, orders,
    activeOrders, historyOrders, kanbanList, historyFiltered, allMissions,
    decisionOpen, setDecisionOpen, reason, setReason,
    dispatchOpen, setDispatchOpen, dispatchDriver, setDispatchDriver,
    dispatchNote, setDispatchNote,
    query, setQuery, isSearching, setIsSearching,
    statusFilter, derived,
    openDecision, openDispatch, confirmDecision, confirmDispatch, forceComplete, exportCsv
  } = useAdminOrdersManager(searchParams);

  if (loading) return null;

  const claimCount = (orders || []).filter(o => o.claim_status === 'pending').length;

  const TABS = [
    { id: "dispatch", label: "Missions du Jour", icon: MapPin, count: kanbanList.length },
    { id: "all", label: "Toutes les Missions", icon: Package, count: allMissions.length, badge: claimCount },
    { id: "history", label: "Historique (Finies/Refusées)", icon: CheckCircle2, count: historyOrders.length },
  ];

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHeader
        title="Gestion des Missions"
        subtitle="Dispatch en temps réel et historique de toutes les commandes."
        badge={{ label: "Opérations", count: kanbanList.length }}
        actions={
          <>
            {view === "all" && (
              <button
                onClick={exportCsv}
                className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
              >
                <Download size={16} /> Exporter Global
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
                  <div className="flex items-center gap-1">
                    {tab.badge > 0 && (
                      <span className="h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black grid place-items-center animate-bounce">
                        {tab.badge}
                      </span>
                    )}
                    <span className={`h-4 min-w-4 px-1 rounded-full text-[9px] font-black grid place-items-center ${view === tab.id ? 'bg-[#ed5518] text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {tab.count}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </>
        }
      />

      {/* Stats Bar */}
      <AdminOrdersStats activeOrders={activeOrders} historyOrders={historyOrders} />

      {/* Persistent Litige Alert if any pending */}
      {claimCount > 0 && (
        <div 
          onClick={() => setView("all")}
          className="bg-rose-50 border border-rose-100 rounded-[2rem] p-6 flex items-center justify-between cursor-pointer hover:bg-rose-100 transition-all group shadow-lg shadow-rose-500/5 animate-in slide-in-from-top-4 duration-500"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white animate-pulse shadow-lg shadow-rose-500/20">
              <AlertTriangle size={24} />
            </div>
            <div>
              <div className="text-sm font-black text-rose-900 uppercase tracking-widest leading-none mb-1">Attention : {claimCount} Litige(s) en attente</div>
              <p className="text-[11px] font-bold text-rose-600/80 uppercase">Des clients ont signalé des problèmes sur leurs commandes.</p>
            </div>
          </div>
          <button className="px-6 py-2.5 rounded-xl bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest group-hover:bg-rose-700 transition-all">
            Voir les dossiers
          </button>
        </div>
      )}

      {/* Content Area - Tables handle their own headers now for "History" and "All" */}
      <div className="min-h-[500px]">
        {view === "history" ? (
          <AdminOrdersHistory
            query={query} setQuery={setQuery}
            statusFilter={statusFilter} setSearchParams={setSearchParams}
            historyFiltered={historyFiltered} clients={clients} navigate={navigate}
          />
        ) : view === "all" ? (
          <AdminOrdersAll
            allMissions={allMissions} clients={clients} navigate={navigate}
          />
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <AdminOrdersKanban
              kanbanList={kanbanList} navigate={navigate} drivers={drivers}
              openDecision={openDecision} openDispatch={openDispatch} derived={derived}
              forceComplete={forceComplete}
            />
          </div>
        )}
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

