import { CheckCircle, Lock } from "lucide-react";
import { WizardStepId } from "./OrderWizardModal";

interface WizardSidebarProps {
    steps: { id: WizardStepId; label: string; icon: any }[];
    currentStep: WizardStepId;
    completedSteps: WizardStepId[];
    onStepClick: (id: WizardStepId) => void;
}

export const WizardSidebar = ({ steps, currentStep, completedSteps, onStepClick }: WizardSidebarProps) => {
    return (
        <div className="py-4 px-3 space-y-1 h-full flex flex-col justify-center">
            {steps.map((step, index) => {
                const isCompleted = completedSteps.includes(step.id);
                const isCurrent = currentStep === step.id;
                const isLocked = !isCompleted && !isCurrent && index > 0 && !completedSteps.includes(steps[index - 1].id);

                return (
                    <button
                        key={step.id}
                        onClick={() => !isLocked && onStepClick(step.id)}
                        disabled={isLocked}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all duration-200
                            ${isCurrent
                                ? "bg-[#0B1525] text-white shadow-lg ring-1 ring-[#0B1525]"
                                : isCompleted
                                    ? "bg-[#D4AF37]/10 text-[#0B1525] hover:bg-[#D4AF37]/20"
                                    : "text-gray-400 cursor-not-allowed hover:bg-gray-50"
                            }
                        `}
                    >
                        <div className={`
                            w-7 h-7 rounded-md flex items-center justify-center transition-colors shrink-0
                            ${isCurrent
                                ? "bg-[#D4AF37] text-[#0B1525]"
                                : isCompleted
                                    ? "bg-transparent text-[#D4AF37]"
                                    : "bg-gray-100 text-gray-400"
                            }
                        `}>
                            {isCompleted ? (
                                <CheckCircle className="w-4 h-4" />
                            ) : (
                                <step.icon className="w-3.5 h-3.5" />
                            )}
                        </div>

                        <div className="flex-1 truncate">
                            <span className={`text-sm font-medium ${isCurrent ? "font-semibold" : ""}`}>
                                {step.label}
                            </span>
                        </div>

                        {isLocked && <Lock className="w-3 h-3 text-gray-300 shrink-0" />}
                    </button>
                );
            })}
        </div>
    );
};
