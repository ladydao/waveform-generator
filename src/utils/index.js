const fs = require('fs').promises;
const crypto = require('crypto');
const { exec } = require('child_process');
const { UPLOAD_DIR, OUTPUT_DIR } = require('../config');

exports.ensureDirectoriesExist = async () => {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
};

exports.generateRandomFileName = () => `${crypto.randomBytes(16).toString('hex')}.png`;

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