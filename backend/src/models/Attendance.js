const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  markedAt: { type: Date, default: Date.now },
  latitude: { type: Number },
  longitude: { type: Number },
  qrTokenHash: { type: String },
  status: { type: String, enum: ['present', 'rejected'], default: 'present' },
});

module.exports = mongoose.model('Attendance', AttendanceSchema);