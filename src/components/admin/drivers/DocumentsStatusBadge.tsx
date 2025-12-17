import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, FileX } from 'lucide-react';

interface DocumentsStatusBadgeProps {
    documentsStatus?: 'not_submitted' | 'pending' | 'validated' | 'rejected' | null;
}

export function DocumentsStatusBadge({ documentsStatus }: DocumentsStatusBadgeProps) {
    switch (documentsStatus) {
        case 'validated':
            return (
                <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Validé
                </Badge>
            );
        case 'pending':
            return (
                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 gap-1">
                    <Clock className="h-3 w-3" />
                    En attente
                </Badge>
            );
        case 'rejected':
            return (
                <Badge className="bg-red-100 text-red-700 border-red-200 gap-1">
                    <XCircle className="h-3 w-3" />
                    Refusé
                </Badge>
            );
        case 'not_submitted':
        default:
            return (
                <Badge variant="outline" className="text-muted-foreground gap-1">
                    <FileX className="h-3 w-3" />
                    Non soumis
                </Badge>
            );
    }
}
