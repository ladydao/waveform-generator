const { generateWaveformCommand, executeCommand } = require('../utils');

exports.generateWaveform = async (inputFile, outputFile) => {
  const command = generateWaveformCommand(inputFile, outputFile);
  await executeCommand(command);
};