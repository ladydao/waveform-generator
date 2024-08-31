const multer = require('multer');
const path = require('path');
const { UPLOAD_DIR, FILE_SIZE_LIMIT, ALLOWED_MIME_TYPES } = require('../config');
const logger = require('../logger');

exports.upload = () => multer({
  dest: UPLOAD_DIR,
  limits: { fileSize: FILE_SIZE_LIMIT },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      logger.warn(`Invalid file type attempted: ${file.mimetype}`);
      return cb(new Error('Invalid file type. Only MP3, WAV, and OGG files are allowed.'), false);
    }

    // Check file extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.mp3', '.wav', '.ogg'].includes(ext)) {
      logger.warn(`Invalid file extension attempted: ${ext}`);
      return cb(new Error('Invalid file extension. Only .mp3, .wav, and .ogg files are allowed.'), false);
    }

    logger.info(`File accepted: ${file.originalname}`);
    cb(null, true);
  }
}).single('audio');