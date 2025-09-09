import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Optional: log to an external service
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
          <div style={{ maxWidth: 520, width: '100%', background: 'white', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: 20 }}>
            <h2 style={{ marginTop: 0 }}>Something went wrong</h2>
            <p style={{ color: '#6B7280' }}>The app hit an unexpected error. Try reloading. If it keeps happening, share the username and steps so we can fix it.</p>
            <pre style={{ background: '#f9fafb', padding: 12, borderRadius: 8, overflowX: 'auto', color: '#374151' }}>
              {String(this.state.error)}
            </pre>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => window.location.reload()} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #FDBA74', background: 'linear-gradient(90deg,#F97316,#FDBA74)', color: 'white', cursor: 'pointer' }}>Reload</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
