const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PORT } = require('./config');
const { ensureDirectoriesExist } = require('./utils');
const { errorHandler } = require('./middleware');
const { setupRoutes } = require('./routes');

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