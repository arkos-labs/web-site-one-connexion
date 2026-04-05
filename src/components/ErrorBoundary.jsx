import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Check if it's a chunk loading error in React or a dynamic import fail (common on Vercel deploys)
        if (error.name === 'ChunkLoadError' ||
            error.message?.includes('Loading chunk') ||
            error.message?.includes('CSS chunk') ||
            error.message?.includes('Failed to fetch dynamically imported module')) {
            const reloadCount = Number(sessionStorage.getItem('reload_count') || '0');
            if (reloadCount < 1) {
                sessionStorage.setItem('reload_count', String(reloadCount + 1));
                window.location.reload();
            }
            return { hasError: true, error };
        }
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
        this.setState({ errorInfo });
    }

    componentWillUnmount() {
        sessionStorage.removeItem('reload_count');
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center selection:bg-[#ed5518]/10">
                    <div className="max-w-xl w-full p-8 md:p-12 bg-white rounded-[2.5rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] border border-slate-100 relative overflow-hidden">
                        {/* Motif décoratif en arrière-plan */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#ed5518]/5 rounded-full blur-3xl" />
                        
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="mb-8 p-5 bg-[#ed5518]/10 rounded-3xl text-[#ed5518]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                            </div>
                            
                            <h2 className="text-3xl font-black text-slate-900 leading-tight">Oups, une erreur est survenue !</h2>
                            <p className="mt-4 text-slate-500 font-medium leading-relaxed">
                                Le site a tenté un rechargement automatique suite à une mise à jour.<br />
                                Si le problème persiste, utilisez le bouton ci-dessous.
                            </p>

                            {this.state.error && (
                                <div className="mt-8 w-full">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-[#ed5518] mb-2 text-left px-2">Détails techniques</div>
                                    <div className="p-5 bg-slate-900 text-slate-400 text-left text-[10px] font-mono rounded-[1.5rem] w-full max-h-[180px] overflow-auto shadow-inner border border-slate-800 leading-relaxed custom-scrollbar">
                                        <span className="text-[#ed5518] font-bold">{this.state.error.toString()}</span>
                                        <br /><br />
                                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                                    </div>
                                </div>
                            )}

                            <div className="mt-10 flex flex-col items-center gap-4 w-full">
                                <button
                                    onClick={() => { sessionStorage.removeItem('reload_count'); window.location.reload(); }}
                                    className="w-full rounded-2xl bg-slate-900 py-4 font-black text-white shadow-xl shadow-slate-900/20 transition-all hover:bg-[#ed5518] hover:-translate-y-1 active:scale-95"
                                >
                                    Recharger la page
                                </button>
                                <button
                                    onClick={() => window.location.href = '/'}
                                    className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                                >
                                    Retourner à l'accueil
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                        © 2026 One Connexion — Systèmes de Livraison Premium
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
