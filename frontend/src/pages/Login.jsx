import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { BrainCircuit, Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-bg" style={{ minHeight: 'calc(100vh - 68px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '440px' }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '52px', height: '52px', background: 'var(--primary)',
            borderRadius: '16px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 1.25rem'
          }}>
            <BrainCircuit size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: '0.375rem' }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
            Sign in to continue learning
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2.25rem' }}>
          {error && (
            <div style={{
              background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b',
              padding: '0.875rem 1rem', borderRadius: '12px', marginBottom: '1.25rem',
              fontSize: '0.875rem', fontWeight: 500
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-light)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="rishu@rishurajput.com"
                  style={{ paddingLeft: '2.75rem' }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-light)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  style={{ paddingLeft: '2.75rem' }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.9375rem', marginTop: '0.5rem', fontSize: '0.9375rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Signing in…' : (
                <>Sign in <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.375rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Sign up free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
