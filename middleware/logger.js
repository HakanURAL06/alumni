const { stripAnsi, emitLogEvent } = require('./logWriter');

const STATUS_COLORS = {
  success: '\x1b[32m',
  redirect: '\x1b[36m',
  clientError: '\x1b[33m',
  serverError: '\x1b[31m',
  reset: '\x1b[0m'
};

/**
 * Strips control characters to prevent log injection or unintended ANSI escapes.
 */
function sanitizeLogValue(value, fallback = '-') {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const cleaned = stripAnsi(value)
    .replace(/[\r\n\x00-\x1f\x7f]/g, '')
    .trim();
  return cleaned || fallback;
}

/**
 * Extracts normalized MIME media type from the response Content-Type header.
 */
function extractResponseType(res) {
  const raw = typeof res?.getHeader === 'function'
    ? res.getHeader('content-type')
    : res?.headers?.['content-type'];
  if (!raw) {
    return '-';
  }
  const first = Array.isArray(raw) ? raw[0] : String(raw);
  return sanitizeLogValue(first.split(';')[0], '-');
}

/**
 * Extracts formatted byte length from the response Content-Length header when set.
 */
function extractContentLength(res) {
  const raw = typeof res?.getHeader === 'function'
    ? res.getHeader('content-length')
    : res?.headers?.['content-length'];
  if (raw === undefined || raw === null || raw === '') {
    return '-';
  }
  const bytes = Number(raw);
  return Number.isFinite(bytes) && bytes >= 0 ? `${bytes}B` : '-';
}

/**
 * Resolves the client IP address while normalizing IPv6-mapped IPv4 addresses.
 */
function extractClientIp(req) {
  const forwarded = req?.headers?.['x-forwarded-for'];
  const firstForwarded = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : '';
  const rawIp = firstForwarded || req?.ip || req?.socket?.remoteAddress || '-';
  return sanitizeLogValue(rawIp, '-').replace(/^::ffff:/, '');
}

/**
 * Calculates elapsed request duration in milliseconds from high-resolution monotonic time.
 */
function formatDuration(startTimeNs) {
  const elapsedMs = Number(process.hrtime.bigint() - startTimeNs) / 1e6;
  return `${elapsedMs.toFixed(2)}ms`;
}

/**
 * Formats HTTP status code (or aborted state) with optional TTY ANSI colorization.
 */
function formatStatus(statusCode, aborted, useColors) {
  const code = Number.isInteger(statusCode) ? statusCode : 0;
  const label = aborted ? `ABORTED(${code || '-'})` : String(code || '-');

  if (!useColors) {
    return label;
  }

  let color = STATUS_COLORS.success;
  if (aborted || code >= 500) {
    color = STATUS_COLORS.serverError;
  } else if (code >= 400) {
    color = STATUS_COLORS.clientError;
  } else if (code >= 300) {
    color = STATUS_COLORS.redirect;
  }

  return `${color}${label}${STATUS_COLORS.reset}`;
}

/**
 * Formats a structured terminal log row containing timestamp, method, route,
 * response status, response MIME type, duration, payload size, and client IP.
 */
function formatLogEntry({
  timestamp,
  method,
  route,
  statusCode,
  aborted,
  responseType,
  contentLength,
  duration,
  clientIp,
  useColors
}) {
  const formattedMethod = sanitizeLogValue(method, 'UNKNOWN').toUpperCase().padEnd(6);
  const formattedRoute = sanitizeLogValue(route, '/');
  const formattedStatus = formatStatus(statusCode, aborted, useColors);

  return `[${timestamp}] ${formattedMethod} ${formattedRoute} | ${formattedStatus} | ${responseType} | ${duration} | ${contentLength} | ${clientIp}`;
}

/**
 * Creates an Express logger middleware that writes one terminal row per request
 * after the response finishes or the client connection closes prematurely.
 *
 * @param {object} [options]
 * @param {(line: string) => void} [options.write] - Terminal output sink (defaults to console.log)
 * @param {string} [options.logFilePath] - Target log file path (defaults to logs/error.logs)
 * @param {boolean} [options.disableFileLog] - Disable writing to file when true
 * @param {boolean} [options.useColors] - Force ANSI status colors on/off (defaults to TTY check)
 * @param {(req: object, res: object) => boolean} [options.skip] - Return true to skip logging a request
 * @returns {Function} Express middleware (req, res, next)
 */
function createLogger(options = {}) {
  const write = (line) => emitLogEvent(line, {
    customSink: options.write,
    defaultConsoleFn: (msg) => console.log(msg),
    logFilePath: options.logFilePath,
    disableFileLog: options.disableFileLog
  });
  const useColors = typeof options.useColors === 'boolean'
    ? options.useColors
    : Boolean(process.stdout.isTTY && !process.env.NO_COLOR);
  const skip = typeof options.skip === 'function' ? options.skip : null;

  return function requestLogger(req, res, next) {
    const startTimeNs = process.hrtime.bigint();
    let hasLogged = false;

    const emitLog = (aborted) => {
      if (hasLogged) {
        return;
      }
      hasLogged = true;

      if (skip && skip(req, res)) {
        return;
      }

      const line = formatLogEntry({
        timestamp: new Date().toISOString(),
        method: req?.method,
        route: req?.originalUrl || req?.url,
        statusCode: res?.statusCode,
        aborted,
        responseType: extractResponseType(res),
        contentLength: extractContentLength(res),
        duration: formatDuration(startTimeNs),
        clientIp: extractClientIp(req),
        useColors
      });

      write(line);
    };

    if (res && typeof res.on === 'function') {
      res.on('finish', () => emitLog(false));
      res.on('close', () => {
        if (!hasLogged) {
          emitLog(!res.writableFinished);
        }
      });
    }

    if (typeof next === 'function') {
      next();
    }

    if (!res || typeof res.on !== 'function') {
      emitLog(false);
    }
  };
}

const logger = createLogger();

module.exports = {
  logger,
  createLogger,
  formatLogEntry,
  extractResponseType,
  extractContentLength,
  extractClientIp
};
