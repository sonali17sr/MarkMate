const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  date: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  radiusMeters: { type: Number, default: 50 },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
});

module.exports = mongoose.model('Session', SessionSchema);