import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error Boundary to prevent white screens on crash
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Fix: Explicitly define the state and constructor to resolve TS property 'props' issues
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    // Fix: Destructure state and props for cleaner access
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#e11d48' }}>
            오류가 발생했습니다
          </h1>
          <p style={{ marginBottom: '1.5rem', color: '#4b5563' }}>
            앱을 실행하는 도중 문제가 생겼습니다. 아래 버튼을 눌러 새로고침 해주세요.
          </p>
          <pre style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', overflow: 'auto', textAlign: 'left', fontSize: '0.875rem' }}>
            {error?.message}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              backgroundColor: '#4f46e5', 
              color: 'white', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '0.5rem', 
              border: 'none', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            페이지 새로고침
          </button>
        </div>
      );
    }

    return children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);