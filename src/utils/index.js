const fs = require('fs').promises;
const crypto = require('crypto');
const { exec } = require('child_process');
const { UPLOAD_DIR, OUTPUT_DIR } = require('../config');

exports.generateRandomFileName = () => `${crypto.randomBytes(16).toString('hex')}.png`;

exports.generateFileNameFromHash = async (filePath) => {
  const fileBuffer = await fs.readFile(filePath);
  const hash = crypto.createHash('sha256');
  hash.update(fileBuffer);
  return `${hash.digest('hex')}`;
};

exports.ensureDirectoriesExist = async () => {
  await Promise.all([
    fs.mkdir(UPLOAD_DIR, { recursive: true }),
    fs.mkdir(OUTPUT_DIR, { recursive: true })
  ]);
};

exports.cleanupFiles = async (...files) => {
  await Promise.all(files.map(async (file) => {
    try {
      await fs.access(file);
      await fs.unlink(file);
      console.log(`File deleted: ${file}`);
    } catch (error) {
      console.error(`Error deleting file ${file}:`, error.message);
    }
  }));
};

const waveformParams = '-filter_complex "aformat=channel_layouts=mono,compand=attacks=0:points=-80/-900|-45/-15|-27/-9|-5/-5|0/-2|20/-2:gain=5,showwavespic=s=1920x1080:colors=#333333"'
const spectralParams = '-lavfi "aformat=channel_layouts=mono,compand=attacks=0:points=-80/-900|-45/-15|-27/-9|-5/-5|0/-2|20/-2:gain=5,showspectrumpic=s=1920x1080:mode=separate:color=intensity:scale=log:fscale=log:stop=20000:start=20:gain=5:legend=0"'

const generateVisualization = (inputFile, outputFile, params) => {
  return new Promise((resolve, reject) => {
    const command = `ffmpeg -i ${inputFile} ${params} -frames:v 1 ${outputFile}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Visualization generation error:', error);
        console.error('stderr:', stderr);
        reject(error);
      } else {
        console.log('Visualization generated successfully');
        console.log('stdout:', stdout);
        resolve();
      }
    });
  });
};

exports.generateWaveform = (inputFile, outputFile) => generateVisualization(inputFile, outputFile, waveformParams);
exports.generateSpectrogram = (inputFile, outputFile) => generateVisualization(inputFile, outputFile, spectralParams);
