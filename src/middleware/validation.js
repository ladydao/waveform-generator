const { body, validationResult } = require('express-validator');
const { FILE_SIZE_LIMIT, ALLOWED_MIME_TYPES } = require('../config');
const logger = require('../logger');
const path = require('path'); // Assuming path is required for the change

exports.validateAudioFile = [
  body('audio')
    .custom((value, { req }) => {
      if (!req.file) {
        throw new Error('No audio file uploaded');
      }
      const ext = path.extname(req.file.originalname).toLowerCase();
      const mimeType = req.file.mimetype === 'application/octet-stream' ? `audio/${ext.slice(1)}` : req.file.mimetype;

      if (!ALLOWED_MIME_TYPES.includes(mimeType) || !['.mp3', '.wav', '.ogg'].includes(ext)) {
        throw new Error('Invalid file type. Only MP3, WAV, and OGG files are allowed.');
      }
      if (req.file.size > FILE_SIZE_LIMIT) {
        throw new Error(`File size exceeds the limit of ${FILE_SIZE_LIMIT / (1024 * 1024)}MB.`);
      }
      return true;
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Audio file validation failed', { errors: errors.array() });
      return res.status(400).json({ errors: errors.array() });
    }
    logger.info('Audio file validated successfully', { filename: req.file.originalname });
    next();
  }
];

exports.validateVisualizationType = [
  body('visualizationType')
    .isIn(['waveform', 'spectrogram'])
    .withMessage('Invalid visualization type. Must be either "waveform" or "spectrogram".'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Visualization type validation failed', { errors: errors.array() });
      return res.status(400).json({ errors: errors.array() });
    }
    logger.info('Visualization type validated successfully', { type: req.body.visualizationType });
    next();
  }
];