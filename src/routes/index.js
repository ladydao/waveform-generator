const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { OUTPUT_DIR } = require('../config');
const { generateRandomFileName, cleanupFiles, executeCommand } = require('../utils');
const { createUploadMiddleware } = require('../middleware');

const generateWaveform = async (inputFile, outputFile) => {
  const command = `
    ffmpeg -i ${inputFile} -filter_complex "
      aformat=channel_layouts=mono,
      compand=attacks=0:points=-80/-900|-45/-15|-27/-9|-5/-5|0/-2|20/-2:gain=5,
      showwavespic=s=1920x1080:colors=#333333
    " -frames:v 1 ${outputFile}
  `;
  await executeCommand(command);
};

const generateSpectrogram = async (inputFile, outputFile) => {
  const command = `
    ffmpeg -i ${inputFile} -lavfi "
      aformat=channel_layouts=mono,
      compand=attacks=0:points=-80/-900|-45/-15|-27/-9|-5/-5|0/-2|20/-2:gain=5,
      showspectrumpic=s=1920x1080:mode=separate:color=intensity:scale=log:
      fscale=log:stop=20000:start=20:gain=5:legend=0
    " -frames:v 1 ${outputFile}
  `;
  await executeCommand(command);
};

const handleGenerateVisualization = (generateFunction) => async (req, res) => {
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

  app.post('/generate-waveform', createUploadMiddleware(), handleGenerateVisualization(generateWaveform));
  app.post('/generate-spectrogram', createUploadMiddleware(), handleGenerateVisualization(generateSpectrogram));
};

module.exports = { setupRoutes };