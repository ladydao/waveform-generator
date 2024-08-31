require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'appdata/uploads/',
  OUTPUT_DIR: process.env.OUTPUT_DIR || 'appdata/output/',
  LOG_DIR: process.env.LOG_DIR || 'appdata/logs/',
  FILE_SIZE_LIMIT: process.env.FILE_SIZE_LIMIT || 100 * 1024 * 1024, // 100MB
  ALLOWED_MIME_TYPES: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
};