import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, LogOut, User, BarChart2, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav style={{
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid #ede9ff',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '68px' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{
              width: '36px', height: '36px', background: 'var(--primary)',
              borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <BrainCircuit size={20} color="#fff" />
            </div>
            <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              SynapseAI
            </span>
          </Link>

          {/* Nav links + CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {user ? (
              <>
                <Link to="/dashboard" style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.5rem 0.875rem', borderRadius: '100px', textDecoration: 'none',
                  color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem',
                  transition: 'all 0.2s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>
                <Link to="/analytics" style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.5rem 0.875rem', borderRadius: '100px', textDecoration: 'none',
                  color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem',
                  transition: 'all 0.2s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <BarChart2 size={15} />
                  Analytics
                </Link>

                <div style={{ width: '1px', height: '20px', background: '#e5e3ff', margin: '0 0.5rem' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '50%',
                    background: 'var(--surface-2)', border: '1.5px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <User size={16} color="var(--primary)" />
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>{user.name}</span>
                  <button
                    onClick={logout}
                    title="Log out"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: '0.375rem', borderRadius: '8px', display: 'flex',
                      alignItems: 'center', color: 'var(--text-light)',
                      transition: 'color 0.2s, background 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fee2e2'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-light)'; e.currentTarget.style.background = 'none'; }}
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            ) : (
              <>
                {location.pathname !== '/login' && (
                  <Link to="/login" className="btn-secondary" style={{ fontSize: '0.875rem', padding: '0.6rem 1.375rem' }}>
                    Log in
                  </Link>
                )}
                {location.pathname !== '/register' && (
                  <Link to="/register" className="btn-primary" style={{ fontSize: '0.875rem', padding: '0.6rem 1.375rem' }}>
                    Sign up free
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
