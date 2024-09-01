const fs = require('fs').promises;
const crypto = require('crypto');
const { exec } = require('child_process');
const { UPLOAD_DIR, OUTPUT_DIR } = require('../config');
const logger = require('../logger');

/**
 * @notice Ensures that the upload and output directories exist
 * @dev Creates the directories if they don't exist
 * @return {Promise<void>} A promise that resolves when the directories are created
 * @throws {Error} If there's an issue creating the directories
 */
exports.ensureDirectoriesExist = async () => {
  try {
    await Promise.all([
      fs.mkdir(UPLOAD_DIR, { recursive: true }),
      fs.mkdir(OUTPUT_DIR, { recursive: true }),
      fs.mkdir(LOG_DIR, { recursive: true })
    ]);
    logger.info('Directories created successfully');
  } catch (error) {
    logger.error('Failed to create necessary directories:', error);
    throw error;
  }
};

/**
 * @notice Generates a random file name with a .png extension
 * @return {string} A randomly generated file name
 */
exports.generateRandomFileName = () => `${crypto.randomBytes(16).toString('hex')}.png`;

/**
 * @notice Generates a file name based on the hash of the file contents
 * @param {string} filePath - The path to the file
 * @return {string} A file name string.
 */
exports.generateFileNameFromHash = async (filePath) => {
  const fileBuffer = await fs.readFile(filePath);
  const hash = crypto.createHash('sha256');
  hash.update(fileBuffer);
  return `${hash.digest('hex').substring(0, 16)}`;
};

/**
 * @notice Ensures that the upload and output directories exist
 * @dev Creates the directories if they don't exist
 * @return {Promise<void>} A promise that resolves when the directories are created
 */
exports.ensureDirectoriesExist = async () => {
  try {
    await Promise.all([
      fs.mkdir(UPLOAD_DIR, { recursive: true }),
      fs.mkdir(OUTPUT_DIR, { recursive: true })
    ]);
    logger.info('Directories created successfully');
  } catch (error) {
    logger.error('Error creating directories:', error);
    throw error;
  }
};

/**
 * @notice Cleans up (deletes) the specified files
 * @param {...string} files - The file paths to be deleted
 * @return {Promise<void>} A promise that resolves when all files are deleted
 */
exports.cleanupFiles = async (...files) => {
  await Promise.all(files.map(async (file) => {
    try {
      await fs.access(file);
      await fs.unlink(file);
      logger.info(`File deleted: ${file}`);
    } catch (error) {
      logger.error(`Error deleting file ${file}:`, error);
    }
  }));
};

/**
 * @notice Generates a visualization using FFmpeg
 * @param {string} inputFile - The path to the input audio file
 * @param {string} outputFile - The path to save the output image
 * @param {string} params - The FFmpeg parameters for the visualization
 * @return {Promise<void>} A promise that resolves when the visualization is generated
 */
const generateVisualization = (inputFile, outputFile, params) => {
  return new Promise((resolve, reject) => {
    const command = `ffmpeg -i ${inputFile} ${params} -frames:v 1 ${outputFile}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        logger.error('Visualization generation error:', error);
        logger.error('stderr:', stderr);
        reject(error);
      } else {
        logger.info('Visualization generated successfully');
        logger.debug('stdout:', stdout);
        resolve();
      }
    });
  });
};

// FFmpeg parameters for waveform and spectrogram visualizations
const waveformParams = '-filter_complex "aformat=channel_layouts=mono,compand=attacks=0:points=-80/-900|-45/-15|-27/-9|-5/-5|0/-2|20/-2:gain=5,showwavespic=s=1920x1080:colors=#333333"';
const spectralParams = '-lavfi "aformat=channel_layouts=mono,compand=attacks=0:points=-80/-900|-45/-15|-27/-9|-5/-5|0/-2|20/-2:gain=5,showspectrumpic=s=1920x1080:mode=separate:color=intensity:scale=log:fscale=lin:stop=20000:start=20:gain=5:legend=0"';

/**
 * @notice Generates a waveform visualization of an audio file
 * @param {string} inputFile - The path to the input audio file
 * @param {string} outputFile - The path to save the output image
 * @return {Promise<void>} A promise that resolves when the waveform is generated
 */
exports.generateWaveform = (inputFile, outputFile) => generateVisualization(inputFile, outputFile, waveformParams);

/**
 * @notice Generates a spectrogram visualization of an audio file
 * @param {string} inputFile - The path to the input audio file
 * @param {string} outputFile - The path to save the output image
 * @return {Promise<void>} A promise that resolves when the spectrogram is generated
 */
exports.generateSpectrogram = (inputFile, outputFile) => generateVisualization(inputFile, outputFile, spectralParams);