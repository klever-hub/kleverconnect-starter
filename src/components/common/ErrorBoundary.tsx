/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree and displays a fallback UI
 */

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  /** Child components to render */
  children: ReactNode;
  /** Custom fallback UI (optional) */
  fallback?: ReactNode;
  /** Callback when error is caught (optional) */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  /** Whether an error has been caught */
  hasError: boolean;
  /** The caught error */
  error: Error | null;
  /** Additional error information */
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component that catches errors in child components
 * and displays a user-friendly error message
 *
 * @example
 * <ErrorBoundary>
 *   <YourApp />
 * </ErrorBoundary>
 *
 * @example
 * // With custom fallback
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <YourApp />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Update state when an error is caught
   */
  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Log error information when an error is caught
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error Info:', errorInfo);

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: Send error to error tracking service (e.g., Sentry)
    // sendErrorToTracking(error, errorInfo);
  }

  /**
   * Reset error state and navigate to home
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = '/';
  };

  /**
   * Refresh the page
   */
  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
          }}
        >
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</h1>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Oops! Something went wrong</h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              marginBottom: '2rem',
              maxWidth: '600px',
              lineHeight: '1.6',
            }}
          >
            Don't worry! This happens sometimes when building with Web3. Try refreshing the page or
            going back home.
          </p>

          {/* Show error details in development */}
          {import.meta.env.DEV && this.state.error && (
            <details
              style={{
                marginBottom: '2rem',
                textAlign: 'left',
                padding: '1rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px',
                maxWidth: '800px',
                width: '100%',
                overflow: 'auto',
                border: '1px solid var(--border-color)',
              }}
            >
              <summary
                style={{
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                  userSelect: 'none',
                }}
              >
                🔍 Error Details (Development Only)
              </summary>
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Error Message:
                </h4>
                <pre
                  style={{
                    fontSize: '0.875rem',
                    overflow: 'auto',
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: '4px',
                    marginBottom: '1rem',
                  }}
                >
                  {this.state.error.message}
                </pre>

                {this.state.error.stack && (
                  <>
                    <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                      Stack Trace:
                    </h4>
                    <pre
                      style={{
                        fontSize: '0.75rem',
                        overflow: 'auto',
                        padding: '0.75rem',
                        backgroundColor: 'var(--bg-tertiary)',
                        borderRadius: '4px',
                        maxHeight: '300px',
                      }}
                    >
                      {this.state.error.stack}
                    </pre>
                  </>
                )}

                {this.state.errorInfo && (
                  <>
                    <h4
                      style={{
                        marginTop: '1rem',
                        marginBottom: '0.5rem',
                        color: 'var(--text-primary)',
                      }}
                    >
                      Component Stack:
                    </h4>
                    <pre
                      style={{
                        fontSize: '0.75rem',
                        overflow: 'auto',
                        padding: '0.75rem',
                        backgroundColor: 'var(--bg-tertiary)',
                        borderRadius: '4px',
                        maxHeight: '200px',
                      }}
                    >
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
            </details>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                fontWeight: '600',
                background: 'var(--klever-gradient)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              🏠 Go Home
            </button>
            <button
              onClick={this.handleRefresh}
              style={{
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                fontWeight: '600',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
            >
              🔄 Refresh Page
            </button>
          </div>

          {/* Help link */}
          <p
            style={{
              marginTop: '2rem',
              fontSize: '0.875rem',
              color: 'var(--text-tertiary)',
            }}
          >
            If this keeps happening,{' '}
            <a
              href="https://github.com/klever-hub/kleverconnect-starter/issues"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--klever-pink)',
                textDecoration: 'underline',
              }}
            >
              report an issue on GitHub
            </a>{' '}
            or ask for help in the{' '}
            <a
              href="https://forum.klever.org"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--klever-pink)',
                textDecoration: 'underline',
              }}
            >
              Klever Forum
            </a>
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
