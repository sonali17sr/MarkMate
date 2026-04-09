const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');

function generateQRToken(sessionId) {
  return jwt.sign({ sessionId, type: 'qr' }, process.env.QR_SECRET, { expiresIn: '60s' });
}

function verifyQRToken(token) {
  return jwt.verify(token, process.env.QR_SECRET); // throws if invalid/expired
}

async function generateQRImage(token) {
  return await QRCode.toDataURL(token);
}

module.exports = { generateQRToken, verifyQRToken, generateQRImage };