import * as React from 'react';

interface Props {
    children: React.ReactNode;
    componentEvents?: any;
}

interface State {
    hasError: boolean;
}

export class ComponentErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Component Error Boundary caught an error", error, errorInfo);
        if (this.props.componentEvents?.fireComponentEvent) {
            let message = 'Unknown error';
            let stack = '';
            if (error instanceof Error) {
                message = error.message;
                stack = error.stack || '';
            } else if (typeof error === 'string') {
                message = error;
            } else {
                message = JSON.stringify(error) || 'Unknown error';
            }

            this.props.componentEvents.fireComponentEvent('onCanvasError', {
                source: 'ErrorBoundary',
                message,
                stack
            });
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'var(--neutral-10)',
                    color: 'var(--neutral-90)',
                    padding: '20px',
                    textAlign: 'center'
                }}>
                    <h3>Component crashed. Please refresh.</h3>
                    <button 
                        onClick={() => this.setState({ hasError: false })}
                        style={{
                            marginTop: '10px',
                            padding: '8px 16px',
                            backgroundColor: 'var(--callToAction)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
