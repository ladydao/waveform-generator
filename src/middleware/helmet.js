const helmet = require('helmet');

const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "https://cdn.tailwindcss.com"],
            "media-src": ["'self'", "blob:"],
            "img-src": ["'self'", "data:", "blob:"],
        },
    },
});

module.exports = helmetConfig;