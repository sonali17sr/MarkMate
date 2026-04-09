
export default function AttendanceTable({ records }) {
  if (!records || records.length === 0)
    return (
      <div className="text-center py-12 text-gray-600 font-mono text-sm">
        — No attendance records yet —
      </div>
    );

  return (
    <div className="overflow-x-auto rounded-xl border border-brand-500/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-brand-500/10 bg-surface-800">
            <th className="px-4 py-3 text-left text-xs font-mono text-brand-500/70 uppercase tracking-widest">Name</th>
            <th className="px-4 py-3 text-left text-xs font-mono text-brand-500/70 uppercase tracking-widest">Enrollment</th>
            <th className="px-4 py-3 text-left text-xs font-mono text-brand-500/70 uppercase tracking-widest">Email</th>
            <th className="px-4 py-3 text-left text-xs font-mono text-brand-500/70 uppercase tracking-widest">Time</th>
            <th className="px-4 py-3 text-left text-xs font-mono text-brand-500/70 uppercase tracking-widest">Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr key={r._id} className={`border-b border-brand-500/5 fade-in ${i % 2 === 0 ? 'bg-surface-800/50' : 'bg-surface-800/20'}`}
              style={{ animationDelay: `${i * 0.05}s` }}>
              <td className="px-4 py-3 font-body text-white/80">{r.studentId?.name || '—'}</td>
              <td className="px-4 py-3 font-mono text-xs text-gray-400">{r.studentId?.enrollmentNo || 'N/A'}</td>
              <td className="px-4 py-3 text-gray-400 text-xs">{r.studentId?.email}</td>
              <td className="px-4 py-3 font-mono text-xs text-gray-500">
                {new Date(r.markedAt).toLocaleTimeString()}
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-mono ${
                  r.status === 'present'
                    ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {r.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}