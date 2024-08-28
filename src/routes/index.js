const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { OUTPUT_DIR } = require('../config');
const { generateRandomFileName, cleanupFiles, generateWaveform, generateSpectrogram } = require('../utils');
const { createUploadMiddleware } = require('../middleware');

const handleVisualization = (generateFunction) => async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded' });
  }

  const inputFile = req.file.path;
  const outputFileName = generateRandomFileName();
  const outputFile = path.join(OUTPUT_DIR, outputFileName);

  try {
    await generateFunction(inputFile, outputFile);

    await fs.access(outputFile);
    res.sendFile(outputFile, { root: process.cwd() });
  } catch (error) {
    console.error(`Error generating visualization: ${error.message}`);
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

  app.post('/generate-waveform', createUploadMiddleware(), handleVisualization(generateWaveform));
  app.post('/generate-spectrogram', createUploadMiddleware(), handleVisualization(generateSpectrogram));
};

module.exports = { setupRoutes };