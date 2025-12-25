import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderWizardModal } from "@/components/admin/orders/wizard/OrderWizardModal";
import { AdminActivityTimeline } from "@/components/admin/AdminActivityTimeline";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Users,
  Truck,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight,
  Plus,
  MessageSquare,
  MapPin,
  BarChart3,
  Loader2,
  Calendar,
} from "lucide-react";

import { useAdminStats, StatsFilter } from "@/hooks/useAdminStats";
import { supabase } from "@/lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const DashboardAdmin = () => {
  const navigate = useNavigate();

  // Filter State
  const [filterPeriod, setFilterPeriod] = useState<StatsFilter['period']>('day');
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const {
    ordersToday,
    ordersTodayChange,
    newClientsMonth,
    newClientsMonthChange,
    activeDrivers,
    totalDrivers,
    revenueToday,
    revenueTodayChange,
    ordersByStatus,
    teamMembers,
    alerts,
    keyPoints,
    loading
  } = useAdminStats({
    period: filterPeriod,
    startDate: filterPeriod === 'custom' ? startDate : undefined,
    endDate: filterPeriod === 'custom' ? endDate : undefined
  });

  // Dynamic Labels
  const getPeriodLabel = () => {
    const labels: Record<string, string> = {
      day: "aujourd'hui",
      week: "cette semaine",
      month: "ce mois",
      year: "cette année",
      all: "total",
      custom: "période",
    };
    return labels[filterPeriod] || "période";
  };

  const getComparisonLabel = () => {
    const labels: Record<string, string> = {
      day: "vs hier",
      week: "vs sem. dern.",
      month: "vs mois dern.",
      year: "vs an. dern.",
      all: "vs -",
      custom: "vs préc.",
    };
    return labels[filterPeriod] || "vs préc.";
  };

  const periodLabel = getPeriodLabel();
  const comparisonLabel = getComparisonLabel();

  // ---------- Modal & Order Logic ----------
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleOrderSubmit = async (data: any) => {
    try {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const reference = `CMD-${dateStr}-${randomSuffix}`;

      const { error } = await supabase
        .from('orders')
        .insert({
          reference: reference,
          client_id: data.clientId,
          pickup_address: data.pickupAddress,
          delivery_address: data.deliveryAddress,
          delivery_type: data.formula,
          status: 'pending_acceptance',
          price: data.pricingResult?.totalEuros || 0,
          pickup_time: data.pickupDate ? new Date(`${data.pickupDate}T${data.pickupTime || '00:00'}`).toISOString() : null,
          notes: data.notes
        });

      if (error) throw error;

      toast.success('Commande créée avec succès');
      handleCloseModal();
    } catch (e: any) {
      console.error("Error creating order:", e);
      toast.error(e.message || 'Erreur inattendue lors de la création de la commande');
    }
  };

  const mainMetrics = [
    {
      title: `Commandes (${periodLabel})`,
      value: loading ? "-" : ordersToday.toString(),
      change: loading ? "-" : `${ordersTodayChange > 0 ? '+' : ''}${ordersTodayChange}%`,
      delta: comparisonLabel,
      icon: Package,
      color: "text-[#D4AF37]",
      bgColor: "bg-[#D4AF37]/10",
      path: "/dashboard-admin/commandes",
    },
    {
      title: `Clients (${periodLabel})`,
      value: loading ? "-" : newClientsMonth.toString(),
      change: loading ? "-" : `${newClientsMonthChange > 0 ? '+' : ''}${newClientsMonthChange}%`,
      delta: comparisonLabel,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      path: "/dashboard-admin/clients",
    },
    {
      title: "Chauffeurs actifs",
      value: loading ? "-" : `${activeDrivers}/${totalDrivers}`,
      change: loading ? "-" : `${totalDrivers > 0 ? Math.round((activeDrivers / totalDrivers) * 100) : 0}%`,
      delta: "temps réel",
      icon: Truck,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      path: "/dashboard-admin/chauffeurs",
    },
    {
      title: `Revenus (${periodLabel})`,
      value: loading ? "-" : `${revenueToday.toLocaleString('fr-FR')}€`,
      change: loading ? "-" : `${revenueTodayChange > 0 ? '+' : ''}${revenueTodayChange}%`,
      delta: comparisonLabel,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      path: "/dashboard-admin/statistiques",
    },
  ];

  const quickActions = [
    {
      title: "Carte en direct",
      description: "Voir les chauffeurs",
      icon: MapPin,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      path: "/dashboard-admin/carte-live",
    },
    {
      title: "Statistiques",
      description: "Rapports détaillés",
      icon: BarChart3,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      path: "/dashboard-admin/statistiques",
    },
    {
      title: "Messagerie",
      description: "Support client",
      icon: MessageSquare,
      color: "text-[#D4AF37]",
      bgColor: "bg-[#D4AF37]/10",
      path: "/dashboard-admin/messagerie",
    },
  ];

  const operationalFlow = [
    {
      label: "En attente",
      count: loading ? 0 : ordersByStatus.pending,
      status: "warning",
      icon: Clock,
    },
    {
      label: "En cours",
      count: loading ? 0 : ordersByStatus.in_progress,
      status: "info",
      icon: Truck,
    },
    {
      label: "Livrées",
      count: loading ? 0 : ordersByStatus.delivered,
      status: "success",
      icon: CheckCircle,
    },
    {
      label: "Annulées",
      count: loading ? 0 : ordersByStatus.cancelled,
      status: "danger",
      icon: XCircle,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-[#0B1525] mb-2 tracking-tight">
            Administration
          </h1>
          <p className="text-gray-500">
            Vue d'ensemble des opérations et performances
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Filters */}
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
            <Select value={filterPeriod} onValueChange={(v: any) => setFilterPeriod(v)}>
              <SelectTrigger className="w-[140px] border-0 focus:ring-0 h-9 font-medium text-gray-700">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
                <SelectItem value="all">Tout</SelectItem>
                <SelectItem value="custom">Personnalisé</SelectItem>
              </SelectContent>
            </Select>

            {filterPeriod === 'custom' && (
              <div className="flex items-center gap-2 px-2 border-l border-gray-100">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-8 w-32 text-xs border-0 focus-visible:ring-0"
                />
                <span className="text-gray-400 text-xs">-</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-8 w-32 text-xs border-0 focus-visible:ring-0"
                />
              </div>
            )}
          </div>

          <Button
            className="bg-[#D4AF37] hover:bg-[#b5952f] text-white font-medium px-4 h-11 shadow-md hover:shadow-lg transition-all rounded-xl"
            onClick={handleOpenModal}
          >
            <Plus className="h-5 w-5 mr-2" />
            Créer une commande
          </Button>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainMetrics.map((metric, index) => (
          <Card
            key={index}
            className="p-6 border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-white group cursor-pointer"
            onClick={() => navigate(metric.path)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${metric.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
              {metric.change && (
                <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${metric.change.includes('+') ? 'bg-green-100 text-green-700' : metric.change.includes('-') ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                  {metric.change.includes('+') ? <TrendingUp className="w-3 h-3 mr-1" /> : null}
                  {metric.change}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">{metric.title}</h3>
              <p className="text-3xl font-bold text-[#0B1525]">{metric.value}</p>
              <p className="text-xs text-gray-400 mt-1">{metric.delta}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Operational Flow */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-serif font-bold text-[#0B1525] mb-6">Flux opérationnel</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {operationalFlow.map((item, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer group flex flex-col items-center text-center ${item.status === "warning"
                    ? "border-yellow-100 bg-yellow-50/50 hover:bg-yellow-50"
                    : item.status === "info"
                      ? "border-blue-100 bg-blue-50/50 hover:bg-blue-50"
                      : item.status === "success"
                        ? "border-green-100 bg-green-50/50 hover:bg-green-50"
                        : "border-red-100 bg-red-50/50 hover:bg-red-50"
                    }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${item.status === "warning" ? "bg-yellow-100 text-yellow-600" :
                      item.status === "info" ? "bg-blue-100 text-blue-600" :
                        item.status === "success" ? "bg-green-100 text-green-600" :
                          "bg-red-100 text-red-600"
                    }`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-3xl font-bold text-[#0B1525] mb-1">
                    {item.count}
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team Status */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-serif font-bold text-[#0B1525]">
                État de l'équipe
              </h2>
              <Button variant="ghost" size="sm" className="text-[#D4AF37] hover:bg-[#D4AF37]/10" onClick={() => navigate('/dashboard-admin/chauffeurs')}>
                Voir tout <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {teamMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Truck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun chauffeur actif</p>
                </div>
              ) : (
                teamMembers.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#D4AF37]/20 transition-all group bg-gray-50/50 hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#0B1525] flex items-center justify-center text-white font-serif font-bold text-sm">
                        {member.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-[#0B1525] group-hover:text-[#D4AF37] transition-colors">{member.name}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">{member.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={`border-0 ${member.available
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {member.deliveries} livraison{member.deliveries > 1 ? 's' : ''}
                      </Badge>
                      <div
                        className={`w-2.5 h-2.5 rounded-full ring-2 ring-white ${member.available ? "bg-green-500" : "bg-yellow-500"
                          }`}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-lg font-serif font-bold text-[#0B1525]">Accès rapide</h2>
            <div className="grid gap-4">
              {quickActions.map((action, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#D4AF37]/30 transition-all cursor-pointer group flex items-center gap-4"
                  onClick={() => navigate(action.path)}
                >
                  <div className={`w-10 h-10 rounded-lg ${action.bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm group-hover:text-[#D4AF37] transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs text-gray-500">{action.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-serif font-bold text-[#0B1525]">
                Alertes système
              </h2>
              {alerts.length > 0 && (
                <Badge className="bg-red-100 text-red-600 hover:bg-red-200 border-0">
                  {alerts.length}
                </Badge>
              )}
            </div>
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-10 w-10 mx-auto mb-3 opacity-50 text-green-500" />
                  <p className="text-sm">Aucune alerte - Tout est stable</p>
                </div>
              ) : (
                alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border border-l-4 ${alert.type === "warning"
                      ? "border-l-yellow-400 border-gray-100 bg-yellow-50/30"
                      : alert.type === "info"
                        ? "border-l-blue-400 border-gray-100 bg-blue-50/30"
                        : "border-l-green-400 border-gray-100 bg-green-50/30"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-[#0B1525] text-sm mb-1">{alert.title}</p>
                        <p className="text-xs text-gray-500 mb-2">
                          {alert.message}
                        </p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">{alert.time}</p>
                      </div>
                      <AlertTriangle
                        className={`h-4 w-4 flex-shrink-0 ${alert.type === "warning"
                          ? "text-yellow-500"
                          : alert.type === "info"
                            ? "text-blue-500"
                            : "text-green-500"
                          }`}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Timeline */}
          <Card className="p-6 shadow-sm border-0">
            <h2 className="text-lg font-serif font-bold text-[#0B1525] mb-6">
              Activité récente
            </h2>
            <AdminActivityTimeline limit={5} />
          </Card>
        </div>
      </div>

      <OrderWizardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleOrderSubmit}
        mode="admin"
      />
    </div>
  );
};

export default DashboardAdmin;
