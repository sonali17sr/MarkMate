import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import QRDisplay from '../components/QRDisplay';
import AttendanceTable from '../components/AttendanceTable';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [form, setForm] = useState({ subject: '', date: '', radiusMeters: 50 });
  const [locLoading, setLocLoading] = useState(false);
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [pastSessions, setPastSessions] = useState([]);
  const [tab, setTab] = useState('live'); // 'live' | 'past'

  const fetchActive = useCallback(async () => {
    try {
      const { data } = await api.get('/sessions/active');
      setActiveSession(data);
    } catch {}
  }, []);

  const fetchAttendance = useCallback(async () => {
    if (!activeSession) return;
    try {
      const { data } = await api.get(`/sessions/${activeSession._id}/attendance`);
      setAttendance(data);
    } catch {}
  }, [activeSession]);

  const fetchPast = async () => {
    try {
      const { data } = await api.get('/sessions/mine');
      setPastSessions(data.filter((s) => !s.isActive));
    } catch {}
  };

  useEffect(() => { fetchActive(); }, []);
  useEffect(() => {
    if (!activeSession) return;
    fetchAttendance();
    const interval = setInterval(fetchAttendance, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, [activeSession, fetchAttendance]);
  useEffect(() => { if (tab === 'past') fetchPast(); }, [tab]);

  const getLocation = () => {
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocLoading(false);
      },
      () => { setError('Location access denied'); setLocLoading(false); }
    );
  };

  const createSession = async (e) => {
    e.preventDefault();
    if (!coords) return setError('Please capture classroom location first');
    setCreating(true);
    try {
      const { data } = await api.post('/sessions', {
        subject: form.subject,
        date: form.date,
        latitude: coords.lat,
        longitude: coords.lng,
        radiusMeters: form.radiusMeters,
      });
      setActiveSession(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create session');
    } finally {
      setCreating(false);
    }
  };

  const endSession = async () => {
    try {
      await api.patch(`/sessions/${activeSession._id}/end`);
      setActiveSession(null);
      setAttendance([]);
    } catch {}
  };

  const exportCSV = () => {
    window.open(`/api/sessions/${activeSession._id}/export`, '_blank');
  };

  return (
    <div className="min-h-screen bg-surface-900">
      <Navbar />
      <div className="pt-20 px-4 pb-12 max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8 fade-in">
          <p className="text-xs font-mono text-brand-500/60 uppercase tracking-widest mb-1">Teacher Portal</p>
          <h1 className="font-display text-4xl font-bold text-white">
            Hello, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-gray-500 font-body mt-1">Manage your class sessions below</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-8 bg-surface-800 rounded-xl p-1 w-fit border border-brand-500/10">
          {['live', 'past'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-display font-semibold transition-all ${
                tab === t ? 'bg-brand-500 text-surface-900' : 'text-gray-500 hover:text-gray-300'
              }`}>
              {t === 'live' ? '⚡ Live Session' : '📋 Past Sessions'}
            </button>
          ))}
        </div>

        {tab === 'live' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left — Session Control */}
            <div>
              {!activeSession ? (
                <div className="glow-card rounded-2xl p-6 fade-in">
                  <h2 className="font-display text-lg font-semibold text-white mb-5 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400 text-sm">+</span>
                    Start New Session
                  </h2>

                  {error && (
                    <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <form onSubmit={createSession} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">Subject</label>
                      <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        required className="input-dark w-full px-4 py-3 rounded-xl text-sm" placeholder="e.g. Data Structures" />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">Date</label>
                      <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                        required className="input-dark w-full px-4 py-3 rounded-xl text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-widest">Radius (meters)</label>
                      <input type="number" value={form.radiusMeters} onChange={(e) => setForm({ ...form, radiusMeters: e.target.value })}
                        className="input-dark w-full px-4 py-3 rounded-xl text-sm" min="10" max="500" />
                    </div>

                    <div className="flex items-center gap-3">
                      <button type="button" onClick={getLocation} disabled={locLoading}
                        className="btn-ghost flex-1 py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                        {locLoading ? (
                          <div className="w-4 h-4 border border-brand-500 border-t-transparent rounded-full animate-spin" />
                        ) : '📍'}
                        {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'Capture Location'}
                      </button>
                    </div>

                    <button type="submit" disabled={creating}
                      className="btn-primary w-full py-3 rounded-xl text-sm tracking-wide">
                      {creating ? 'Starting...' : 'Start Session →'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="glow-card rounded-2xl p-6 fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-brand-400 rounded-full pulse-dot" />
                        <span className="text-xs font-mono text-brand-400 uppercase tracking-widest">Live</span>
                      </div>
                      <h2 className="font-display text-xl font-bold text-white">{activeSession.subject}</h2>
                      <p className="text-gray-500 text-sm font-body">{activeSession.date}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-display font-bold gradient-text">{attendance.length}</div>
                      <div className="text-xs text-gray-500 font-mono">present</div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={exportCSV} className="btn-ghost flex-1 py-2.5 rounded-xl text-sm">
                      ⬇ Export CSV
                    </button>
                    <button onClick={endSession}
                      className="flex-1 py-2.5 rounded-xl text-sm font-display font-semibold bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all">
                      ■ End Session
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right — QR Code */}
            <div>
              {activeSession ? (
                <div className="glow-card rounded-2xl p-6 flex flex-col items-center fade-in">
                  <h2 className="font-display text-lg font-semibold text-white mb-6 self-start flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400 text-sm">◻</span>
                    Attendance QR
                  </h2>
                  <QRDisplay sessionId={activeSession._id} />
                </div>
              ) : (
                <div className="glow-card rounded-2xl p-6 flex flex-col items-center justify-center min-h-64 opacity-40 fade-in">
                  <div className="text-4xl mb-3">◻</div>
                  <p className="font-mono text-sm text-gray-600">QR appears when session starts</p>
                </div>
              )}
            </div>

            {/* Attendance Table — full width */}
            {activeSession && (
              <div className="lg:col-span-2 glow-card rounded-2xl p-6 fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-semibold text-white">Live Attendance</h2>
                  <span className="font-mono text-xs text-gray-500 bg-surface-800 px-3 py-1 rounded-full border border-brand-500/10">
                    Auto-refresh 5s
                  </span>
                </div>
                <AttendanceTable records={attendance} />
              </div>
            )}
          </div>
        )}

        {tab === 'past' && (
          <div className="space-y-4 fade-in">
            {pastSessions.length === 0 ? (
              <div className="text-center py-20 text-gray-600 font-mono text-sm">— No past sessions —</div>
            ) : pastSessions.map((s) => (
              <PastSessionCard key={s._id} session={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PastSessionCard({ session }) {
  const [records, setRecords] = useState([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    if (!open) {
      const { data } = await api.get(`/sessions/${session._id}/attendance`);
      setRecords(data);
    }
    setOpen(!open);
  };

  return (
    <div className="glow-card rounded-2xl overflow-hidden">
      <button onClick={load} className="w-full flex items-center justify-between px-6 py-4 hover:bg-brand-500/5 transition-all">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-surface-700 border border-brand-500/10 flex items-center justify-center">
            <span className="text-brand-400 font-mono text-xs">📋</span>
          </div>
          <div className="text-left">
            <p className="font-display font-semibold text-white">{session.subject}</p>
            <p className="text-xs text-gray-500 font-mono">{session.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-gray-500 border border-brand-500/10 px-2 py-1 rounded-full bg-surface-800">
            {new Date(session.startTime).toLocaleDateString()}
          </span>
          <span className="text-brand-400 text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>
      {open && (
        <div className="px-6 pb-4">
          <AttendanceTable records={records} />
        </div>
      )}
    </div>
  );
}