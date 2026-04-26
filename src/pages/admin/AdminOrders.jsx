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
    { id: "dispatch", label: "Missions Actives", icon: MapPin, count: kanbanList.length },
    { id: "all", label: "Toutes les Missions", icon: Package, count: allMissions.length, badge: claimCount },
    { id: "history", label: "Historique (Finies/Refusées)", icon: CheckCircle2, count: historyOrders.length },
  ];

  return (
    <div className="space-y-12 pb-32">
      <AdminPageHeader
        title="Gestion des Missions"
        subtitle="Dispatch en temps réel et historique exhaustif des flux."
        badge={{ label: "Opérations", count: kanbanList.length }}
        actions={
          <>
            {view === "all" && (
              <button
                onClick={exportCsv}
                className="group flex items-center gap-3 rounded-2xl border border-noir/5 bg-white px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-noir shadow-sm hover:bg-noir hover:text-white transition-all"
              >
                <Download size={16} strokeWidth={1.5} />
                <span>Exporter Global</span>
              </button>
            )}
            <div className="flex bg-cream p-1.5 rounded-2xl border border-noir/5 gap-1 shadow-inner">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  className={`flex items-center gap-3 px-6 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${view === tab.id ? 'bg-noir text-white shadow-xl' : 'text-noir/40 hover:text-noir'}`}
                >
                  <tab.icon size={14} strokeWidth={view === tab.id ? 2.5 : 1.5} />
                  <span>{tab.label}</span>
                  <div className="flex items-center gap-2">
                    {tab.badge > 0 && (
                      <span className="h-5 min-w-[20px] rounded-full bg-[#ed5518] text-white text-[9px] font-bold grid place-items-center shadow-[0_0_15px_rgba(237,85,24,0.3)]">
                        {tab.badge}
                      </span>
                    )}
                    <span className={`h-5 min-w-[20px] rounded-full text-[9px] font-bold grid place-items-center ${view === tab.id ? 'bg-white/20 text-white' : 'bg-noir/10 text-noir/40'}`}>
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
          className="bg-white border border-red-500/10 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between cursor-pointer hover:shadow-2xl transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-red-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center gap-8 relative z-10">
            <div className="h-20 w-20 rounded-[2rem] bg-red-500 text-white flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(239,68,68,0.4)] group-hover:scale-110 transition-transform duration-500">
              <AlertTriangle size={36} strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-3xl font-display italic text-noir leading-none mb-3">Conflits détectés en flux.</div>
              <p className="text-[10px] font-bold text-red-600/60 uppercase tracking-[0.4em]">
                {claimCount} Litige(s) en attente de résolution prioritaire.
              </p>
            </div>
          </div>
          <button className="mt-8 md:mt-0 px-10 py-5 rounded-2xl bg-noir text-white text-[10px] font-bold uppercase tracking-[0.3em] group-hover:bg-[#ed5518] transition-all shadow-xl">
            Ouvrir la médiation
          </button>
        </div>
      )}

      {/* Content Area */}
      <div className="min-h-[600px]">
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
          <div className="bg-white rounded-[3rem] border border-noir/5 shadow-sm overflow-hidden p-8 md:p-12">
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

