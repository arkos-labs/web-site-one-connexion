import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { OrderFormData } from "./types";
import { Clock, Zap, Calendar } from "lucide-react";

interface SchedulingSectionProps {
    orderType: 'immediate' | 'deferred';
    setOrderType: (type: 'immediate' | 'deferred') => void;
    formData: OrderFormData;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function SchedulingSection({ orderType, setOrderType, formData, onChange }: SchedulingSectionProps) {
    return (
        <div className="space-y-6 pt-8 border-t border-slate-100">
            <div className="flex items-center gap-4 px-2">
                <div className="h-10 w-10 rounded-2xl bg-sky-500/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-sky-500" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none mb-1">Planification</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Quand devons-nous intervenir ? *</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 px-2">
                <button
                    type="button"
                    onClick={() => setOrderType('immediate')}
                    className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all duration-300 ${
                        orderType === 'immediate' 
                        ? 'bg-slate-900 border-slate-900 shadow-xl shadow-slate-900/20' 
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                >
                    <Zap className={`h-6 w-6 mb-2 ${orderType === 'immediate' ? 'text-[#ed5518]' : 'text-slate-400'}`} />
                    <span className={`text-xs font-black uppercase tracking-widest ${orderType === 'immediate' ? 'text-white' : 'text-slate-900'}`}>Immédiat</span>
                </button>
                <button
                    type="button"
                    onClick={() => setOrderType('deferred')}
                    className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all duration-300 ${
                        orderType === 'deferred' 
                        ? 'bg-slate-900 border-slate-900 shadow-xl shadow-slate-900/20' 
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                >
                    <Calendar className={`h-6 w-6 mb-2 ${orderType === 'deferred' ? 'text-[#ed5518]' : 'text-slate-400'}`} />
                    <span className={`text-xs font-black uppercase tracking-widest ${orderType === 'deferred' ? 'text-white' : 'text-slate-900'}`}>Programmé</span>
                </button>
            </div>

            {orderType === 'deferred' && (
                <div className="grid grid-cols-2 gap-4 px-2 animate-in zoom-in-95 duration-500">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Date</Label>
                        <Input 
                            type="date" name="pickupDate" value={formData.pickupDate} onChange={onChange} 
                            className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 px-5 font-bold focus:bg-white transition-all focus:ring-sky-500/10 text-sm" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Heure</Label>
                        <Input 
                            type="time" name="pickupTime" value={formData.pickupTime} onChange={onChange} 
                            className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 px-5 font-bold focus:bg-white transition-all focus:ring-sky-500/10 text-sm" 
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
