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
        <div className="py-6 px-4 space-y-2">
            {steps.map((step, index) => {
                const isCompleted = completedSteps.includes(step.id);
                const isCurrent = currentStep === step.id;
                const isLocked = !isCompleted && !isCurrent && index > 0 && !completedSteps.includes(steps[index - 1].id);

                return (
                    <button
                        key={step.id}
                        onClick={() => !isLocked && onStepClick(step.id)}
                        disabled={isLocked}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200
                            ${isCurrent
                                ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100"
                                : isCompleted
                                    ? "text-gray-700 hover:bg-gray-50"
                                    : "text-gray-400 cursor-not-allowed"
                            }
                        `}
                    >
                        <div className={`
                            w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                            ${isCurrent
                                ? "bg-blue-100 text-blue-600"
                                : isCompleted
                                    ? "bg-green-100 text-green-600"
                                    : "bg-gray-100 text-gray-400"
                            }
                        `}>
                            {isCompleted ? (
                                <CheckCircle className="w-5 h-5" />
                            ) : (
                                <step.icon className="w-4 h-4" />
                            )}
                        </div>

                        <div className="flex-1">
                            <span className={`text-sm font-medium ${isCurrent ? "font-semibold" : ""}`}>
                                {step.label}
                            </span>
                        </div>

                        {isLocked && <Lock className="w-3 h-3 text-gray-300" />}
                    </button>
                );
            })}
        </div>
    );
};
