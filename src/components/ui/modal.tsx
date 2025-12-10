import { UniversalModal } from "./UniversalModal";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl" | "full";
    showCloseButton?: boolean;
}

export const Modal = ({
    isOpen,
    onClose,
    title = "",
    children,
    size = "md",
    showCloseButton = true,
}: ModalProps) => {
    return (
        <UniversalModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size={size}
        >
            <div className="overflow-y-auto h-full">
                {children}
            </div>
        </UniversalModal>
    );
};
