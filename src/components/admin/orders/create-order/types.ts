import { FormuleNew, CalculTarifaireResult } from "@/utils/pricingEngine";

export interface OrderFormData {
    clientId: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    clientCompany: string;
    pickupAddress: string;
    pickupCity: string;
    pickupContact: string;
    pickupPhone: string;
    deliveryAddress: string;
    deliveryCity: string;
    deliveryContact: string;
    deliveryPhone: string;
    packageType: string;
    formula: FormuleNew;
    pickupDate: string;
    pickupTime: string;
    notes: string;
    pricingResult?: CalculTarifaireResult;
}

export interface CreateOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
}
