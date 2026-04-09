import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', enrollmentNo: '' });
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
      const { data } = await api.post('/auth/register', form);
      login(data.user, data.token);
      navigate(data.user.role === 'teacher' ? '/teacher' : '/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, #22c55e, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(#22c55e11 1px, transparent 1px), linear-gradient(90deg, #22c55e11 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="w-full max-w-md fade-in relative z-10">
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
              <span className="font-display font-bold text-brand-400">M</span>
            </div>
            <span className="font-display text-2xl font-bold gradient-text">MarkMate</span>
          </Link>
        </div>

        <div className="glow-card rounded-2xl p-8">
          <h2 className="font-display text-xl font-semibold text-white mb-6">Create Account</h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">Full Name</label>
              <input name="name" value={form.name} onChange={handle} required
                className="input-dark w-full px-4 py-3 rounded-xl text-sm" placeholder="Your Name" />
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">Email</label>
              <input name="email" type="email" value={form.email} onChange={handle} required
                className="input-dark w-full px-4 py-3 rounded-xl text-sm" placeholder="you@college.edu" />
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">Password</label>
              <input name="password" type="password" value={form.password} onChange={handle} required
                className="input-dark w-full px-4 py-3 rounded-xl text-sm" placeholder="••••••••" />
            </div>

            {/* Role Toggle */}
            <div>
              <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">Role</label>
              <div className="flex rounded-xl overflow-hidden border border-brand-500/20">
                {['student', 'teacher'].map((r) => (
                  <button key={r} type="button"
                    onClick={() => setForm({ ...form, role: r })}
                    className={`flex-1 py-3 text-sm font-display font-semibold transition-all ${
                      form.role === r
                        ? 'bg-brand-500 text-surface-900'
                        : 'bg-transparent text-gray-500 hover:text-gray-300'
                    }`}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {form.role === 'student' && (
              <div>
                <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">Enrollment No.</label>
                <input name="enrollmentNo" value={form.enrollmentNo} onChange={handle}
                  className="input-dark w-full px-4 py-3 rounded-xl text-sm" placeholder="22CS001" />
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 rounded-xl mt-2 text-sm tracking-wide">
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}