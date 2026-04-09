const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['teacher', 'student'], required: true },
  enrollmentNo: { type: String, default: null }, // only for students
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);