import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
      style={{ background: 'linear-gradient(to bottom, #0a0f0dee, transparent)', backdropFilter: 'blur(12px)' }}>
      <Link to={user?.role === 'teacher' ? '/teacher' : '/student'} className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
          <span className="text-surface-900 font-display font-bold text-xs">M</span>
        </div>
        <span className="font-display font-bold text-lg text-white">MarkMate</span>
      </Link>

      <div className="flex items-center gap-4">
        {user?.role === 'student' && (
          <Link to="/student/history" className="text-sm text-brand-400 hover:text-brand-300 font-body transition-colors">
            History
          </Link>
        )}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 font-mono">{user?.name}</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-mono border border-brand-500/30 text-brand-400 bg-brand-500/10">
            {user?.role}
          </span>
        </div>
        <button onClick={handleLogout} className="btn-ghost px-4 py-2 rounded-lg text-sm">
          Logout
        </button>
      </div>
    </nav>
  );
}