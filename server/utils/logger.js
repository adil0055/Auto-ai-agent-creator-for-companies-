/**
 * Structured Logger
 * Production-grade logging with levels, timestamps, and context
 */

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

let currentLevel = 'info';

function setLogLevel(level) {
  if (!LOG_LEVELS.hasOwnProperty(level)) {
    throw new Error(`Invalid log level: ${level}`);
  }
  currentLevel = level;
}

function shouldLog(level) {
  return LOG_LEVELS[level] <= LOG_LEVELS[currentLevel];
}

function formatMessage(level, message, context = {}) {
  const timestamp = new Date().toISOString();
  const contextStr = Object.keys(context).length > 0 
    ? ` ${JSON.stringify(context)}` 
    : '';
  
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}

function error(message, context = {}) {
  if (shouldLog('error')) {
    console.error(formatMessage('error', message, context));
  }
}

function warn(message, context = {}) {
  if (shouldLog('warn')) {
    console.warn(formatMessage('warn', message, context));
  }
}

function info(message, context = {}) {
  if (shouldLog('info')) {
    console.log(formatMessage('info', message, context));
  }
}

function debug(message, context = {}) {
  if (shouldLog('debug')) {
    console.log(formatMessage('debug', message, context));
  }
}

module.exports = {
  setLogLevel,
  error,
  warn,
  info,
  debug,
};
