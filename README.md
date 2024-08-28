# Audio Visualization Generator

Generate beautiful waveform and spectrogram visualizations from your audio files.

## Features

- Upload audio files (MP3, WAV, OGG) up to 100MB
- Generate waveform or spectrogram visualizations
- Preview uploaded audio with built-in audio player
- Download high-quality PNG visualizations
- Responsive web interface

## Tech Stack

- Backend: Node.js with Express
- Frontend: JavaScript, Tailwind
- Audio Processing: FFmpeg

## Prerequisites

- Node.js (v14 or later)
- FFmpeg installed on your system

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/ladydao/audio-visualization-generator.git
   cd audio-visualization-generator
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add the following (adjust as needed):
   ```
   PORT=3000
   UPLOAD_DIR=uploads/
   OUTPUT_DIR=output/
   FILE_SIZE_LIMIT=104857600
   ```

4. Start the server:
   ```
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Click on the upload area or drag and drop an audio file
2. Choose between waveform or spectrogram visualization
3. Click "Generate Visualization"
4. Once generated, you can view and download the visualization

## Project Structure

```
waveform-generator/
├── src/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── server.js
├── public/
│   ├── css/
│   ├── js/
│   └── index.html
├── uploads/
├── output/
├── tests/
├── .env
└── package.json
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.

## Acknowledgements

- FFmpeg for audio processing
- Tailwind CSS for styling
- Express.js for the backend framework