import React from 'react';
import { Card } from './Card';
import { Button } from './Button';

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
                <div className="min-h-screen bg-background bg-calm p-8 font-sans flex items-center justify-center">
                    <div className="w-full max-w-lg space-y-6">
                        <div className="text-center space-y-2">
                            <p className="text-xs uppercase tracking-[0.3em] text-text-muted">A Gentle Pause</p>
                            <h1 className="text-3xl font-display text-text-main">Something got tangled.</h1>
                            <p className="text-sm text-text-muted">
                                The app hit a snag. You can reload and continue.
                            </p>
                        </div>

                        <Card className="p-5">
                            <details className="text-sm text-text-muted">
                                <summary className="cursor-pointer font-medium text-text-main">View technical details</summary>
                                <div className="mt-3 bg-background/60 border border-primary/10 rounded-2xl p-4 overflow-auto">
                                    <p className="font-mono text-xs text-text-main mb-2">
                                        {this.state.error?.toString()}
                                    </p>
                                    <pre className="text-[11px] text-text-muted whitespace-pre-wrap">
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </div>
                            </details>
                        </Card>

                        <div className="flex justify-center">
                            <Button onClick={() => window.location.reload()}>
                                Reload App
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
