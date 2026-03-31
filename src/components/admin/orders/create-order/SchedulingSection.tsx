import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { OrderFormData } from "./types";

interface SchedulingSectionProps {
    orderType: 'immediate' | 'deferred';
    setOrderType: (type: 'immediate' | 'deferred') => void;
    formData: OrderFormData;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SchedulingSection({ orderType, setOrderType, formData, onChange }: SchedulingSectionProps) {
    return (
        <div className="space-y-2 pt-3 border-t">
            <Label className="text-sm font-semibold text-[#0B2D55]">Horaire de prise en charge *</Label>
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setOrderType('immediate')}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${orderType === 'immediate' ? 'bg-[#FFCC00] text-[#0B2D55] shadow-md' : 'bg-white text-gray-700 border-2 border-gray-200'}`}
                >
                    Dès que possible
                </button>
                <button
                    type="button"
                    onClick={() => setOrderType('deferred')}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${orderType === 'deferred' ? 'bg-[#FFCC00] text-[#0B2D55] shadow-md' : 'bg-white text-gray-700 border-2 border-gray-200'}`}
                >
                    Choisir un créneau
                </button>
            </div>

            {orderType === 'deferred' && (
                <div className="grid grid-cols-2 gap-2 mt-2 animate-in fade-in slide-in-from-top-2">
                    <Input type="date" name="pickupDate" value={formData.pickupDate} onChange={onChange} className="bg-white" />
                    <Input type="time" name="pickupTime" value={formData.pickupTime} onChange={onChange} className="bg-white" />
                </div>
            )}
        </div>
    );
}
