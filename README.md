# Audio Visualization Generator

Generate waveform and spectrogram from audio files.

## Prerequisites

- Node.js (v18 or later)
- FFmpeg

## Installation

1. Clone the repository:

   ```
   git clone git@github.com:ladydao/waveform-generator.git
   cd waveform-generator
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add the following (adjust as needed):

   ```
   PORT=3000
   UPLOAD_DIR=appdata/uploads/
   OUTPUT_DIR=appdata/output/
   FILE_SIZE_LIMIT=104857600
   ```

4. Start the server:

   ```
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.
