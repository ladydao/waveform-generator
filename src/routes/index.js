const express = require('express');
const logger = require('../logger');
const path = require('path');
const { upload } = require('../middleware/upload');
const { handleVisualization } = require('./handleVisualization');
const { validateAudioFile, validateVisualizationType } = require('../middleware/validation');

const setupRoutes = (app) => {
  app.use(express.static(path.join(process.cwd(), 'public')));

  app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
  });

  app.post('/generate', upload(), validateAudioFile, validateVisualizationType, handleVisualization);
  logger.info('Routes set up successfully');
};

module.exports = { setupRoutes };