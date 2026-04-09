const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');

// Create session (teacher)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Teachers only' });
  try {
    const { subject, date, latitude, longitude, radiusMeters } = req.body;
    const session = await Session.create({
      teacherId: req.user.id, subject, date, latitude, longitude,
      radiusMeters: radiusMeters || 50,
    });
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all sessions for teacher
router.get('/mine', auth, async (req, res) => {
  try {
    const sessions = await Session.find({ teacherId: req.user.id }).sort({ startTime: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get active session for teacher
router.get('/active', auth, async (req, res) => {
  try {
    const session = await Session.findOne({ teacherId: req.user.id, isActive: true });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// End session
router.patch('/:id/end', auth, async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { isActive: false, endTime: new Date() },
      { new: true }
    );
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get attendance for a session
router.get('/:id/attendance', auth, async (req, res) => {
  try {
    const records = await Attendance.find({ sessionId: req.params.id })
      .populate('studentId', 'name email enrollmentNo');
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CSV Export
router.get('/:id/export', auth, async (req, res) => {
  try {
    const { Parser } = require('json2csv');
    const records = await Attendance.find({ sessionId: req.params.id })
      .populate('studentId', 'name email enrollmentNo');
    const data = records.map((r) => ({
      Name: r.studentId.name,
      Email: r.studentId.email,
      Enrollment: r.studentId.enrollmentNo || 'N/A',
      Status: r.status,
      Time: r.markedAt,
    }));
    const parser = new Parser();
    const csv = parser.parse(data);
    res.header('Content-Type', 'text/csv');
    res.attachment('attendance.csv');
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;