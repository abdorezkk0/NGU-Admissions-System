const morgan = require('morgan');
const config = require('../config/environment');

// Custom token for response time in milliseconds
morgan.token('response-time-ms', (req, res) => {
  if (!req._startAt || !res._startAt) {
    return '';
  }

  const ms = (res._startAt[0] - req._startAt[0]) * 1000 +
             (res._startAt[1] - req._startAt[1]) / 1000000;

  return ms.toFixed(3);
});

// Development format: colored and detailed
const developmentFormat = ':method :url :status :response-time ms - :res[content-length]';

// Production format: combined with timestamp
const productionFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

const logger = config.NODE_ENV === 'development'
  ? morgan(developmentFormat)
  : morgan(productionFormat);

module.exports = logger;