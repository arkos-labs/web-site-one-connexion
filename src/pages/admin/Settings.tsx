import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, Bell, CreditCard, Save, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { getTariffMetadata, updateMultipleTariffMetadata } from "@/services/settingsService";
import { invalidatePricingConfigCache } from "@/utils/pricingConfigLoader";

const Settings = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Profile State
  const [profileData, setProfileData] = useState({
    email: "",
    full_name: "",
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  // Pricing State
  const [pricingData, setPricingData] = useState({
    bon_value_eur: "5.5",
    supplement_per_km_bons: "0.1",
    night_surcharge_percent: "20",
    weekend_surcharge_percent: "25"
  });

  // Notifications State
  const [notifications, setNotifications] = useState({
    email: true,
    dailyReport: true
  });

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Profile
        if (user) {
          setProfileData({
            email: user.email,
            full_name: (user.profile as any)?.full_name || (user.profile as any)?.first_name + ' ' + (user.profile as any)?.last_name || "Administrateur"
          });
        }

        // Fetch Pricing Settings
        const settings = await getTariffMetadata();
        setPricingData(prev => ({
          ...prev,
          ...settings
        }));

        // Fetch Notifications (Local Storage Fallback)
        const savedNotifs = localStorage.getItem('admin_notifications');
        if (savedNotifs) {
          setNotifications(JSON.parse(savedNotifs));
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Erreur lors du chargement des paramètres");
      }
    };

    fetchData();
  }, [user]);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Update Admin Profile in DB (profiles table)
      if (user?.id) {
        const nameParts = profileData.full_name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        // 1. Update public profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            first_name: firstName,
            last_name: lastName
          })
          .eq('id', user.id);

        if (profileError) throw profileError;

        // 2. Update Auth Metadata (redundancy)
        await supabase.auth.updateUser({
          data: {
            full_name: profileData.full_name,
            first_name: firstName,
            last_name: lastName
          }
        });
      }

      toast.success("Profil mis à jour avec succès");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error("Les nouveaux mots de passe ne correspondent pas");
      return;
    }
    if (passwordData.new.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new
      });

      if (error) throw error;

      setPasswordData({ current: "", new: "", confirm: "" });
      toast.success("Mot de passe mis à jour avec succès");
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast.error("Erreur lors de la mise à jour du mot de passe: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePricing = async () => {
    setIsLoading(true);
    try {
      await updateMultipleTariffMetadata(pricingData);

      // Invalider le cache pour forcer le rechargement
      invalidatePricingConfigCache();

      toast.success("Tarifs mis à jour avec succès");
    } catch (error: any) {
      console.error("Error updating pricing:", error);
      toast.error("Erreur lors de la mise à jour des tarifs");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez vos préférences et la configuration de l'application.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <CreditCard className="mr-2 h-4 w-4" />
            Tarifs
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* PROFIL */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>
                Mettez à jour vos informations de profil administrateur.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium leading-none">Email</label>
                <Input
                  value={profileData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">L'email ne peut pas être modifié ici.</p>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium leading-none">Nom complet</label>
                <Input
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                />
              </div>
              <Button onClick={handleSaveProfile} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enregistrer
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mot de passe</CardTitle>
              <CardDescription>
                Modifiez votre mot de passe de connexion.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium leading-none">Nouveau mot de passe</label>
                <Input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium leading-none">Confirmer le mot de passe</label>
                <Input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                />
              </div>
              <Button onClick={handleUpdatePassword} disabled={isLoading || !passwordData.new} variant="outline">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Mettre à jour le mot de passe
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TARIFS */}
        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration des tarifs</CardTitle>
              <CardDescription>
                Définissez les valeurs globales pour le calcul des prix.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Valeur du Bon (€)</label>
                  <p className="text-xs text-muted-foreground mb-2">Prix en euros pour 1 bon (ex: 5.5)</p>
                  <Input
                    type="number"
                    step="0.1"
                    value={pricingData.bon_value_eur}
                    onChange={(e) => setPricingData({ ...pricingData, bon_value_eur: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Supplément par KM (Bons)</label>
                  <p className="text-xs text-muted-foreground mb-2">Coût en bons par km supplémentaire (ex: 0.1)</p>
                  <Input
                    type="number"
                    step="0.01"
                    value={pricingData.supplement_per_km_bons}
                    onChange={(e) => setPricingData({ ...pricingData, supplement_per_km_bons: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Majoration nuit (%)</label>
                  <Input
                    type="number"
                    value={pricingData.night_surcharge_percent}
                    onChange={(e) => setPricingData({ ...pricingData, night_surcharge_percent: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Majoration week-end (%)</label>
                  <Input
                    type="number"
                    value={pricingData.weekend_surcharge_percent}
                    onChange={(e) => setPricingData({ ...pricingData, weekend_surcharge_percent: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleSavePricing} disabled={isLoading} className="w-full md:w-auto">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Mettre à jour les tarifs
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICATIONS */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Préférences de notification</CardTitle>
              <CardDescription>
                Gérez comment vous souhaitez être notifié.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <label className="text-base font-medium">Notifications par email</label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir un email à chaque nouvelle commande.
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <label className="text-base font-medium">Rapport quotidien</label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir un résumé de l'activité chaque matin.
                  </p>
                </div>
                <Switch
                  checked={notifications.dailyReport}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, dailyReport: checked })}
                />
              </div>
              <Button onClick={() => {
                localStorage.setItem('admin_notifications', JSON.stringify(notifications));
                toast.success("Préférences de notification enregistrées (Local)");
              }}>
                Enregistrer les préférences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div >
  );
};

export default Settings;
