import { Button } from "@/components/ui/button";
import { RefreshCcw, Home, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ErrorPageProps {
    error?: Error | null;
    resetErrorBoundary?: () => void;
}

const ErrorPage = ({ error, resetErrorBoundary }: ErrorPageProps) => {
    const handleReload = () => {
        if (resetErrorBoundary) {
            resetErrorBoundary();
        } else {
            window.location.reload();
        }
    };

    const handleGoHome = () => {
        window.location.href = "/";
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
            <div className="max-w-md w-full text-center">
                <div className="mb-8 flex justify-center">
                    <div className="h-24 w-24 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                        <AlertTriangle className="h-12 w-12 text-red-600" />
                    </div>
                </div>

                <h1 className="text-3xl font-serif font-bold text-[#0B1525] mb-4">
                    Oups, une erreur est survenue
                </h1>

                <p className="text-gray-500 mb-8 leading-relaxed">
                    Nous sommes désolés, mais une erreur inattendue s'est produite.
                    Nos équipes techniques ont été notifiées.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        onClick={handleReload}
                        className="bg-[#D4AF37] hover:bg-[#b5952f] text-white px-8"
                    >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Réessayer
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleGoHome}
                        className="border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Retour à l'accueil
                    </Button>
                </div>

                {error && (
                    <div className="mt-12 text-left">
                        <details className="cursor-pointer border border-gray-200 rounded-lg bg-white p-4">
                            <summary className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2 select-none">
                                Détails techniques (Développeur)
                            </summary>
                            <pre className="text-xs text-red-500 bg-red-50 p-4 rounded overflow-auto max-h-40">
                                {error.toString()}
                                {error.stack && `\n\n${error.stack}`}
                            </pre>
                        </details>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ErrorPage;
