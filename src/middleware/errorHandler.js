const multer = require('multer');
const logger = require('../logger');

exports.errorHandler = (err, req, res, next) => {
    logger.error('Error occurred:', err);
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size exceeds the limit of 100MB.' });
        }
    }
    res.status(500).json({ error: err.message || 'Something went wrong!' });
};