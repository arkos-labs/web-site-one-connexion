import { OrderFormData } from "../OrderWizardModal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Zap, Clock, Calendar, ArrowRight, ArrowLeft } from "lucide-react";

interface StepScheduleProps {
    formData: OrderFormData;
    updateFormData: (data: Partial<OrderFormData>) => void;
    onNext: () => void;
    onBack: () => void;
}

export const StepSchedule = ({ formData, updateFormData, onNext, onBack }: StepScheduleProps) => {
    const handleScheduleTypeChange = (type: 'immediate' | 'deferred') => {
        if (type === 'immediate') {
            updateFormData({
                scheduleType: 'immediate',
                pickupDate: '',
                pickupTime: ''
            });
        } else {
            updateFormData({ scheduleType: 'deferred' });
        }
    };

    const isValid =
        formData.scheduleType === 'immediate' ||
        (formData.scheduleType === 'deferred' && formData.pickupDate && formData.pickupTime);

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-[#0B1525] font-serif">Horaires</h2>
                <p className="text-gray-500">Quand devons-nous effectuer l'enlèvement ?</p>
            </div>

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => handleScheduleTypeChange('immediate')}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${formData.scheduleType === 'immediate'
                            ? 'border-[#D4AF37] bg-[#0B1525] ring-1 ring-[#D4AF37] shadow-lg'
                            : 'border-gray-100 hover:border-[#D4AF37]/50 hover:bg-gray-50'
                            }`}
                    >
                        <Zap className={`h-6 w-6 mb-3 ${formData.scheduleType === 'immediate' ? 'text-[#D4AF37]' : 'text-gray-400'
                            }`} />
                        <div className={`font-semibold ${formData.scheduleType === 'immediate' ? 'text-white' : 'text-[#0B1525]'}`}>
                            Dès que possible
                        </div>
                        <div className={`text-xs mt-1 ${formData.scheduleType === 'immediate' ? 'text-gray-300' : 'text-gray-500'}`}>
                            Coursier assigné immédiatement
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleScheduleTypeChange('deferred')}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${formData.scheduleType === 'deferred'
                            ? 'border-[#D4AF37] bg-[#0B1525] ring-1 ring-[#D4AF37] shadow-lg'
                            : 'border-gray-100 hover:border-[#D4AF37]/50 hover:bg-gray-50'
                            }`}
                    >
                        <Calendar className={`h-6 w-6 mb-3 ${formData.scheduleType === 'deferred' ? 'text-[#D4AF37]' : 'text-gray-400'
                            }`} />
                        <div className={`font-semibold ${formData.scheduleType === 'deferred' ? 'text-white' : 'text-[#0B1525]'}`}>
                            Choisir un créneau
                        </div>
                        <div className={`text-xs mt-1 ${formData.scheduleType === 'deferred' ? 'text-gray-300' : 'text-gray-500'}`}>
                            Date et heure spécifiques
                        </div>
                    </button>
                </div>

                {formData.scheduleType === 'deferred' && (
                    <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2">
                        <div>
                            <Label htmlFor="pickupDate" className="mb-2 block text-gray-700">Date</Label>
                            <Input
                                id="pickupDate"
                                type="date"
                                value={formData.pickupDate}
                                onChange={(e) => updateFormData({ pickupDate: e.target.value })}
                                min={new Date().toISOString().split('T')[0]}
                                className="focus-visible:ring-[#0B1525]"
                            />
                        </div>
                        <div>
                            <Label htmlFor="pickupTime" className="mb-2 block text-gray-700">Heure</Label>
                            <Input
                                id="pickupTime"
                                type="time"
                                value={formData.pickupTime}
                                onChange={(e) => updateFormData({ pickupTime: e.target.value })}
                                className="focus-visible:ring-[#0B1525]"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="pt-6 flex justify-between">
                <Button variant="outline" onClick={onBack} className="hover:bg-gray-50 text-gray-600">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                </Button>
                <Button
                    onClick={onNext}
                    disabled={!isValid}
                    className="bg-[#D4AF37] hover:bg-[#b5952f] text-white px-8 shadow-md hover:shadow-lg transition-all"
                >
                    Suivant
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
