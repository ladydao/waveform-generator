const express = require('express');
const logger = require('./logger');
const { PORT } = require('./config');
const { setupRoutes } = require('./routes');
const { limiter } = require('./middleware/rateLimit');
const { helmetConfig } = require('./middleware/helmet');
const { ensureDirectoriesExist } = require('./utils');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
app.use(helmetConfig);
app.use(limiter);
setupRoutes(app);
app.use(errorHandler);

const startServer = async () => {
  try {
    await ensureDirectoriesExist();
    const port = process.env.PORT || PORT;
    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};
startServer();

module.exports = app;