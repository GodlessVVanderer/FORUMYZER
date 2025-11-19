import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div
      role="alert"
      style={{
        padding: '40px',
        textAlign: 'center',
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <span className="material-icons" style={{ fontSize: '64px', color: 'var(--accent-red)', marginBottom: '16px' }}>
        error
      </span>
      <h2 style={{ marginBottom: '16px' }}>Something went wrong</h2>
      <p style={{
        color: 'var(--text-secondary)',
        marginBottom: '24px',
        maxWidth: '600px'
      }}>
        An unexpected error occurred. This has been logged and we'll look into it.
      </p>
      <button
        onClick={resetErrorBoundary}
        style={{
          padding: '12px 24px',
          backgroundColor: 'var(--accent-red)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Try Again
      </button>
    </div>
  );
}

interface Props {
  children: React.ReactNode;
}

export default function ErrorBoundary({ children }: Props) {
  const handleError = (error: Error, info: { componentStack: string }) => {
    // Log error to console in development
    console.error('Error caught by boundary:', error, info);

    // In production, send to error tracking service (Sentry, etc.)
    if (import.meta.env.PROD) {
      // Example: Sentry.captureException(error);
    }
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
      onReset={() => {
        // Reset app state if needed
        window.location.href = '/';
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
