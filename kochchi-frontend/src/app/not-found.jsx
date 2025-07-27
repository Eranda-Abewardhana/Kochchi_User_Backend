'user-client'
import Link from 'next/link';

const bounceAnimation = {
  animation: 'bounce404 1.5s infinite',
};

export default function NotFound() {
  return (
    <>
      <style>{`
        @keyframes bounce404 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
        color: '#2563eb',
        textAlign: 'center',
        padding: '2rem',
      }}>
        <h1 style={{ fontSize: '6rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1d4ed8', ...bounceAnimation }}>404</h1>
        <h2 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '1rem', color: '#2563eb' }}>Oops! Page not found</h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '400px', color: '#2563eb' }}>
          {/* You can add a message here if you want */}
        </p>
        <Link href="/">
          <button style={{
            background: '#2563eb',
            color: '#fff',
            padding: '0.75rem 2rem',
            borderRadius: '9999px',
            fontSize: '1rem',
            fontWeight: 'bold',
            border: 'none',
            boxShadow: '0 2px 8px rgba(37,99,235,0.15)',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}>
            Go Home
          </button>
        </Link>
      </div>
    </>
  );
} 