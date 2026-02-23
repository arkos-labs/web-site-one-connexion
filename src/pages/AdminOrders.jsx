import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Search, X } from "lucide-react";
import AdminOrdersStats from "../components/admin/orders/AdminOrdersStats";
import AdminOrdersHeader from "../components/admin/orders/AdminOrdersHeader";
import AdminOrderModals from "../components/admin/orders/AdminOrderModals";
import AdminOrdersHistory from "../components/admin/orders/AdminOrdersHistory";
import AdminOrdersKanban from "../components/admin/orders/AdminOrdersKanban";
import useAdminOrdersManager from "../hooks/useAdminOrdersManager";

export default function AdminOrders() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState("dispatch"); // dispatch | history

  const {
    loading,
    drivers,
    clients,
    activeOrders,
    historyOrders,
    kanbanList,
    historyFiltered,
    decisionOpen,
    setDecisionOpen,
    reason,
    setReason,
    dispatchOpen,
    setDispatchOpen,
    dispatchDriver,
    setDispatchDriver,
    dispatchNote,
    setDispatchNote,
    query,
    setQuery,
    isSearching,
    setIsSearching,
    statusFilter,
    derived,
    openDecision,
    openDispatch,
    confirmDecision,
    confirmDispatch,
    exportCsv
  } = useAdminOrdersManager(searchParams);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-slate-400" size={32} /></div>;

  return (
    <div className="space-y-8 pb-20">
      <AdminOrdersHeader view={view} setView={setView} exportCsv={exportCsv} />

      {/* Stats Bar */}
      <AdminOrdersStats activeOrders={activeOrders} historyOrders={historyOrders} />

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView("dispatch")}
              className={`rounded-full px-4 py-2 text-xs font-bold ${view === "dispatch" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
            >
              Dispatch
            </button>
            <button
              onClick={() => setView("history")}
              className={`rounded-full px-4 py-2 text-xs font-bold ${view === "history" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
            >
              Terminées / Refusées
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              {query || isSearching ? (
                <div className="relative animate-fadeIn">
                  <input
                    autoFocus
                    className="w-48 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-4 focus:ring-slate-100"
                    placeholder="Rechercher..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onBlur={() => !query && setIsSearching(false)}
                  />
                  {query && (
                    <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsSearching(true)}
                  className="rounded-full bg-slate-50 border border-slate-100 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Search size={18} />
                </button>
              )}
            </div>

            {view === "history" && (
              <>
                <button onClick={exportCsv} className="rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white">Exporter CSV</button>
                {[{ label: "Toutes", status: "Tous" }, { label: "Terminées", status: "delivered" }, { label: "Refusées", status: "cancelled" }].map(({ label, status }) => (
                  <button
                    key={status}
                    onClick={() => setSearchParams({ status })}
                    className={`rounded-full px-4 py-2 text-xs font-bold ${statusFilter === status ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
                  >
                    {label}
                  </button>
                ))}
                <div className="text-xs text-slate-500">{historyFiltered.length} commandes</div>
              </>
            )}

            {view === "dispatch" && (
              <div className="text-xs text-slate-500">{kanbanList.length} commandes actives</div>
            )}
          </div>
        </div>

        {view === "history" ? (
          <AdminOrdersHistory
            query={query}
            setQuery={setQuery}
            statusFilter={statusFilter}
            setSearchParams={setSearchParams}
            historyFiltered={historyFiltered}
            clients={clients}
            navigate={navigate}
          />
        ) : (
          <AdminOrdersKanban
            kanbanList={kanbanList}
            navigate={navigate}
            drivers={drivers}
            openDecision={openDecision}
            openDispatch={openDispatch}
            derived={derived}
          />
        )}
      </div>

      <AdminOrderModals
        decisionOpen={decisionOpen}
        setDecisionOpen={setDecisionOpen}
        reason={reason}
        setReason={setReason}
        confirmDecision={confirmDecision}
        dispatchOpen={dispatchOpen}
        setDispatchOpen={setDispatchOpen}
        dispatchDriver={dispatchDriver}
        setDispatchDriver={setDispatchDriver}
        drivers={drivers}
        dispatchNote={dispatchNote}
        setDispatchNote={setDispatchNote}
        confirmDispatch={confirmDispatch}
      />
    </div>
  );
}




