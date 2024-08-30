// src/middleware/index.js
const multer = require('multer');
const path = require('path');
const { UPLOAD_DIR, FILE_SIZE_LIMIT, ALLOWED_MIME_TYPES } = require('../config');

exports.createUploadMiddleware = () => multer({
  dest: UPLOAD_DIR,
  limits: { fileSize: FILE_SIZE_LIMIT },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only MP3, WAV, and OGG files are allowed.'), false);
    }

    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.mp3', '.wav', '.ogg'].includes(ext)) {
      return cb(new Error('Invalid file extension. Only .mp3, .wav, and .ogg files are allowed.'), false);
    }

    cb(null, true);
  }
}).single('audio');

exports.validateAudioFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded' });
  }

  if (req.file.size > FILE_SIZE_LIMIT) {
    return res.status(400).json({ error: `File size exceeds the limit of ${FILE_SIZE_LIMIT / (1024 * 1024)}MB.` });
  }

  next();
};

exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds the limit of 100MB.!' });
    }
  }
  res.status(500).json({ error: err.message || 'Something went wrong!' });
};