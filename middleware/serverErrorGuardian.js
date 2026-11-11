const { extractClientIp } = require('./logger');
const { emitLogEvent, appendLogLine } = require('./logWriter');
const {
  KNOWN_ROUTES,
  escapeHtml,
  shouldRenderHtml,
  renderGuardianScreen
} = require('./guardianShared');

const STATUS_LABELS = {
  500: '500 Internal Server Error',
  502: '502 Bad Gateway',
  503: '503 Service Unavailable',
  504: '504 Gateway Timeout'
};

const DB_CONN_ERROR_CODES = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'ENOTFOUND',
  '57P01',
  '57P02',
  '57P03',
  '08001',
  '08006'
]);

const PG_SCHEMA_ERROR_CODES = new Set(['42P01', '42703', '42P07']);
const PG_QUERY_PREFIXES = ['22', '23', '42'];

const SERVER_THEME = {
  accentColor: '#991b1b',
  borderColor: '#fca5a5',
  badgeBg: '#fef2f2',
  badgeTextColor: '#7f1d1d',
  reasonBg: '#fef2f2',
  reasonBorder: '#dc2626',
  reasonLabelColor: '#991b1b',
  reasonTextColor: '#450a0a'
};

/**
 * Generates a compact incident reference ID for correlating terminal logs and UI screens.
 */
