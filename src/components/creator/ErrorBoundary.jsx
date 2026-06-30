import React from "react";

// Catches render-time crashes anywhere in the Creator OS so a component error
// shows a recoverable message instead of a blank (black) screen.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("Creator OS render crash:", error, info);
  }
  handleReload = () => {
    this.setState({ error: null });
    window.location.reload();
  };
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl border border-destructive/40 bg-card p-6 space-y-3">
            <h2 className="font-display font-bold text-destructive">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">
              The Creator OS hit a render error. Your wallet and session are unaffected.
            </p>
            <pre className="text-xs text-muted-foreground bg-muted rounded-md p-2 overflow-auto max-h-40 whitespace-pre-wrap break-all">
              {String(this.state.error?.message || this.state.error)}
            </pre>
            <button onClick={this.handleReload} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}