import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

export default function StudentHistory() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [h, s] = await Promise.all([api.get('/attendance/history'), api.get('/attendance/stats')]);
      setRecords(h.data);
      setStats(s.data);
      setLoading(false);
    };
    load();
  }, []);

  const subjects = Object.keys(stats);

  return (
    <div className="min-h-screen bg-surface-900">
      <Navbar />
      <div className="pt-20 px-4 pb-12 max-w-2xl mx-auto">

        <div className="mb-8 fade-in">
          <Link to="/student" className="text-xs font-mono text-brand-500/60 hover:text-brand-400 transition-colors mb-2 inline-block">
            ← Back to Scanner
          </Link>
          <h1 className="font-display text-4xl font-bold text-white">
            Your <span className="gradient-text">Attendance</span>
          </h1>
          <p className="text-gray-500 font-body mt-1">Full history and subject-wise stats</p>
        </div>

        {/* Stats Cards */}
        {subjects.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-8 fade-in">
            {subjects.map((sub) => (
              <div key={sub} className="glow-card rounded-xl p-4">
                <p className="text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider truncate">{sub}</p>
                <div className="flex items-end gap-1">
                  <span className="font-display text-3xl font-bold gradient-text">{stats[sub]}</span>
                  <span className="text-xs text-gray-600 font-mono mb-1">classes</span>
                </div>
              </div>
            ))}
            <div className="glow-card rounded-xl p-4 border-brand-500/30">
              <p className="text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">Total</p>
              <div className="flex items-end gap-1">
                <span className="font-display text-3xl font-bold text-white">{records.filter(r => r.status === 'present').length}</span>
                <span className="text-xs text-gray-600 font-mono mb-1">present</span>
              </div>
            </div>
          </div>
        )}

        {/* History List */}
        <div className="glow-card rounded-2xl overflow-hidden fade-in">
          <div className="px-6 py-4 border-b border-brand-500/10 flex items-center justify-between">
            <h2 className="font-display font-semibold text-white">Full History</h2>
            <span className="font-mono text-xs text-gray-500 bg-surface-700 px-3 py-1 rounded-full">
              {records.length} records
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-16 text-gray-600 font-mono text-sm">— No records yet —</div>
          ) : (
            <div className="divide-y divide-brand-500/5">
              {records.map((r, i) => (
                <div key={r._id} className="px-6 py-4 flex items-center justify-between fade-in hover:bg-brand-500/5 transition-all"
                  style={{ animationDelay: `${i * 0.03}s` }}>
                  <div>
                    <p className="font-body font-medium text-white/80 text-sm">{r.sessionId?.subject || 'Unknown'}</p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                      {r.sessionId?.date} · {new Date(r.markedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-mono border ${
                    r.status === 'present'
                      ? 'bg-brand-500/15 text-brand-400 border-brand-500/30'
                      : 'bg-red-500/15 text-red-400 border-red-500/30'
                  }`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}