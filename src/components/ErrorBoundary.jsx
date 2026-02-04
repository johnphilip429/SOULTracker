import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 font-sans">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
                    <div className="bg-gray-100 p-4 rounded-lg overflow-auto">
                        <p className="font-mono text-sm text-red-800 font-bold mb-2">{this.state.error?.toString()}</p>
                        <pre className="text-xs text-gray-600">{this.state.errorInfo?.componentStack}</pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Reload App
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
