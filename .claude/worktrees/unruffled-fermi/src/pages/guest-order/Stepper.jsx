import { CheckCircle2 } from "lucide-react";

export function Stepper({ currentStep, steps }) {
    return (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm ring-1 ring-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ed5518]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="relative z-10 w-full md:w-auto">
                <h1 className="text-3xl font-black text-slate-900">Commander sans compte</h1>
                <p className="text-sm font-medium text-slate-500 mt-2">Programmez votre expédition en quelques secondes.</p>
            </div>
            <div className="relative z-10 flex w-full md:w-auto items-center justify-between md:gap-10">
                {steps.map((s, i) => {
                    const active = currentStep === i + 1;
                    const passed = currentStep > i + 1;
                    return (
                        <div key={i} className="flex flex-col items-center gap-2 relative">
                            {i < steps.length - 1 && (
                                <div className={`hidden md:block absolute top-[18px] left-[50%] w-[160%] h-[2px] transition-colors duration-500 ${passed ? 'bg-[#ed5518]' : 'bg-slate-100'}`} style={{ transform: 'translateX(20px)' }} />
                            )}
                            <div className={`grid h-10 w-10 place-items-center rounded-2xl font-bold transition-all duration-300 relative z-10
                ${active ? 'bg-[#ed5518] text-white shadow-lg shadow-primary/30 scale-110' : passed ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {passed ? <CheckCircle2 size={20} /> : <s.icon size={20} />}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-[#ed5518]' : passed ? 'text-slate-900' : 'text-slate-400'}`}>
                                {s.title}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
