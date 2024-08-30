const { body, validationResult } = require('express-validator');
const { FILE_SIZE_LIMIT, ALLOWED_MIME_TYPES } = require('../config');
const logger = require('../logger');

exports.validateAudioFile = [
    body('audio')
        .custom((value, { req }) => {
            if (!req.file) {
                throw new Error('No audio file uploaded');
            }
            if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
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