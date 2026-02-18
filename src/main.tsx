import { createRoot } from "react-dom/client";
import { Component, ErrorInfo, ReactNode } from "react";
import { HelmetProvider } from 'react-helmet-async';
import App from "./App.tsx";
import "./index.css";

import ErrorPage from "./components/ui/ErrorPage";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
    constructor(props: { children: ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <ErrorPage error={this.state.error} resetErrorBoundary={() => this.setState({ hasError: false, error: null })} />;
        }

        return this.props.children;
    }
}

try {
    createRoot(document.getElementById("root")!).render(
        <ErrorBoundary>
            <HelmetProvider>
                <App />
            </HelmetProvider>
        </ErrorBoundary>
    );
} catch (e) {
    document.body.innerHTML = `<div style="color:red;padding:20px"><h1>Startup Error</h1><pre>${e}</pre></div>`;
}
