const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Session = require('../models/Session');
const { generateQRToken, generateQRImage } = require('../utils/qrHelper');

// Get current QR for active session
router.get('/active', auth, async (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Teachers only' });
  try {
    const session = await Session.findOne({ teacherId: req.user.id, isActive: true });
    if (!session) return res.status(404).json({ message: 'No active session' });

    const token = generateQRToken(session._id.toString());
    const qrImage = await generateQRImage(token);
    res.json({ qrImage, sessionId: session._id, expiresIn: 60 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;