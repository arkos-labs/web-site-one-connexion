import { CheckCircle2 } from "lucide-react";

export function CourseStepper({ step, steps }: { step: number, steps: any[] }) {
  return (
    <div className="flex items-center justify-between gap-4 md:gap-16 max-w-2xl mx-auto py-4">
      {steps.map((s, i) => {
        const active = step === i + 1;
        const passed = step > i + 1;
        return (
          <div key={i} className="flex-1 flex items-center group relative">
            <div className="flex flex-col items-center gap-3 relative z-10">
              <div className={`
                h-10 w-10 flex items-center justify-center rounded-full border-2 transition-all duration-500
                ${active ? 'border-[#ed5518] bg-[#ed5518] text-white shadow-lg shadow-orange-500/20 scale-110' :
                  passed ? 'border-noir bg-noir text-white' :
                    'border-noir/10 bg-white text-noir/30'}
              `}>
                {passed ? <CheckCircle2 size={16} /> : <s.icon size={16} />}
              </div>
              <span className={`
                text-[9px] font-bold uppercase tracking-[0.3em] font-body transition-colors duration-300
                ${active ? 'text-noir' : passed ? 'text-noir/60' : 'text-noir/20'}
              `}>
                {s.title}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 mx-4 h-[1px] bg-noir/10 relative -top-3">
                <div
                  className="absolute inset-0 bg-[#ed5518] transition-all duration-700 ease-in-out"
                  style={{ width: passed ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
