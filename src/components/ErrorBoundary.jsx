import React from 'react';

/**
 * ErrorBoundary — Menangkap error runtime di tree komponen React
 * dan menampilkan fallback UI yang ramah pengguna alih-alih layar blank putih.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log error untuk keperluan debugging/monitoring
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  handleClearDataAndReload = () => {
    try {
      localStorage.removeItem('daylight_session');
      localStorage.removeItem('daylight_users');
    } catch {
      // ignore
    }
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)',
          padding: '24px',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          color: '#1e293b',
        }}>
          <div style={{
            maxWidth: '520px',
            width: '100%',
            background: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0,0,0,0.1)',
            padding: '36px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#fef2f2',
              color: '#ef4444',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              marginBottom: '20px',
            }}>
              ⚠️
            </div>

            <h2 style={{
              fontSize: '22px',
              fontWeight: 700,
              color: '#0f172a',
              margin: '0 0 8px 0',
              letterSpacing: '-0.02em',
            }}>
              Terjadi Kesalahan Aplikasi
            </h2>

            <p style={{
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#64748b',
              margin: '0 0 24px 0',
            }}>
              Aplikasi mengalami kendala tak terduga. Anda dapat memuat ulang halaman atau membersihkan sesi data lokal.
            </p>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '24px',
            }}>
              <button
                onClick={this.handleReload}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 18px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                  transition: 'background 0.2s',
                }}
              >
                Muat Ulang Halaman
              </button>

              <button
                onClick={this.handleReset}
                style={{
                  background: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '10px 18px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Kembali ke Beranda
              </button>

              <button
                onClick={this.handleClearDataAndReload}
                style={{
                  background: 'transparent',
                  color: '#ef4444',
                  border: '1px dashed #fca5a5',
                  borderRadius: '10px',
                  padding: '10px 16px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
                title="Gunakan ini jika data localStorage korup atau format tidak valid"
              >
                Reset Data Demo
              </button>
            </div>

            {this.state.error && (
              <details style={{
                textAlign: 'left',
                background: '#f8fafc',
                borderRadius: '10px',
                padding: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
                color: '#64748b',
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#475569' }}>
                  Detail Teknis (Error Trace)
                </summary>
                <pre style={{
                  marginTop: '10px',
                  padding: '8px',
                  background: '#1e293b',
                  color: '#f8fafc',
                  borderRadius: '6px',
                  overflowX: 'auto',
                  fontSize: '11px',
                  whiteSpace: 'pre-wrap',
                }}>
                  {this.state.error?.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
