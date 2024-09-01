const multer = require('multer');
const path = require('path');
const { UPLOAD_DIR, FILE_SIZE_LIMIT, ALLOWED_MIME_TYPES } = require('../config');
const logger = require('../logger');

exports.handleUpload = multer({
  dest: UPLOAD_DIR,
  limits: { fileSize: FILE_SIZE_LIMIT },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype === 'application/octet-stream' ? `audio/${ext.slice(1)}` : file.mimetype;

    if (!ALLOWED_MIME_TYPES.includes(mimeType) || !['.mp3', '.wav', '.ogg'].includes(ext)) {
      logger.warn(`Invalid file type or extension: ${file.mimetype}, ${ext}`);
      return cb(new Error('Invalid file type or extension. Only MP3, WAV, and OGG files are allowed.'), false);
    }

    logger.info(`File accepted: ${file.originalname}`);
    cb(null, true);
  }
}).single('audio');