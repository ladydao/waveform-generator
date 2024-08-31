const helmet = require("helmet")

exports.helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "https://cdn.tailwindcss.com"],
      "media-src": ["'self'", "blob:"],
      "img-src": ["'self'", "data:", "blob:"],
    },
  },
})
