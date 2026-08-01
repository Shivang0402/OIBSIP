import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            padding: '24px',
            textAlign: 'center',
            fontFamily: 'var(--font-body), sans-serif',
            color: '#1c0f0b',
            background: '#fcf9f8',
          }}
        >
          <h1 style={{ fontFamily: 'var(--font-heading), sans-serif', margin: 0 }}>Something went wrong</h1>
          <p style={{ margin: 0, maxWidth: '480px', fontSize: '14px', color: '#7a5a4e' }}>
            {String(this.state.error?.message || this.state.error)}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              background: '#ff6b00',
              color: '#fff',
              border: 'none',
              borderRadius: '999px',
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
