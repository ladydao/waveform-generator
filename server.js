const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const app = express();

// Configuration
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = 'uploads/';
const OUTPUT_DIR = 'output/';
const FILE_SIZE_LIMIT = 100 * 1024 * 1024; // 100MB
const ALLOWED_MIME_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg'];

// Ensure directories exist
const ensureDirectoriesExist = async () => {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
};

// Pure functions
const generateRandomFileName = () => `${crypto.randomBytes(16).toString('hex')}.png`;

const createUploadMiddleware = () => multer({
  dest: UPLOAD_DIR,
  limits: { fileSize: FILE_SIZE_LIMIT },
  fileFilter: (req, file, cb) => {
    cb(null, ALLOWED_MIME_TYPES.includes(file.mimetype));
  }
}).single('audio');

const generateWaveformCommand = (inputFile, outputFile) => `
  ffmpeg -i ${inputFile} -filter_complex "
    aformat=channel_layouts=stereo|mono,
    pan=mono|c0=.5*c0+.5*c1,
    loudnorm=I=-16:TP=-1.5:LRA=11,
    compand=attacks=0:points=-80/-900|-45/-15|-27/-9|-5/-5|0/-2|20/-2:gain=5,
    aformat=channel_layouts=mono,
    showwavespic=s=1000x200:colors=#333333
  " -frames:v 1 ${outputFile}
`;

const generateSpectrogramCommand = (inputFile, outputFile) => `
  ffmpeg -i ${inputFile}  -lavfi "
    aformat=channel_layouts=mono,
    compand=attacks=0:points=-80/-900|-45/-15|-27/-9|-5/-5|0/-2|20/-2:gain=5,
    showspectrumpic=s=1000x300:scale=log:fscale=log:stop=8000:legend=0:legend=0,
    format=gray
  " -frames:v 1 ${outputFile}
`;

const executeCommand = (command) => new Promise((resolve, reject) => {
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

const cleanupFiles = async (...files) => {
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

// Route handlers
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
    
    // Check if the output file exists before sending
    await fs.access(outputFile);
    res.sendFile(outputFile, { root: __dirname });
  } catch (error) {
    console.error(`Error generating visualization: ${error.message}`);
    res.status(500).json({ error: 'Error generating visualization' });
  } finally {
    await cleanupFiles(inputFile, outputFile);
  }
};

// Express setup
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/generate-waveform', createUploadMiddleware(), handleGenerateVisualization(generateWaveformCommand));
app.post('/generate-spectrogram', createUploadMiddleware(), handleGenerateVisualization(generateSpectrogramCommand));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

// Start server
ensureDirectoriesExist()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to create necessary directories:', error);
    process.exit(1);
  });