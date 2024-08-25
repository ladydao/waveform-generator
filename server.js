const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const e = require('express');

const app = express();

// Set up multer with file size limit and file filter
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP3, WAV, and OGG are allowed.'));
    }
  }
});

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/generate-waveform', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded' });
  }

  const inputFile = req.file.path;
  const outputFileName = `${crypto.randomBytes(16).toString('hex')}.png`;
  const outputFile = path.join('output', outputFileName);

  try {
    await fs.mkdir('output', { recursive: true });

    await new Promise((resolve, reject) => {
      const command = `ffmpeg -i ${inputFile} -filter_complex "
        aformat=channel_layouts=stereo|mono,
        pan=mono|c0=.5*c0+.5*c1,
        loudnorm=I=-16:TP=-1.5:LRA=11,
        compand=attacks=0:points=-80/-900|-45/-15|-27/-9|-5/-5|0/-2|20/-2:gain=5,
        aformat=channel_layouts=mono,
        showwavespic=s=1000x200:colors=#333333
      " -frames:v 1 ${outputFile}`;
      exec(command, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    res.sendFile(outputFile, { root: __dirname });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    res.status(500).json({ error: 'Error generating waveform' });
  } finally {
    // Clean up files
    try {
      await fs.unlink(inputFile);
      await fs.unlink(outputFile);
    } catch (error) {
      console.error(`Error deleting files: ${error.message}`);
    }
  }
});

app.post('/generate-spectrogram', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded' });
  }

  const inputFile = req.file.path;
  const outputFileName = `${crypto.randomBytes(16).toString('hex')}.png`;
  const outputFile = path.join('output', outputFileName);

  try {
    await fs.mkdir('output', { recursive: true });
    console.log('Output directory created');

    await new Promise((resolve, reject) => {
      const command = `ffmpeg -i ${inputFile} -af aformat=channel_layouts=mono,loudnorm=I=-23:LRA=7 -lavfi showspectrumpic=s=1000x300:legend=0:fscale=log,format=gray ${outputFile}`;
      console.log('Executing command:', command);
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('FFmpeg error:', error);
          console.error('FFmpeg stderr:', stderr);
          reject(error);
        } else {
          console.log('FFmpeg command executed successfully');
          resolve();
        }
      });
    });

    console.log('Sending file:', outputFile);
    res.sendFile(outputFile, { root: __dirname });
  } catch (error) {
    console.error(`Error generating spectrogram: ${error.message}`);
    res.status(500).json({ error: 'Error generating spectrogram' });
  } finally {
    // Clean up files
    try {
      await fs.unlink(inputFile);
      await fs.unlink(outputFile);
      console.log('Files cleaned up');
    } catch (error) {
      console.error(`Error deleting files: ${error.message}`);
    }
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});