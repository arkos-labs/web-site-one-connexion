import { FormuleNew, CalculTarifaireResult } from "@/utils/pricingEngine";

export interface OrderFormData {
    clientId: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    clientCompany: string;
    billingAddress: string;
    billingCity: string;
    billingZip: string;
    pickupAddress: string;
    pickupCity: string;
    pickupPostcode: string;
    pickupName: string;
    pickupContact: string;
    pickupPhone: string;
    pickupInstructions: string;
    deliveryAddress: string;
    deliveryCity: string;
    deliveryPostcode: string;
    deliveryName: string;
    deliveryContact: string;
    deliveryPhone: string;
    deliveryInstructions: string;
    packageType: string;
    packageWeight: string;
    packageDesc: string;
    vehicle: string;
    formula: FormuleNew;
    pickupDate: string;
    pickupTime: string;
    deliveryDeadline: string;
    notes: string;
    pricingResult?: CalculTarifaireResult;
}

export interface CreateOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
}
