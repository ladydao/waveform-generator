const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Serve static files from the current directory
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/generate-waveform', upload.single('audio'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No audio file uploaded');
  }

  const inputFile = req.file.path;
  const outputFile = path.join('output', `${req.file.filename}.png`);

  // Ensure output directory exists
  if (!fs.existsSync('output')) {
    fs.mkdirSync('output');
  }

  // FFmpeg command to generate waveform
  const command = `ffmpeg -i ${inputFile} -filter_complex "aformat=channel_layouts=mono,showwavespic=s=1000x200" -frames:v 1 ${outputFile}`;

  exec(command, (error) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).send('Error generating waveform');
    }

    // Send the generated image
    res.sendFile(outputFile, { root: __dirname }, (err) => {
      if (err) {
        console.error(`Error sending file: ${err}`);
      }

      // Clean up temporary files
      fs.unlink(inputFile, (err) => {
        if (err) console.error(`Error deleting input file: ${err}`);
      });
      fs.unlink(outputFile, (err) => {
        if (err) console.error(`Error deleting output file: ${err}`);
      });
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});