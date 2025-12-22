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
  ArrowUpRight,
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
    ordersToday, // Now acts as "Orders in selected period"
    ordersTodayChange,
    newClientsMonth, // Now acts as "New Clients in selected period"
    newClientsMonthChange,
    activeDrivers,
    totalDrivers,
    revenueToday, // Now acts as "Revenue in selected period"
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
          delivery_type: data.formula, // Using formula as delivery_type based on new logic
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
      title: `Commandes ${periodLabel}`,
      value: loading ? "-" : ordersToday.toString(),
      change: loading ? "-" : `${ordersTodayChange > 0 ? '+' : ''}${ordersTodayChange}%`,
      delta: comparisonLabel,
      icon: Package,
      color: "text-accent-main",
      bgColor: "bg-accent-light",
      path: "/dashboard-admin/commandes",
    },
    {
      title: `Nouveaux clients ${periodLabel}`,
      value: loading ? "-" : newClientsMonth.toString(),
      change: loading ? "-" : `${newClientsMonthChange > 0 ? '+' : ''}${newClientsMonthChange}%`,
      delta: comparisonLabel,
      icon: Users,
      color: "text-success",
      bgColor: "bg-success-light",
      path: "/dashboard-admin/clients",
    },
    {
      title: "Chauffeurs actifs",
      value: loading ? "-" : `${activeDrivers}/${totalDrivers}`,
      change: loading ? "-" : `${totalDrivers > 0 ? Math.round((activeDrivers / totalDrivers) * 100) : 0}%`,
      delta: "temps réel",
      icon: Truck,
      color: "text-warning",
      bgColor: "bg-warning-light",
      path: "/dashboard-admin/chauffeurs",
    },
    {
      title: `Revenus ${periodLabel}`,
      value: loading ? "-" : `${revenueToday.toLocaleString('fr-FR')}€`,
      change: loading ? "-" : `${revenueTodayChange > 0 ? '+' : ''}${revenueTodayChange}%`,
      delta: comparisonLabel,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
      path: "/dashboard-admin/statistiques",
    },
  ];

  const quickActions = [
    {
      title: "Carte en direct",
      description: "Voir les chauffeurs",
      icon: MapPin,
      color: "text-accent-main",
      bgColor: "bg-accent-light",
      path: "/dashboard-admin/carte-live",
    },
    {
      title: "Statistiques",
      description: "Rapports détaillés",
      icon: BarChart3,
      color: "text-primary",
      bgColor: "bg-primary/10",
      path: "/dashboard-admin/statistiques",
    },
    {
      title: "Messagerie",
      description: "Support client",
      icon: MessageSquare,
      color: "text-cta",
      bgColor: "bg-cta/10",
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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary mb-2">
            Tableau de bord Admin
          </h1>
          <p className="text-muted-foreground">
            Vue d'ensemble des opérations - Temps réel
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Filters */}
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
            <Select value={filterPeriod} onValueChange={(v: any) => setFilterPeriod(v)}>
              <SelectTrigger className="w-[140px] border-0 focus:ring-0 h-9">
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
              <div className="flex items-center gap-2 px-2 border-l">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-8 w-32 text-xs"
                />
                <span className="text-muted-foreground text-xs">-</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-8 w-32 text-xs"
                />
              </div>
            )}
          </div>

          <Button variant="cta" size="lg" className="gap-2 h-11" onClick={handleOpenModal}>
            <Plus className="h-5 w-5" />
            Créer une commande
          </Button>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainMetrics.map((metric, index) => (
          <Card
            key={index}
            className="p-6 shadow-soft border-0 hover:shadow-medium transition-all duration-300 animate-fade-in-up cursor-pointer"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => navigate(metric.path)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg ${metric.bgColor} flex items-center justify-center`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{metric.title}</p>
              <p className="text-2xl font-semibold text-primary mb-2">
                {metric.value}
              </p>
              <div className="flex items-center gap-2 text-xs font-medium">
                <Badge
                  variant="outline"
                  className={`${metric.change.startsWith("+")
                    ? "text-success border-success"
                    : metric.change.startsWith("-")
                      ? "text-destructive border-destructive"
                      : "text-primary border-primary"
                    }`}
                >
                  {metric.change}
                </Badge>
                <span className="text-muted-foreground">{metric.delta}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <Card
            key={index}
            className="p-6 shadow-soft border-0 hover:shadow-strong cursor-pointer transition-all duration-300 group"
            onClick={() => navigate(action.path)}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg ${action.bgColor} flex items-center justify-center flex-shrink-0`}>
                <action.icon className={`h-6 w-6 ${action.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-primary mb-1 group-hover:text-accent-main transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-accent-main group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </div>
          </Card>
        ))}
      </div>

      {/* Operational Flow */}
      <Card className="p-6 shadow-soft border-0">
        <h2 className="text-lg font-semibold text-primary mb-6">
          Flux opérationnel
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {operationalFlow.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 transition-all hover:shadow-medium cursor-pointer ${item.status === "warning"
                ? "border-warning bg-warning-light"
                : item.status === "info"
                  ? "border-info bg-info-light"
                  : item.status === "success"
                    ? "border-success bg-success-light"
                    : "border-destructive bg-destructive/10"
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <item.icon
                  className={`h-5 w-5 ${item.status === "warning"
                    ? "text-warning"
                    : item.status === "info"
                      ? "text-info"
                      : item.status === "success"
                        ? "text-success"
                        : "text-destructive"
                    }`}
                />
                <span className="text-2xl font-display font-bold text-primary">
                  {item.count}
                </span>
              </div>
              <p className="text-sm font-semibold text-primary">{item.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* 2 Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Team Status */}
        <Card className="p-6 shadow-soft border-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-primary">
              État de l'équipe
            </h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard-admin/chauffeurs')}>
              Voir tout
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
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {member.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-primary">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={
                        member.available
                          ? "text-success border-success"
                          : "text-warning border-warning"
                      }
                    >
                      {member.deliveries} livraison{member.deliveries > 1 ? 's' : ''}
                    </Badge>
                    <div
                      className={`w-3 h-3 rounded-full ${member.available ? "bg-success" : "bg-warning"
                        }`}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* System Alerts */}
        <Card className="p-6 shadow-soft border-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-primary">
              Alertes système
            </h2>
            {alerts.length > 0 && (
              <Badge variant="outline" className="text-warning border-warning">
                {alerts.length} alerte{alerts.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50 text-success" />
                <p>Aucune alerte - Tout va bien !</p>
              </div>
            ) : (
              alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${alert.type === "warning"
                    ? "border-warning bg-warning-light"
                    : alert.type === "info"
                      ? "border-info bg-info-light"
                      : "border-success bg-success-light"
                    }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-primary mb-1">{alert.title}</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        {alert.message}
                      </p>
                      <p className="text-xs text-muted-foreground">{alert.time}</p>
                    </div>
                    <AlertTriangle
                      className={`h-5 w-5 flex-shrink-0 ${alert.type === "warning"
                        ? "text-warning"
                        : alert.type === "info"
                          ? "text-info"
                          : "text-success"
                        }`}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card className="p-6 shadow-soft border-0">
        <h2 className="text-lg font-semibold text-primary mb-6">
          Activité récente
        </h2>
        <AdminActivityTimeline limit={5} />
      </Card>

      {/* Key Points */}
      <Card className="p-6 shadow-soft border-0">
        <h2 className="text-lg font-semibold text-primary mb-6">
          Points d'attention
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {keyPoints.map((point, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-border hover:shadow-medium transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <Badge
                  variant="outline"
                  className={`${point.color} border-current`}
                >
                  {point.impact}
                </Badge>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-accent-main group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
              </div>
              <h3 className="font-semibold text-primary mb-2">{point.title}</h3>
              <p className="text-sm text-muted-foreground">
                <Clock className="h-3 w-3 inline mr-1" />
                {point.time}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Admin Order Creation Modal */}
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
