const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Session = require('../models/Session');
const { verifyQRToken } = require('../utils/qrHelper');
const { getDistanceMeters } = require('../utils/geoHelper');
const crypto = require('crypto');

// Mark attendance (student scans QR)
router.post('/mark', auth, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Students only' });
  try {
    const { qrToken, latitude, longitude } = req.body;

    // 1. Verify QR token
    let decoded;
    try {
      decoded = verifyQRToken(qrToken);
    } catch {
      return res.status(400).json({ message: 'QR code expired or invalid. Please scan again.' });
    }

    const sessionId = decoded.sessionId;

    // 2. Check session is active
    const session = await Session.findById(sessionId);
    if (!session || !session.isActive)
      return res.status(400).json({ message: 'Session is no longer active.' });

    // 3. Check duplicate
    const existing = await Attendance.findOne({ sessionId, studentId: req.user.id });
    if (existing)
      return res.status(400).json({ message: 'Attendance already marked for this session.' });

    // 4. GPS check
    const dist = getDistanceMeters(latitude, longitude, session.latitude, session.longitude);
    if (dist > session.radiusMeters)
      return res.status(400).json({
        message: `You are ${Math.round(dist)}m away from the classroom. Must be within ${session.radiusMeters}m.`,
      });

    // 5. Store token hash (one-time use)
    const qrTokenHash = crypto.createHash('sha256').update(qrToken).digest('hex');

    const record = await Attendance.create({
      sessionId,
      studentId: req.user.id,
      latitude,
      longitude,
      qrTokenHash,
      status: 'present',
    });

    res.status(201).json({ message: 'Attendance marked successfully!', record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Student's attendance history
router.get('/history', auth, async (req, res) => {
  try {
    const records = await Attendance.find({ studentId: req.user.id })
      .populate('sessionId', 'subject date')
      .sort({ markedAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Student attendance % per subject
router.get('/stats', auth, async (req, res) => {
  try {
    const records = await Attendance.find({ studentId: req.user.id, status: 'present' })
      .populate('sessionId', 'subject');
    const map = {};
    for (const r of records) {
      const sub = r.sessionId?.subject;
      if (!sub) continue;
      map[sub] = (map[sub] || 0) + 1;
    }
    res.json(map);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;