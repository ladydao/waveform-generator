const fs = require('fs').promises;
const crypto = require('crypto');
const { exec } = require('child_process');
const { UPLOAD_DIR, OUTPUT_DIR } = require('../config');

exports.ensureDirectoriesExist = async () => {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
};

exports.generateRandomFileName = () => `${crypto.randomBytes(16).toString('hex')}.png`;

exports.generateWaveformCommand = (inputFile, outputFile) => `
  ffmpeg -i ${inputFile} -filter_complex "
    aformat=channel_layouts=stereo|mono,
    pan=mono|c0=.5*c0+.5*c1,
    loudnorm=I=-16:TP=-1.5:LRA=11,
    compand=attacks=0:points=-80/-900|-45/-15|-27/-9|-5/-5|0/-2|20/-2:gain=5,
    aformat=channel_layouts=mono,
    showwavespic=s=1000x200:colors=#333333
  " -frames:v 1 ${outputFile}
`;

exports.generateSpectrogramCommand = (inputFile, outputFile) => `
  ffmpeg -i ${inputFile}  -lavfi "
    aformat=channel_layouts=mono,
    compand=attacks=0:points=-80/-900|-45/-15|-27/-9|-5/-5|0/-2|20/-2:gain=5,
    showspectrumpic=s=1000x300:scale=log:fscale=log:stop=8000:legend=0,
    format=gray
  " -frames:v 1 ${outputFile}
`;

exports.executeCommand = (command) => new Promise((resolve, reject) => {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Command execution error:', error);
      console.error('stderr:', stderr);
      reject(error);
    } else {
      console.log('Command executed successfully');
      console.log('stdout:', stdout);
      resolve();
    }
  });
});

exports.cleanupFiles = async (...files) => {
  for (const file of files) {
    try {
      await fs.access(file);
      await fs.unlink(file);
      console.log(`File deleted: ${file}`);
    } catch (error) {
      console.error(`Error deleting file ${file}:`, error.message);
    }
  }
};