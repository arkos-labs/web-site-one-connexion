import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { FileText, Save } from "lucide-react";

interface DocumentManagerProps {
    driverId: string;
}

export function DocumentManager({ driverId }: DocumentManagerProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [licenseNumber, setLicenseNumber] = useState("");

    useEffect(() => {
        fetchDriverDocuments();
    }, [driverId]);

    const fetchDriverDocuments = async () => {
        try {
            const { data, error } = await supabase
                .from('drivers')
                .select('license_number')
                .eq('id', driverId)
                .single();

            if (error) throw error;

            if (data) {
                setLicenseNumber(data.license_number || "");
            }
        } catch (error) {
            console.error("Error fetching documents info:", error);
            toast.error("Erreur lors du chargement des informations documents");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase
                .from('drivers')
                .update({
                    license_number: licenseNumber
                })
                .eq('id', driverId);

            if (error) throw error;
            toast.success("Numéro de permis mis à jour");
        } catch (error: any) {
            console.error("Error saving license:", error);
            toast.error("Erreur lors de l'enregistrement");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="text-center py-4">Chargement...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents & Licences
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                        <Label>Numéro de permis de conduire</Label>
                        <Input
                            value={licenseNumber}
                            onChange={(e) => setLicenseNumber(e.target.value.toUpperCase())}
                            placeholder="Ex: 123456789"
                        />
                        <p className="text-xs text-muted-foreground">
                            Le stockage des fichiers (scans) sera disponible prochainement.
                        </p>
                    </div>

                    <Button type="submit" disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
