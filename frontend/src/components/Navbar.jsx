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
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-[68px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-[10px] bg-[var(--primary)] flex items-center justify-center shrink-0">
              <BrainCircuit size={18} color="#fff" className="sm:w-5 sm:h-5" />
            </div>
            <span className="text-lg sm:text-[1.125rem] font-extrabold text-[var(--text)] tracking-tight hidden sm:block">
              SynapseAI
            </span>
          </Link>

          {/* Nav links + CTA */}
          <div className="flex items-center gap-1 sm:gap-2">
            {user ? (
              <>
                <Link to="/dashboard" className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-full no-underline text-[var(--text-muted)] font-medium text-sm transition-all hover:bg-[var(--surface-2)] hover:text-[var(--text)]">
                  <LayoutDashboard size={18} />
                  <span className="hidden md:block">Dashboard</span>
                </Link>
                <Link to="/analytics" className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-full no-underline text-[var(--text-muted)] font-medium text-sm transition-all hover:bg-[var(--surface-2)] hover:text-[var(--text)]">
                  <BarChart2 size={18} />
                  <span className="hidden md:block">Analytics</span>
                </Link>

                <div className="w-[1px] h-5 bg-[#e5e3ff] mx-1 sm:mx-2 hidden sm:block" />

                <div className="flex items-center gap-2 ml-1 sm:ml-0">
                  <div className="w-8 h-8 sm:w-[34px] sm:h-[34px] rounded-full bg-[var(--surface-2)] border-[1.5px] border-[var(--border)] flex items-center justify-center shrink-0">
                    <User size={16} color="var(--primary)" />
                  </div>
                  <span className="text-sm font-semibold text-[var(--text)] hidden sm:block max-w-[100px] truncate">{user.name}</span>
                  <button
                    onClick={logout}
                    title="Log out"
                    className="flex items-center justify-center p-1.5 sm:p-2 rounded-lg bg-transparent border-none cursor-pointer text-[var(--text-light)] transition-colors hover:text-red-500 hover:bg-red-50"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                {location.pathname !== '/login' && (
                  <Link to="/login" className="btn-secondary text-sm px-4 py-2 hidden sm:flex">
                    Log in
                  </Link>
                )}
                {location.pathname !== '/register' && (
                  <Link to="/register" className="btn-primary text-sm px-4 py-2">
                    Sign up free
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