function generateIncidentId() {
  const timePart = Date.now().toString(36).toUpperCase();
  const randPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ERR-${timePart}-${randPart}`;
}

/**
 * Resolves the HTTP 5xx status code for a given error instance.
 */
function resolveServerStatusCode(err) {
  const explicit = Number(err?.statusCode ?? err?.status);
  if (Number.isInteger(explicit) && explicit >= 500 && explicit <= 599) {
    return explicit;
  }
  const code = String(err?.code || '').toUpperCase();
  if (DB_CONN_ERROR_CODES.has(code)) {
    return 503;
  }
  return 500;
}

/**
 * Returns true if the error falls within 5xx handling (not an explicit 1xx-4xx error).
 */
function is5xxError(err) {
  if (!err) return false;
  const explicit = Number(err.statusCode ?? err.status);
  if (Number.isInteger(explicit) && explicit >= 100 && explicit < 500) {
    return false;
  }
  return true;
}

/**
 * Classifies server/runtime/database errors into clear reasons and troubleshooting actions.
 */
function classifyErrorCause(err, statusCode, operationLabel) {
  const errCode = String(err?.code || '').toUpperCase();
  const errMessage = String(err?.message || '').trim() || 'An unexpected server fault occurred.';
  const opPrefix = operationLabel ? `While "${operationLabel}": ` : '';

  if (DB_CONN_ERROR_CODES.has(errCode)) {
    return {
      code: 'DB_CONNECTION_ERROR',
      title: 'Database Service Unavailable',
      error: 'Database connection error',
      reason: `${opPrefix}PostgreSQL could not be reached (${errCode}: ${errMessage}).`,
      tips: [
        'Verify the PostgreSQL service or Docker "db" container is running.',
        'Check DATABASE_URL credentials and port configuration in .env or docker-compose.yml.',
        'Inspect /api/health to verify application liveness.'
      ],
      suggestion: { label: 'Check API Health Endpoint', href: '/api/health' }
    };
  }

  if (PG_SCHEMA_ERROR_CODES.has(errCode)) {
    return {
      code: 'DB_SCHEMA_ERROR',
      title: 'Database Schema or Table Missing',
      error: 'Database schema error',
      reason: `${opPrefix}PostgreSQL reported a missing table or column (${errCode}: ${errMessage}).`,
      tips: [
        'Execute pending SQL migrations via "npm run migrate".',
        'If using Docker with an existing volume, check whether migrations in migrations/ were applied.'
      ],
      suggestion: { label: 'Return to Home Portal', href: '/' }
    };
  }

  if (PG_QUERY_PREFIXES.some((prefix) => errCode.startsWith(prefix))) {
    const detailPart = err?.detail ? ` — ${err.detail}` : '';
    return {
      code: 'DB_QUERY_FAILURE',
      title: 'Database Query Execution Failed',
      error: 'Database query error',
      reason: `${opPrefix}Database query rejected (${errCode}: ${errMessage}${detailPart}).`,
      tips: [
        'Review submitted field types, foreign keys, or constraint definitions.',
        'Check server terminal logs with the Incident ID for the failing query.'
      ],
      suggestion: { label: 'Return to Home Portal', href: '/' }
    };
  }

  if (errCode === 'ENOENT' || /template|view|\.html/i.test(errMessage)) {
    return {
      code: 'VIEW_TEMPLATE_ERROR',
      title: 'View Rendering Failure',
      error: 'View template error',
      reason: `${opPrefix}Could not load or render a required HTML view template (${errMessage}).`,
      tips: [
        'Ensure all HTML templates exist under the views/ and public/ directories.',
        'Verify View class placeholders match the HTML template file.'
      ],
      suggestion: { label: 'Return to Home Portal', href: '/' }
    };
  }

  if (statusCode === 502) {
    return {
      code: 'BAD_GATEWAY',
      title: 'Bad Upstream Gateway Response',
      error: 'Bad Gateway',
      reason: `${opPrefix}An upstream service returned an invalid response (${errMessage}).`,
      tips: ['Retry the request shortly or verify upstream service status.'],
      suggestion: { label: 'Check API Health Endpoint', href: '/api/health' }
    };
  }

  if (statusCode === 503) {
    return {
      code: 'SERVICE_UNAVAILABLE',
      title: 'Service Temporarily Unavailable',
      error: 'Service Unavailable',
      reason: `${opPrefix}The server is temporarily unable to handle the request (${errMessage}).`,
      tips: ['Wait a moment and retry, or check container/database readiness.'],
      suggestion: { label: 'Check API Health Endpoint', href: '/api/health' }
    };
  }

  if (statusCode === 504) {
    return {
      code: 'GATEWAY_TIMEOUT',
      title: 'Server Operation Timed Out',
      error: 'Gateway Timeout',
      reason: `${opPrefix}The operation exceeded its allowed execution window (${errMessage}).`,
      tips: ['Check slow database queries or retry the operation.'],
      suggestion: { label: 'Check API Health Endpoint', href: '/api/health' }
    };
  }

  return {
    code: 'INTERNAL_SERVER_ERROR',
    title: 'Unexpected Server Error',
    error: 'Internal Server Error',
    reason: `${opPrefix}${err?.name ? `${err.name}: ` : ''}${errMessage}`,
    tips: [
      'Use the Incident ID below to locate full details in the server terminal logs.',
      'Verify PostgreSQL connectivity and recent route/controller changes.'
    ],
    suggestion: { label: 'Return to Home Portal', href: '/' }
  };
}

/**
 * Produces a complete 5xx diagnostic descriptor for UI rendering, JSON APIs, and terminal logging.
 */
function diagnoseServerError(err, req, overrides = {}) {
  const statusCode = resolveServerStatusCode(err);
  const statusLabel = STATUS_LABELS[statusCode] || `${statusCode} Server Error`;
  const incidentId = overrides.incidentId || generateIncidentId();
  const method = String(req?.method || 'GET').toUpperCase();
  const requestedPath = req?.originalUrl || req?.url || '/';
  const timestamp = new Date().toISOString();
  const clientIp = extractClientIp(req);
  const operation = overrides.operation || null;

  const classified = classifyErrorCause(err, statusCode, operation);
  const includeStack = typeof overrides.includeStack === 'boolean'
    ? overrides.includeStack
    : process.env.NODE_ENV !== 'production';

  return {
    statusCode,
    statusLabel,
    incidentId,
    operation,
    errorName: err?.name || 'Error',
    errorCode: err?.code ? String(err.code) : '-',
    code: overrides.code || classified.code,
    title: overrides.title || classified.title,
    error: overrides.error || classified.error,
    reason: overrides.reason || classified.reason,
    tips: Array.isArray(overrides.tips) ? overrides.tips : classified.tips,
    stack: includeStack && err?.stack ? String(err.stack) : null,
    suggestion: overrides.suggestion || classified.suggestion,
    backHref: overrides.backHref || classified.suggestion.href,
    backLabel: overrides.backLabel || `← ${classified.suggestion.label}`,
    requested: {
      method,
      path: requestedPath,
      clientIp,
      timestamp
    },
    availableRoutes: KNOWN_ROUTES.map(({ path, label, methods }) => ({
      path,
      label,
      methods
    }))
  };
}

/**
 * Renders the 5xx Guardian HTML diagnostic screen using the shared Guardian shell.
 */
function renderServerErrorHtml(diagnostic) {
  const tipItems = (diagnostic.tips || [])
    .map((tip) => `<li>${escapeHtml(tip)}</li>`)
    .join('');

  const tipsSection = tipItems
    ? `<div class="tips-box">
      <h3>Recommended Troubleshooting Steps</h3>
      <ul>${tipItems}</ul>
    </div>`
    : '';

  const stackSection = diagnostic.stack
    ? `<details class="stack-details">
      <summary>Technical Stack Trace (Non-Production Debug View)</summary>
      <pre>${escapeHtml(diagnostic.stack)}</pre>
    </details>`
    : '';

  const extraDiagItems = [
    { key: 'Incident ID', value: diagnostic.incidentId },
    { key: 'Error Type / Code', value: `${diagnostic.errorName} (${diagnostic.errorCode})` }
  ];
  if (diagnostic.operation) {
    extraDiagItems.push({ key: 'Failed Operation', value: diagnostic.operation });
  }

  return renderGuardianScreen({
    statusCode: diagnostic.statusCode,
    statusLabel: diagnostic.statusLabel,
    badgeText: `🚨 ${diagnostic.statusCode} SERVER GUARDIAN`,
    theme: SERVER_THEME,
    title: diagnostic.title,
    code: diagnostic.code,
    reason: diagnostic.reason,
    suggestion: diagnostic.suggestion,
    backHref: diagnostic.backHref,
    backLabel: diagnostic.backLabel,
    requested: diagnostic.requested,
    extraDiagItems,
    extraSectionHtml: `${tipsSection}\n    ${stackSection}`
  });
}

/**
 * Sends a 5xx Guardian response (styled HTML or structured JSON) and logs incident details.
 */
function sendServerError(req, res, err, overrides = {}) {
  const diagnostic = diagnoseServerError(err, req, overrides);
  const summaryLine = `[5XX GUARDIAN] ${diagnostic.incidentId} | ${diagnostic.statusCode} | ${diagnostic.code} | ${diagnostic.requested.method} ${diagnostic.requested.path} | ${diagnostic.reason}`;

  emitLogEvent(summaryLine, {
    customSink: overrides.logError,
    defaultConsoleFn: (line) => console.error(line),
    logFilePath: overrides.logFilePath,
    disableFileLog: overrides.disableFileLog
  });

  const hasCustomSink = typeof overrides.logError === 'function';
  const fileDisabled = typeof overrides.disableFileLog === 'boolean'
    ? overrides.disableFileLog
    : (hasCustomSink && !overrides.logFilePath);
  if (!fileDisabled && diagnostic.stack) {
    const compactStack = diagnostic.stack.replace(/\r?\n\s*/g, ' <- ');
    appendLogLine(`[5XX STACK] ${diagnostic.incidentId} | ${compactStack}`, {
      logFilePath: overrides.logFilePath
    });
  }

  if (shouldRenderHtml(req)) {
    return res.status(diagnostic.statusCode).send(renderServerErrorHtml(diagnostic));
  }

  const payload = {
    error: diagnostic.error,
    statusCode: diagnostic.statusCode,
    code: diagnostic.code,
    incidentId: diagnostic.incidentId,
    operation: diagnostic.operation,
    reason: diagnostic.reason,
    suggestion: diagnostic.suggestion,
    requested: diagnostic.requested,
    availableRoutes: diagnostic.availableRoutes
  };

  if (diagnostic.stack) {
    payload.stack = diagnostic.stack;
  }

  return res.status(diagnostic.statusCode).json(payload);
}

/**
 * Creates an Express 5xx error-handling middleware (err, req, res, next).
 */
function createServerErrorGuardian(options = {}) {
  return function serverErrorGuardianMiddleware(err, req, res, next) {
    if (!is5xxError(err) || res.headersSent) {
      return next(err);
    }
    return sendServerError(req, res, err, options);
  };
}

const serverErrorGuardian = createServerErrorGuardian();

module.exports = {
  serverErrorGuardian,
  createServerErrorGuardian,
  sendServerError,
  diagnoseServerError,
  renderServerErrorHtml,
  resolveServerStatusCode,
  is5xxError
};
