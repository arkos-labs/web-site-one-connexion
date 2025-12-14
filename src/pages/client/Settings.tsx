import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { User as UserIcon, Lock, Bell, Trash2, LogOut, Save, Loader2, Building2, Mail, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Settings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);

  // Form States
  const [profile, setProfile] = useState({
    company_name: "",
    siret: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    billing_address: "",
  });

  const [newEmail, setNewEmail] = useState("");
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailPending, setEmailPending] = useState(false);

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [preferences, setPreferences] = useState({
    email_notif: true,
    sms_notif: true,
    auto_invoice: false,
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch User Data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);

          // Fetch profile from 'clients' table using id (which is the user_id)
          const { data: clientData, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', user.id)
            .single();

          if (clientData) {
            setClientId(clientData.id);
            setProfile({
              company_name: clientData.company_name || "",
              siret: clientData.siret || "",
              first_name: clientData.first_name || "",
              last_name: clientData.last_name || "",
              email: user.email || "",
              phone: clientData.phone || "",
              address: clientData.address || "",
              billing_address: clientData.billing_address || "",
            });
            setPreferences({
              email_notif: clientData.email_notif ?? true,
              sms_notif: clientData.sms_notif ?? true,
              auto_invoice: clientData.auto_invoice ?? false,
            });
          } else {
            setProfile(prev => ({
              ...prev,
              email: user.email || "",
              first_name: user.user_metadata?.first_name || "",
              last_name: user.user_metadata?.last_name || "",
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Handlers
  const handleUpdateProfile = async () => {
    setLoading(true);
    if (!user || !clientId) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger votre profil. Veuillez vous reconnecter.",
      });
      setLoading(false);
      return;
    }

    try {
      const { error: profileError } = await supabase
        .from('clients')
        .update({
          company_name: profile.company_name,
          siret: profile.siret,
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          address: profile.address,
          billing_address: profile.billing_address,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clientId);

      if (profileError) throw profileError;

      toast({
        title: "Succès",
        description: "Vos informations ont été mises à jour.",
        className: "bg-green-50 border-green-200",
      });
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez entrer une adresse email valide.",
      });
      return;
    }

    if (newEmail === user?.email) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Cette adresse email est déjà utilisée.",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) throw error;

      setEmailPending(true);
      setIsEmailDialogOpen(false);
      setNewEmail("");

      toast({
        title: "Email de confirmation envoyé",
        description: `Un email a été envoyé à ${newEmail}. Veuillez cliquer sur le lien pour confirmer le changement.`,
        className: "bg-blue-50 border-blue-200",
      });
    } catch (error: any) {
      console.error("Email update error:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de modifier l'email.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Les nouveaux mots de passe ne correspondent pas.",
      });
      return;
    }

    if (passwords.new.length < 6) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) throw error;

      setPasswords({ current: "", new: "", confirm: "" });
      toast({
        title: "Succès",
        description: "Votre mot de passe a été modifié avec succès.",
        className: "bg-green-50 border-green-200",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: (error as Error).message || "Impossible de modifier le mot de passe.",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePreference = async (key: keyof typeof preferences) => {
    if (!clientId) return;
    const newValue = !preferences[key];
    setPreferences(prev => ({ ...prev, [key]: newValue }));

    try {
      const { error } = await supabase
        .from('clients')
        .update({ [key]: newValue })
        .eq('id', clientId);
      if (error) throw error;
    } catch (error) {
      setPreferences(prev => ({ ...prev, [key]: !newValue }));
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Erreur lors de la sauvegarde.",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    if (!clientId) return;
    try {
      const { error } = await supabase
        .from('clients')
        .update({ status: 'deleted' })
        .eq('id', clientId);

      if (error) throw error;

      await supabase.auth.signOut();
      navigate("/login");
      toast({
        title: "Compte supprimé",
        description: "Votre compte a été supprimé avec succès.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: (error as Error).message || "Impossible de supprimer le compte.",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">
          Paramètres
        </h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles et la sécurité de votre compte.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="general">
            <UserIcon className="h-4 w-4 mr-2" />
            Général
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Sécurité
          </TabsTrigger>
        </TabsList>

        {/* GENERAL TAB */}
        <TabsContent value="general" className="space-y-6">
          {/* Company Information */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informations de l'entreprise
              </CardTitle>
              <CardDescription>Vérifiez les informations de votre entreprise enregistrées.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nom de l'entreprise</Label>
                  <Input
                    id="companyName"
                    value={profile.company_name}
                    onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                    placeholder="Nom de votre entreprise"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siret">SIRET</Label>
                  <Input
                    id="siret"
                    value={profile.siret}
                    onChange={(e) => setProfile({ ...profile, siret: e.target.value })}
                    placeholder="123 456 789 00012"
                    maxLength={14}
                  />
                  <p className="text-xs text-muted-foreground">14 chiffres sans espaces</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse de l'entreprise</Label>
                <Textarea
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="min-h-[80px]"
                  placeholder="Adresse complète de votre entreprise"
                />
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>Mettez à jour vos coordonnées personnelles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={profile.first_name}
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={profile.last_name}
                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email actuel
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-muted"
                    />
                    <Button
                      variant="outline"
                      onClick={() => setIsEmailDialogOpen(true)}
                      className="whitespace-nowrap"
                    >
                      Modifier
                    </Button>
                  </div>
                  {emailPending && (
                    <Alert className="mt-2 bg-amber-50 border-amber-200">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800 text-xs">
                        Changement d'email en attente de confirmation
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingAddress">Adresse de facturation</Label>
                <Textarea
                  id="billingAddress"
                  value={profile.billing_address}
                  onChange={(e) => setProfile({ ...profile, billing_address: e.target.value })}
                  className="min-h-[80px]"
                  placeholder="Si différente de l'adresse de l'entreprise"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="bg-cta text-cta-foreground hover:bg-cta/90"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer les modifications
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Préférences
              </CardTitle>
              <CardDescription>Gérez vos notifications et options automatiques.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notifications Email</Label>
                  <p className="text-sm text-muted-foreground">Recevoir des emails pour les mises à jour importantes.</p>
                </div>
                <Switch
                  checked={preferences.email_notif}
                  onCheckedChange={() => togglePreference('email_notif')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notifications SMS</Label>
                  <p className="text-sm text-muted-foreground">Recevoir des alertes SMS pour le suivi des livraisons.</p>
                </div>
                <Switch
                  checked={preferences.sms_notif}
                  onCheckedChange={() => togglePreference('sms_notif')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Envoi automatique des factures</Label>
                  <p className="text-sm text-muted-foreground">Recevoir automatiquement vos factures par email après chaque paiement.</p>
                </div>
                <Switch
                  checked={preferences.auto_invoice}
                  onCheckedChange={() => togglePreference('auto_invoice')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECURITY TAB */}
        <TabsContent value="security" className="space-y-6">
          {/* Change Password */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Modifier le mot de passe</CardTitle>
              <CardDescription>Changez votre mot de passe pour sécuriser votre compte.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-900">Sécurité</AlertTitle>
                <AlertDescription className="text-blue-800 text-sm">
                  Votre nouveau mot de passe doit contenir au moins 6 caractères. Pour plus de sécurité, utilisez une combinaison de lettres, chiffres et caractères spéciaux.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    placeholder="Minimum 6 caractères"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    placeholder="Retapez le mot de passe"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <Button
                  onClick={handleUpdatePassword}
                  disabled={loading || !passwords.new || !passwords.confirm}
                  className="bg-cta text-cta-foreground hover:bg-cta/90"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Lock className="mr-2 h-4 w-4" />
                  Mettre à jour le mot de passe
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Logout */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Session</CardTitle>
              <CardDescription>Déconnectez-vous de votre compte sur cet appareil.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
                <LogOut className="mr-2 h-4 w-4" />
                Se déconnecter
              </Button>
            </CardContent>
          </Card>

          {/* Delete Account */}
          <Card className="border-red-100 bg-red-50/30 shadow-sm">
            <CardHeader>
              <CardTitle className="text-red-600">Zone de danger</CardTitle>
              <CardDescription>La suppression de votre compte est irréversible.</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer mon compte
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Êtes-vous absolument sûr ?</DialogTitle>
                    <DialogDescription>
                      Cette action ne peut pas être annulée. Cela supprimera définitivement votre compte et toutes les données associées de nos serveurs.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Annuler</Button>
                    <Button variant="destructive" onClick={handleDeleteAccount}>Confirmer la suppression</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Email Change Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Modifier votre adresse email
            </DialogTitle>
            <DialogDescription>
              Pour des raisons de sécurité, vous devrez confirmer votre nouvelle adresse email.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-900 text-sm font-semibold">Comment ça fonctionne ?</AlertTitle>
              <AlertDescription className="text-blue-800 text-sm space-y-2 mt-2">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Entrez votre nouvelle adresse email</li>
                  <li>Cliquez sur "Envoyer l'email de confirmation"</li>
                  <li>Consultez votre nouvelle boîte email</li>
                  <li>Cliquez sur le lien de confirmation</li>
                  <li>Votre email sera mis à jour automatiquement</li>
                </ol>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="currentEmail">Email actuel</Label>
              <Input
                id="currentEmail"
                type="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newEmail">Nouvelle adresse email *</Label>
              <Input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="nouvelle@email.com"
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEmailDialogOpen(false);
                setNewEmail("");
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleEmailChange}
              disabled={loading || !newEmail}
              className="bg-cta text-cta-foreground hover:bg-cta/90"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Envoyer l'email de confirmation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
