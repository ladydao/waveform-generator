const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { OUTPUT_DIR } = require('./config');
const { generateRandomFileName, generateWaveformCommand, generateSpectrogramCommand, executeCommand, cleanupFiles } = require('./utils');
const { createUploadMiddleware } = require('./middleware');

const handleGenerateVisualization = (generateCommand) => async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded' });
  }

  const inputFile = req.file.path;
  const outputFileName = generateRandomFileName();
  const outputFile = path.join(OUTPUT_DIR, outputFileName);

  try {
    const command = generateCommand(inputFile, outputFile);
    console.log('Executing command:', command);
    await executeCommand(command);
    
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
  app.use(express.static(process.cwd()));

  app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'index.html'));
  });

  app.post('/generate-waveform', createUploadMiddleware(), handleGenerateVisualization(generateWaveformCommand));
  app.post('/generate-spectrogram', createUploadMiddleware(), handleGenerateVisualization(generateSpectrogramCommand));
};

module.exports = { setupRoutes };