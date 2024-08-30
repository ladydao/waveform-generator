const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { OUTPUT_DIR } = require('../config');
const { generateFileNameFromHash, cleanupFiles, generateWaveform, generateSpectrogram } = require('../utils');
const { createUploadMiddleware } = require('../middleware');
const { validateAudioFile, validateVisualizationType } = require('../middleware/validation');
const logger = require('../logger');

const handleVisualization = (generateFunction) => async (req, res) => {
  const inputFile = req.file.path;
  const outputFileName = await generateFileNameFromHash(inputFile) + ".png";
  const outputFile = path.join(OUTPUT_DIR, outputFileName);

  try {
    await generateFunction(inputFile, outputFile);
    await fs.access(outputFile);
    logger.info(`Visualization generated: ${outputFile}`);
    res.sendFile(outputFile, { root: process.cwd() });
  } catch (error) {
    logger.error(`Error generating visualization: ${error.message}`);
    res.status(500).json({ error: 'Error generating visualization' });
  } finally {
    await cleanupFiles(inputFile, outputFile);
  }
};

const setupRoutes = (app) => {
  app.use(express.static(path.join(process.cwd(), 'public')));

  app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
  });

  app.post(
    '/generate',
    createUploadMiddleware(),
    validateAudioFile,
    validateVisualizationType,
    (req, res, next) => {
      const generateFunction = req.body.visualizationType === 'waveform' ? generateWaveform : generateSpectrogram;
      handleVisualization(generateFunction)(req, res, next);
    }
  );

  logger.info('Routes set up successfully');
};

module.exports = { setupRoutes };