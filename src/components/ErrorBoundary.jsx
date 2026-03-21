import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Check if it's a chunk loading error in React
        if (error.name === 'ChunkLoadError' ||
            error.message.includes('Loading chunk') ||
            error.message.includes('CSS chunk')) {
            const reloadCount = Number(sessionStorage.getItem('reload_count') || '0');
            if (reloadCount < 1) {
                sessionStorage.setItem('reload_count', String(reloadCount + 1));
                window.location.reload();
            }
            return { hasError: true };
        }
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    componentWillUnmount() {
        sessionStorage.removeItem('reload_count');
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center">
                    <h2 className="text-2xl font-black text-slate-900">Oups, une erreur est survenue !</h2>
                    <p className="mt-4 text-slate-500">Le site a tenté un rechargement automatique.</p>
                    <button
                        onClick={() => { sessionStorage.removeItem('reload_count'); window.location.reload(); }}
                        className="mt-8 rounded-full bg-orange-500 px-8 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105"
                    >
                        Recharger manuellement
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
