import { ReactNode } from "react";
import Header from "@/components/client/Header";
import Footer from "@/components/client/Footer";

interface PublicLayoutProps {
    children: ReactNode;
}

/**
 * Layout public avec Header et Footer uniformes
 * À utiliser pour toutes les pages publiques du site
 */
const PublicLayout = ({ children }: PublicLayoutProps) => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
