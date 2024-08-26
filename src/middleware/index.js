const multer = require('multer');
const { UPLOAD_DIR, FILE_SIZE_LIMIT, ALLOWED_MIME_TYPES } = require('../config');

exports.createUploadMiddleware = () => multer({
  dest: UPLOAD_DIR,
  limits: { fileSize: FILE_SIZE_LIMIT },
  fileFilter: (req, file, cb) => {
    cb(null, ALLOWED_MIME_TYPES.includes(file.mimetype));
  }
}).single('audio');

exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
};