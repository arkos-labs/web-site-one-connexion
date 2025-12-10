import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "default" | "destructive" | "success";
    isLoading?: boolean;
}

export const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = "Confirmer",
    cancelLabel = "Annuler",
    variant = "default",
    isLoading = false,
}: ConfirmDialogProps) => {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
        } finally {
            setLoading(false);
        }
    };

    const Icon = variant === "destructive" ? AlertTriangle : variant === "success" ? CheckCircle : AlertTriangle;
    const iconColor = variant === "destructive" ? "text-destructive" : variant === "success" ? "text-success" : "text-warning";
    const iconBg = variant === "destructive" ? "bg-destructive/10" : variant === "success" ? "bg-success/10" : "bg-warning/10";

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`h-6 w-6 ${iconColor}`} />
                        </div>
                        <div>
                            <DialogTitle className="text-lg">{title}</DialogTitle>
                            <DialogDescription className="mt-1">{description}</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} disabled={loading || isLoading}>
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={variant === "destructive" ? "destructive" : variant === "success" ? "default" : "default"}
                        onClick={handleConfirm}
                        disabled={loading || isLoading}
                        className={variant === "success" ? "bg-success hover:bg-success/90" : ""}
                    >
                        {(loading || isLoading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

interface CancelOrderDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void | Promise<void>;
    orderReference: string;
}

export const CancelOrderDialog = ({
    isOpen,
    onClose,
    onConfirm,
    orderReference,
}: CancelOrderDialogProps) => {
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm(reason || "Aucune raison fournie");
            setReason("");
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setReason("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                            <XCircle className="h-6 w-6 text-destructive" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg">Annuler la commande</DialogTitle>
                            <DialogDescription className="mt-1">
                                Voulez-vous vraiment annuler la commande <strong>{orderReference}</strong> ?
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-4">
                    <label className="block text-sm font-medium mb-2">
                        Raison de l'annulation
                    </label>
                    <Textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Entrez la raison de l'annulation..."
                        className="min-h-[100px]"
                    />
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={handleClose} disabled={loading}>
                        Retour
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Confirmer l'annulation
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
