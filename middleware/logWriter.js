const fs = require('fs');
const path = require('path');

const DEFAULT_LOG_FILE_PATH = path.resolve(__dirname, '..', 'logs', 'error.logs');
const ANSI_ESCAPE_REGEX = /\x1b\[[0-9;?]*[ -/]*[@-~]/g;
const ISO_PREFIX_REGEX = /^\[\d{4}-\d{2}-\d{2}T/;

/**
 * Removes ANSI terminal color codes from log output before writing to disk.
 */
function stripAnsi(value) {
  return String(value ?? '').replace(ANSI_ESCAPE_REGEX, '');
}

/**
 * Formats a single plain-text line guaranteed to start with an ISO timestamp and end cleanly.
 */
function formatFileLogLine(line) {
  const plain = stripAnsi(line).replace(/[\r\n]+$/g, '');
  if (!plain) {
    return '';
  }
  const withTimestamp = ISO_PREFIX_REGEX.test(plain)
    ? plain
    : `[${new Date().toISOString()}] ${plain}`;
  return `${withTimestamp}\n`;
}

/**
 * Appends a sanitized log line to the target log file (defaults to logs/error.logs).
 * Ensures the parent directory exists and fails safely without breaking HTTP responses.
 */
function appendLogLine(line, options = {}) {
  const filePath = options.logFilePath || process.env.ERROR_LOG_PATH || DEFAULT_LOG_FILE_PATH;
  const formatted = formatFileLogLine(line);
  if (!formatted) {
    return false;
  }

  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.appendFileSync(filePath, formatted, 'utf8');
    return true;
  } catch (_err) {
    return false;
  }
}

/**
 * Emits a log line to both the terminal sink and the persistent log file.
 */
function writeDualLog(line, { consoleFn = console.log, logFilePath, disableFileLog = false } = {}) {
  if (typeof consoleFn === 'function') {
    consoleFn(line);
  }
  if (!disableFileLog) {
    appendLogLine(line, { logFilePath });
  }
}

/**
 * Resolves custom vs default terminal sink and writes persistently to logs/error.logs
 * (unless explicitly disabled or using a custom unit-test sink without logFilePath).
 */
function emitLogEvent(line, { customSink, defaultConsoleFn = console.log, logFilePath, disableFileLog } = {}) {
  const hasCustomSink = typeof customSink === 'function';
  const shouldDisableFile = typeof disableFileLog === 'boolean'
    ? disableFileLog
    : (hasCustomSink && !logFilePath);
  const consoleFn = hasCustomSink ? customSink : defaultConsoleFn;

  writeDualLog(line, {
    consoleFn,
    logFilePath,
    disableFileLog: shouldDisableFile
  });
}

module.exports = {
  DEFAULT_LOG_FILE_PATH,
  stripAnsi,
  formatFileLogLine,
  appendLogLine,
  writeDualLog,
  emitLogEvent
};
