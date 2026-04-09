import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      navigate(data.user.role === 'teacher' ? '/teacher' : '/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #22c55e, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-80 h-80 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #4ade80, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(#22c55e11 1px, transparent 1px), linear-gradient(90deg, #22c55e11 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="w-full max-w-md fade-in relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-500/20 border border-brand-500/30 mb-4"
            style={{ boxShadow: '0 0 30px #22c55e22' }}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="3" y="3" width="10" height="10" rx="2" fill="#22c55e" opacity="0.8" />
              <rect x="15" y="3" width="10" height="10" rx="2" fill="#22c55e" />
              <rect x="3" y="15" width="10" height="10" rx="2" fill="#22c55e" />
              <rect x="15" y="15" width="4" height="4" rx="1" fill="#22c55e" opacity="0.6" />
              <rect x="21" y="15" width="4" height="4" rx="1" fill="#22c55e" opacity="0.6" />
              <rect x="15" y="21" width="4" height="4" rx="1" fill="#22c55e" opacity="0.6" />
              <rect x="21" y="21" width="4" height="4" rx="1" fill="#22c55e" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold gradient-text">MarkMate</h1>
          <p className="text-gray-500 text-sm mt-1 font-body">Smart Attendance, Zero Proxy</p>
        </div>

        <div className="glow-card rounded-2xl p-8">
          <h2 className="font-display text-xl font-semibold text-white mb-6">Sign in</h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-body">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">Email</label>
              <input name="email" type="email" value={form.email} onChange={handle} required
                className="input-dark w-full px-4 py-3 rounded-xl font-body text-sm" placeholder="you@college.edu" />
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">Password</label>
              <input name="password" type="password" value={form.password} onChange={handle} required
                className="input-dark w-full px-4 py-3 rounded-xl font-body text-sm" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 rounded-xl mt-2 text-sm tracking-wide">
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6 font-body">
            No account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 transition-colors">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}