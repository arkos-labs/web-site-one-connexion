import { useState } from "react";
import { UniversalModal } from "@/components/ui/UniversalModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/useProfile";
import { createThread } from "@/services/messaging";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface NewMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onMessageSent: (threadId: string) => void;
}

export const NewMessageModal = ({ isOpen, onClose, onMessageSent }: NewMessageModalProps) => {
    const { profile } = useProfile();
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !content.trim()) return;

        if (!profile?.id) {
            toast.error("Profil utilisateur introuvable. Veuillez vous reconnecter.");
            return;
        }

        setIsSubmitting(true);
        try {
            const thread = await createThread(
                profile.id,
                subject,
                'general',
                content,
                'client'
            );

            toast.success("Message envoyé avec succès");
            onMessageSent(thread.id);
            onClose();
            setSubject("");
            setContent("");
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Erreur lors de l'envoi du message");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <UniversalModal
            isOpen={isOpen}
            onClose={onClose}
            title="Nouveau message"
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
                        className="bg-[#FFCC00] text-black hover:bg-[#FFCC00]/90 font-medium"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Envoyer le message
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
                <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium">
                        Objet du message
                    </Label>
                    <Input
                        id="subject"
                        placeholder="Ex: Question sur ma commande..."
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        className="w-full"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="content" className="text-sm font-medium">
                        Message
                    </Label>
                    <Textarea
                        id="content"
                        placeholder="Votre message..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[150px] resize-none"
                        required
                    />
                </div>
            </form>
        </UniversalModal>
    );
};
