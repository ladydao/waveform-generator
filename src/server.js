const express = require('express');
const helmet = require('helmet');
const { PORT } = require('./config');
const { ensureDirectoriesExist } = require('./utils');
const { errorHandler } = require('./middleware');
const { setupRoutes } = require('./routes');

const app = express();
setupRoutes(app);

app.use(helmet());
app.use(errorHandler);

ensureDirectoriesExist()
  .then(() => {
    const port = process.env.PORT || PORT;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to create necessary directories:', error);
    process.exit(1);
  });
