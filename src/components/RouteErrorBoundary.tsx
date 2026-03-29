import { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Lightweight error boundary for individual route pages.
 * Catches dynamic import failures and rendering errors,
 * showing a user-friendly fallback instead of a blank page.
 */
export class RouteErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[RouteErrorBoundary]', error.message, errorInfo.componentStack);
  }

  private handleReload = () => {
    // Clear stale chunk markers and reload
    sessionStorage.removeItem('chunk-reload');
    window.location.reload();
  };

  public render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const isChunkError =
      this.state.error?.message?.includes('dynamically imported module') ||
      this.state.error?.message?.includes('Loading chunk') ||
      this.state.error?.message?.includes('Loading CSS chunk');

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card rounded-2xl border border-border p-8 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">
            {isChunkError ? 'Page update available' : 'Something went wrong'}
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            {isChunkError
              ? 'A newer version of this page is available. Please refresh to continue.'
              : 'This page encountered an error. Refreshing usually fixes it.'}
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={this.handleReload} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Page
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/')}
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
