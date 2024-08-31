const fs = require('fs').promises;
const logger = require('../logger');
const path = require('path');
const { OUTPUT_DIR } = require('../config');
const { generateFileNameFromHash, cleanupFiles, generateWaveform, generateSpectrogram } = require('../utils');
const HTTP_STATUS = { OK: 200, INTERNAL_SERVER_ERROR: 500 };

exports.handleVisualization = async (req, res) => {
  const inputFile = req.file.path;
  const outputFileName = await generateFileNameFromHash(inputFile) + ".png";
  const outputFile = path.join(OUTPUT_DIR, outputFileName);

  const generateFunction =
    req.body.visualizationType === 'waveform'
      ? generateWaveform
      : generateSpectrogram;

  try {
    await generateFunction(inputFile, outputFile);
    await fs.access(outputFile);
    logger.info(`Visualization generated: ${outputFile}`);
    res.sendFile(outputFile, { root: process.cwd() });
  } catch (error) {
    logger.error(`Error generating visualization: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Error generating visualization' });
  } finally {
    await cleanupFiles(inputFile, outputFile);
  }
};