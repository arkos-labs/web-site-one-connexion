import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UniversalModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    size?: "sm" | "md" | "lg" | "xl" | "full";
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
    disableScroll?: boolean;
}

export const UniversalModal = ({
    isOpen,
    onClose,
    title,
    size = "xl",
    children,
    footer,
    className,
    disableScroll = false
}: UniversalModalProps) => {
    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: "max-w-md",
        md: "max-w-2xl",
        lg: "max-w-4xl",
        xl: "max-w-7xl",
        full: "max-w-[98vw]"
    };

    return createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
            <div
                className={cn(
                    "bg-white rounded-xl shadow-xl w-full flex flex-col animate-scale-in relative z-[1000] m-4",
                    // If disableScroll is true, we likely want a fixed height (or max height) to allow internal scrolling
                    // If false, we want auto height up to max
                    disableScroll ? "h-[90vh]" : "max-h-[95vh] h-auto",
                    sizeClasses[size],
                    className
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0 bg-white z-10">
                    <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="hover:bg-gray-100 rounded-full"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Main Content Area */}
                <div className={cn(
                    disableScroll ? "flex flex-1 overflow-hidden" : "overflow-y-auto p-0"
                )}>
                    {children}
                </div>

                {/* Footer (Optional) */}
                {footer && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50 flex justify-end gap-2 shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};
