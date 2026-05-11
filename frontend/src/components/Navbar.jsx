import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <BrainCircuit className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              LearnAI
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-slate-300 hover:text-white transition">
                  Dashboard
                </Link>
                <Link to="/analytics" className="text-slate-300 hover:text-white transition">
                  Analytics
                </Link>
                <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-slate-700">
                  <div className="flex items-center space-x-2">
                    <div className="bg-slate-800 p-1.5 rounded-full">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <span className="text-sm font-medium">{user.name}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="text-slate-400 hover:text-red-400 transition"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-300 hover:text-white transition">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-primary hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
