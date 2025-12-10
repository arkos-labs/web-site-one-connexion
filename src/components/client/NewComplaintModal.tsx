import { useState } from "react";
import { UniversalModal } from "@/components/ui/UniversalModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/useProfile";
import { createComplaint } from "@/services/messaging";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";

interface NewComplaintModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplaintSent: (threadId: string) => void;
}

export const NewComplaintModal = ({ isOpen, onClose, onComplaintSent }: NewComplaintModalProps) => {
    const { profile } = useProfile();
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !description.trim()) return;

        if (!profile?.id) {
            toast.error("Profil utilisateur introuvable. Veuillez vous reconnecter.");
            return;
        }

        setIsSubmitting(true);
        try {
            const thread = await createComplaint(
                profile.id,
                subject,
                description
            );

            toast.success("Réclamation envoyée", {
                description: "Un ticket a été ouvert. Notre équipe va traiter votre demande."
            });
            onComplaintSent(thread.id);
            onClose();
            setSubject("");
            setDescription("");
        } catch (error) {
            console.error("Error sending complaint:", error);
            toast.error("Erreur lors de l'envoi de la réclamation");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <UniversalModal
            isOpen={isOpen}
            onClose={onClose}
            title="Nouvelle Réclamation"
            size="md"
            footer={
                <>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="destructive"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Envoyer la réclamation
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">
                        Utilisez ce formulaire pour signaler un problème avec une commande, un chauffeur ou une facture.
                        Un ticket de support sera créé et suivi par notre équipe.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium">
                        Sujet de la réclamation
                    </Label>
                    <Input
                        id="subject"
                        placeholder="Ex: Problème avec la commande #12345"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        className="w-full"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                        Description détaillée
                    </Label>
                    <Textarea
                        id="description"
                        placeholder="Décrivez le problème rencontré..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-[150px] resize-none"
                        required
                    />
                </div>
            </form>
        </UniversalModal>
    );
};
