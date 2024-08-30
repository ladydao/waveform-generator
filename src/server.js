const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs').promises;
const { PORT, UPLOAD_DIR, OUTPUT_DIR } = require('./config');
const { errorHandler } = require('./middleware');
const { setupRoutes } = require('./routes');
const logger = require('./logger');

const app = express();

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again later.',
});

// Apply rate limiting to all requests
app.use(limiter);

// Configure Helmet with custom Content Security Policy
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "https://cdn.tailwindcss.com"],
        "media-src": ["'self'", "blob:"],
        "img-src": ["'self'", "data:", "blob:"],
      },
    },
  })
);

setupRoutes(app);
app.use(errorHandler);

const ensureDirectoriesExist = async () => {
  try {
    await Promise.all([
      fs.mkdir(UPLOAD_DIR, { recursive: true }),
      fs.mkdir(OUTPUT_DIR, { recursive: true })
    ]);
    logger.info('Directories created successfully');
  } catch (error) {
    logger.error('Failed to create necessary directories:', error);
    throw error;
  }
};

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