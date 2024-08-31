const express = require('express');
const fs = require('fs').promises;
const { handleVisualization } = require('./handleVisualization');
const { generateWaveform, generateSpectrogram } = require('../utils');
const logger = require('../logger');
const path = require('path');
const { upload } = require('../middleware/upload');
const { validateAudioFile, validateVisualizationType } = require('../middleware/validation');

// Set up application routes
const setupRoutes = (app) => {
  app.use(express.static(path.join(process.cwd(), 'public')));

  app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
  });

  app.post(
    '/generate',
    upload(),
    validateAudioFile,
    validateVisualizationType,
    (req, res, next) => {
      const generateFunction =
        req.body.visualizationType === 'waveform'
          ? generateWaveform
          : generateSpectrogram;
      handleVisualization(generateFunction)(req, res, next);
    }
  );

  logger.info('Routes set up successfully');
};

module.exports = { setupRoutes };