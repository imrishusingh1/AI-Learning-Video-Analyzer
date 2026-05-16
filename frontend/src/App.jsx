import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Component } from 'react';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import VideoDetails from './pages/VideoDetails.jsx';
import Analytics from './pages/Analytics.jsx';
import Navbar from './components/Navbar.jsx';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'#f8f7ff', padding:'2rem', textAlign:'center' }}>
        <h2 style={{ color:'#dc2626', fontSize:'1.5rem', fontWeight:700, marginBottom:'1rem' }}>Something went wrong</h2>
        <pre style={{ background:'#fee2e2', color:'#991b1b', padding:'1rem', borderRadius:'12px', fontSize:'0.8rem', maxWidth:'600px', overflowX:'auto' }}>
          {this.state.error?.message}
        </pre>
        <button onClick={() => window.location.href='/dashboard'} style={{ marginTop:'1.5rem', padding:'0.75rem 2rem', background:'#5B4EF8', color:'#fff', border:'none', borderRadius:'12px', cursor:'pointer', fontWeight:600 }}>
          Back to Dashboard
        </button>
      </div>
    );
    return this.props.children;
  }
}

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--background)', color: 'var(--text)' }}>
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/videos/:id" element={<ProtectedRoute><VideoDetails /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                {/* Other routes will go here */}
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
