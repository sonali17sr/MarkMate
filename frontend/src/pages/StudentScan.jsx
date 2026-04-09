import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

export default function StudentScan() {
  const { user } = useAuth();
  const [status, setStatus] = useState('idle'); // idle | scanning | success | error
  const [message, setMessage] = useState('');
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);

  const startScanner = () => {
    setScanning(true);
    setStatus('scanning');
    setMessage('');
  };

  useEffect(() => {
    if (!scanning) return;
    const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 }, false);
    scannerInstanceRef.current = scanner;

    scanner.render(
      async (decodedText) => {
        scanner.clear();
        setScanning(false);

        // Get GPS
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const { data } = await api.post('/attendance/mark', {
                qrToken: decodedText,
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              });
              setStatus('success');
              setMessage(data.message);
            } catch (err) {
              setStatus('error');
              setMessage(err.response?.data?.message || 'Attendance failed');
            }
          },
          () => {
            setStatus('error');
            setMessage('Location access denied. Enable GPS to mark attendance.');
          }
        );
      },
      (err) => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [scanning]);

  return (
    <div className="min-h-screen bg-surface-900">
      <Navbar />
      <div className="pt-20 px-4 pb-12 max-w-lg mx-auto">

        {/* Header */}
        <div className="mb-8 fade-in">
          <p className="text-xs font-mono text-brand-500/60 uppercase tracking-widest mb-1">Student Portal</p>
          <h1 className="font-display text-4xl font-bold text-white">
            Hi, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-gray-500 font-body mt-1">Scan the classroom QR to mark attendance</p>
        </div>

        {/* Scanner Card */}
        <div className="glow-card rounded-2xl p-6 fade-in">
          <h2 className="font-display text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400">◻</span>
            Mark Attendance
          </h2>

          {/* Status display */}
          {status === 'success' && (
            <div className="mb-6 p-5 rounded-2xl bg-brand-500/10 border border-brand-500/30 text-center fade-in">
              <div className="text-5xl mb-3">✅</div>
              <p className="font-display font-semibold text-brand-400 text-lg">Attendance Marked!</p>
              <p className="text-sm text-gray-500 mt-1 font-body">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="mb-6 p-5 rounded-2xl bg-red-500/10 border border-red-500/30 text-center fade-in">
              <div className="text-5xl mb-3">❌</div>
              <p className="font-display font-semibold text-red-400 text-lg">Failed</p>
              <p className="text-sm text-gray-500 mt-1 font-body">{message}</p>
            </div>
          )}

          {/* QR Scanner */}
          {scanning && (
            <div className="mb-4 rounded-xl overflow-hidden border border-brand-500/20 fade-in" id="qr-reader" ref={scannerRef} />
          )}

          {!scanning && (
            <div className="flex flex-col items-center py-8 gap-6">
              {status === 'idle' && (
                <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-brand-500/30 flex items-center justify-center">
                  <span className="text-5xl opacity-30">◻</span>
                </div>
              )}
              <button onClick={startScanner}
                className="btn-primary px-10 py-3 rounded-xl text-sm tracking-wide">
                {status === 'idle' ? '📷 Open Camera & Scan' : '🔄 Scan Again'}
              </button>
            </div>
          )}

          <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-surface-700 border border-brand-500/5">
            <span className="text-brand-400 text-xs mt-0.5">ℹ</span>
            <p className="text-xs text-gray-500 font-body">
              Make sure GPS is enabled. You must be within the classroom radius. QR codes expire every 60 seconds.
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link to="/student/history" className="text-sm text-brand-400 hover:text-brand-300 transition-colors font-body">
            View attendance history →
          </Link>
        </div>
      </div>
    </div>
  );
}