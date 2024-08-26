const express = require('express');
const { PORT } = require('./config');
const { ensureDirectoriesExist } = require('./utils');
const { errorHandler } = require('./middleware');
const { setupRoutes } = require('./routes');

const app = express();

setupRoutes(app);

app.use(errorHandler);

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