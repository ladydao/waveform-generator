const { generateSpectrogramCommand, executeCommand } = require('../utils');

exports.generateSpectrogram = async (inputFile, outputFile) => {
  const command = generateSpectrogramCommand(inputFile, outputFile);
  await executeCommand(command);
};