// ============================================
// ERROR BOUNDARY COMPONENT
// ============================================
// Composant pour capturer les erreurs React et afficher une UI de fallback
// Avec logging automatique et possibilité de retry

import { Component, ErrorInfo, ReactNode, useState } from 'react';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log l'erreur
        logger.critical('React Error Boundary caught an error', error, {
            componentStack: errorInfo.componentStack,
            errorBoundary: true,
        }, 'ErrorBoundary');

        // Callback personnalisé
        this.props.onError?.(error, errorInfo);

        // Mettre à jour l'état
        this.setState({
            error,
            errorInfo,
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            // UI de fallback personnalisée
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // UI de fallback par défaut
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
                    <Card className="max-w-2xl w-full p-8 shadow-2xl">
                        <div className="text-center space-y-6">
                            {/* Icône d'erreur */}
                            <div className="flex justify-center">
                                <div className="bg-red-100 p-6 rounded-full">
                                    <AlertCircle className="h-16 w-16 text-red-600" />
                                </div>
                            </div>

                            {/* Titre */}
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                                    Oups ! Une erreur s'est produite
                                </h1>
                                <p className="text-slate-600">
                                    Nous sommes désolés, quelque chose s'est mal passé.
                                </p>
                            </div>

                            {/* Détails de l'erreur (développement uniquement) */}
                            {import.meta.env.DEV && this.state.error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                                    <p className="font-mono text-sm text-red-800 mb-2">
                                        <strong>Erreur:</strong> {this.state.error.message}
                                    </p>
                                    {this.state.errorInfo && (
                                        <details className="mt-2">
                                            <summary className="cursor-pointer text-red-700 font-semibold">
                                                Stack trace
                                            </summary>
                                            <pre className="mt-2 text-xs text-red-600 overflow-auto max-h-64">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-4 justify-center">
                                <Button
                                    onClick={this.handleReset}
                                    className="flex items-center gap-2"
                                    variant="default"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Réessayer
                                </Button>
                                <Button
                                    onClick={this.handleGoHome}
                                    className="flex items-center gap-2"
                                    variant="outline"
                                >
                                    <Home className="h-4 w-4" />
                                    Retour à l'accueil
                                </Button>
                            </div>

                            {/* Message de support */}
                            <p className="text-sm text-slate-500">
                                Si le problème persiste, veuillez contacter le support technique.
                            </p>
                        </div>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

// ============================================
// HOOK POUR CAPTURER LES ERREURS ASYNC
// ============================================

export function useErrorHandler() {
    const [, setError] = useState();

    return (error: Error) => {
        logger.error('Async error caught', error, {}, 'useErrorHandler');
        setError(() => {
            throw error;
        });
    };
}

// ============================================
// EXEMPLES D'UTILISATION
// ============================================

/*
// 1. Wrapper global dans App.tsx
function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          ...
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

// 2. Wrapper spécifique pour une section
function Dashboard() {
  return (
    <ErrorBoundary fallback={<DashboardErrorFallback />}>
      <DashboardContent />
    </ErrorBoundary>
  );
}

// 3. Avec callback personnalisé
function AdminPanel() {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Envoyer une alerte au support
    sendAlertToSupport({ error, errorInfo });
  };

  return (
    <ErrorBoundary onError={handleError}>
      <AdminContent />
    </ErrorBoundary>
  );
}

// 4. Capturer les erreurs async
function MyComponent() {
  const handleError = useErrorHandler();

  const fetchData = async () => {
    try {
      await someAsyncOperation();
    } catch (error) {
      handleError(error);
    }
  };

  return <button onClick={fetchData}>Fetch</button>;
}
*/
