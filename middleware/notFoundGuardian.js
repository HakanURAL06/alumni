const NotFoundView = require('../views/NotFoundView');
const { extractClientIp } = require('./logger');
const { emitLogEvent } = require('./logWriter');
const {
  KNOWN_ROUTES,
  escapeHtml,
  normalizePath,
  shouldRenderHtml
} = require('./guardianShared');

const ALLOWED_REDIRECT_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']);
const GENERIC_404_PATHS = new Set(['/404', '/404.html']);

const PARAMETERIZED_ROUTE_METHODS = [
  { pattern: '/users/:id', regex: /^\/users\/[^/]+$/i, methods: ['GET', 'PUT', 'PATCH', 'DELETE'], fallbackHref: '/users', label: 'Alumni Profile' },
  { pattern: '/users/:id/edit', regex: /^\/users\/[^/]+\/edit$/i, methods: ['GET', 'POST'], fallbackHref: '/users', label: 'Edit Alumni Profile' },
  { pattern: '/users/:id/delete', regex: /^\/users\/[^/]+\/delete$/i, methods: ['POST'], fallbackHref: '/users', label: 'Delete Alumni Profile' },
  { pattern: '/users/:userId/jobs', regex: /^\/users\/[^/]+\/jobs$/i, methods: ['GET'], fallbackHref: '/users', label: 'User Job Postings' },
  { pattern: '/users/:userId/applications', regex: /^\/users\/[^/]+\/applications$/i, methods: ['GET'], fallbackHref: '/users', label: 'User Applications' },
  { pattern: '/announcements/:id', regex: /^\/announcements\/[^/]+$/i, methods: ['GET', 'PUT', 'PATCH', 'DELETE'], fallbackHref: '/announcements', label: 'Announcement Detail' },
  { pattern: '/announcements/:id/edit', regex: /^\/announcements\/[^/]+\/edit$/i, methods: ['GET', 'POST'], fallbackHref: '/announcements', label: 'Edit Announcement' },
  { pattern: '/announcements/:id/delete', regex: /^\/announcements\/[^/]+\/delete$/i, methods: ['POST'], fallbackHref: '/announcements', label: 'Delete Announcement' },
  { pattern: '/jobs/:id', regex: /^\/(?:jobs|job-postings)\/[^/]+$/i, methods: ['GET', 'PUT', 'DELETE'], fallbackHref: '/jobs', label: 'Job Posting Detail' },
  { pattern: '/jobs/:id/edit', regex: /^\/(?:jobs|job-postings)\/[^/]+\/edit$/i, methods: ['GET', 'POST'], fallbackHref: '/jobs', label: 'Edit Job Posting' },
  { pattern: '/jobs/:id/delete', regex: /^\/(?:jobs|job-postings)\/[^/]+\/delete$/i, methods: ['POST'], fallbackHref: '/jobs', label: 'Delete Job Posting' },
  { pattern: '/jobs/:jobId/applications', regex: /^\/(?:jobs|job-postings)\/[^/]+\/applications$/i, methods: ['GET'], fallbackHref: '/jobs', label: 'Job Applications' },
  { pattern: '/applications/:id', regex: /^\/applications\/[^/]+$/i, methods: ['GET', 'DELETE'], fallbackHref: '/applications', label: 'Application Detail' },
  { pattern: '/applications/:id/status', regex: /^\/applications\/[^/]+\/status$/i, methods: ['POST'], fallbackHref: '/applications', label: 'Update Application Status' },
  { pattern: '/applications/:id/delete', regex: /^\/applications\/[^/]+\/delete$/i, methods: ['POST'], fallbackHref: '/applications', label: 'Delete Application' },
  { pattern: '/api/users/:id', regex: /^\/api\/users\/[^/]+$/i, methods: ['GET', 'PUT', 'PATCH', 'DELETE'], fallbackHref: '/api/users', label: 'User REST Endpoint' },
  { pattern: '/api/announcements/:id', regex: /^\/api\/announcements\/[^/]+$/i, methods: ['GET', 'PUT', 'PATCH', 'DELETE'], fallbackHref: '/api/announcements', label: 'Announcement REST Endpoint' },
  { pattern: '/api/jobs/:id', regex: /^\/api\/(?:jobs|job-postings)\/[^/]+$/i, methods: ['GET', 'PUT', 'PATCH', 'DELETE'], fallbackHref: '/api/jobs', label: 'Job Posting REST Endpoint' },
  { pattern: '/api/applications/:id', regex: /^\/api\/applications\/[^/]+$/i, methods: ['GET', 'PUT', 'PATCH', 'DELETE'], fallbackHref: '/api/applications', label: 'Application REST Endpoint' }
];

const STATIC_ASSET_EXT_REGEX = /\.(css|js|png|jpe?g|gif|svg|ico|webp|woff2?|ttf|map|pdf|txt)$/i;

/**
 * Computes Levenshtein edit distance between two strings for typo detection.
 */
function levenshteinDistance(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[a.length][b.length];
}

/**
 * Finds an alias or closest matching registered route for a mistyped URL.
 */
function findSimilarRoute(cleanPath) {
  const aliasMatch = KNOWN_ROUTES.find((route) => route.aliases.includes(cleanPath));
  if (aliasMatch) {
    return aliasMatch;
  }

  let bestRoute = null;
  let bestScore = Infinity;

  for (const route of KNOWN_ROUTES) {
    if (route.path === '/') continue;
    const distance = levenshteinDistance(cleanPath, route.path);
    if (distance <= 3 && distance < bestScore) {
      bestScore = distance;
      bestRoute = route;
    }
  }

  return bestRoute;
}

/**
 * Checks whether a clean path matches a known route (exact or parameterized) with another method.
 */
function findMethodMismatchTarget(cleanPath, method) {
  const exact = KNOWN_ROUTES.find((route) => route.path === cleanPath);
  if (exact && !exact.methods.includes(method)) {
    return {
      pattern: exact.path,
      methods: exact.methods,
      fallbackHref: exact.methods.includes('GET') ? exact.path : '/',
      label: exact.label
    };
  }

  const param = PARAMETERIZED_ROUTE_METHODS.find((entry) => entry.regex.test(cleanPath));
  if (param && !param.methods.includes(method)) {
    return param;
  }

  return null;
}

/**
 * Analyzes an unmatched request (or controller 404 override) to produce structured cause diagnostics.
 */
function diagnoseNotFound(req, overrides = {}) {
  const method = String(req?.method || 'GET').toUpperCase();
  const requestedPath = req?.originalUrl || req?.url || '/';
  const cleanPath = normalizePath(requestedPath);
  const timestamp = new Date().toISOString();
  const clientIp = extractClientIp(req);

  const baseMeta = {
    statusCode: 404,
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

  if (overrides.reason) {
    return {
      ...baseMeta,
      error: overrides.error || overrides.title || 'Resource not found',
      code: overrides.code || 'RESOURCE_NOT_FOUND',
      title: overrides.title || 'Resource Not Found',
      reason: overrides.reason,
      suggestion: overrides.suggestion || { label: 'Return to Home Portal', href: '/' },
      backHref: overrides.backHref || overrides.suggestion?.href || '/',
      backLabel: overrides.backLabel || overrides.suggestion?.label || '← Return Home'
    };
  }

  const methodMismatch = findMethodMismatchTarget(cleanPath, method);
  if (methodMismatch) {
    return {
      ...baseMeta,
      error: 'Method not allowed for this route',
      code: 'METHOD_NOT_SUPPORTED',
      title: `Method "${method}" Not Supported Here`,
      reason: `The route "${methodMismatch.pattern}" (${methodMismatch.label}) exists, but does not handle HTTP ${method} requests. Allowed methods on this endpoint: ${methodMismatch.methods.join(', ')}.`,
      suggestion: {
        label: `Open ${methodMismatch.label} (${methodMismatch.fallbackHref})`,
        href: methodMismatch.fallbackHref,
        allowedMethods: methodMismatch.methods
      },
      backHref: methodMismatch.fallbackHref,
      backLabel: `← Go to ${methodMismatch.label}`
    };
  }

  if (STATIC_ASSET_EXT_REGEX.test(cleanPath)) {
    return {
      ...baseMeta,
      error: 'Static asset not found',
      code: 'STATIC_ASSET_NOT_FOUND',
      title: 'Static File Not Found',
      reason: `No static asset matching "${cleanPath}" exists in the public/ folder or static middleware.`,
      suggestion: { label: 'Return to Home Portal', href: '/' },
      backHref: '/',
      backLabel: '← Back to Home Portal'
    };
  }

  const similarRoute = findSimilarRoute(cleanPath);
  if (similarRoute) {
    return {
      ...baseMeta,
      error: 'Route not found',
      code: 'ROUTE_TYPO_DETECTED',
      title: 'Page Not Found — Did You Mean This Route?',
      reason: `No route matched "${method} ${requestedPath}". The URL closely resembles "${similarRoute.path}" (${similarRoute.label}).`,
      suggestion: {
        label: `Open ${similarRoute.label} (${similarRoute.path})`,
        href: similarRoute.path,
        allowedMethods: similarRoute.methods
      },
      backHref: similarRoute.path,
      backLabel: `Go to ${similarRoute.path} →`
    };
  }

  if (/^\/api/i.test(cleanPath)) {
    return {
      ...baseMeta,
      error: 'API endpoint not found',
      code: 'API_ENDPOINT_NOT_FOUND',
      title: 'REST API Endpoint Not Found',
      reason: `No REST API handler is registered for "${method} ${requestedPath}". Verify the endpoint name, resource ID, or HTTP method.`,
      suggestion: { label: 'Inspect Swagger API Docs', href: '/api/swagger' },
      backHref: '/api/swagger',
      backLabel: '📖 Open Swagger Docs'
    };
  }

  return {
    ...baseMeta,
    error: 'Route not found',
    code: 'ROUTE_NOT_FOUND',
    title: 'Page or Endpoint Not Found',
    reason: `No registered page, API route, or static asset matched "${method} ${requestedPath}". The address may contain a typo or refer to a removed resource.`,
    suggestion: { label: 'Return to Home Portal', href: '/' },
    backHref: '/',
    backLabel: '← Back to Home Portal'
  };
}

/**
 * Sanitizes an incoming redirect-origin path query parameter to safe internal relative paths only.
 */
function sanitizeFromPath(rawPath) {
  if (typeof rawPath !== 'string') return null;
  const cleaned = rawPath.replace(/[\r\n\x00-\x1f\x7f]/g, '').trim().slice(0, 300);
  if (!cleaned.startsWith('/') || cleaned.startsWith('//')) {
    return null;
  }
  if (GENERIC_404_PATHS.has(normalizePath(cleaned))) {
    return null;
  }
  return cleaned;
}

/**
 * Normalizes HTTP method names carried across 404 redirects.
 */
function sanitizeRedirectMethod(rawMethod) {
  const upper = String(rawMethod || 'GET').trim().toUpperCase();
  return ALLOWED_REDIRECT_METHODS.has(upper) ? upper : 'GET';
}

/**
 * Builds the /404 redirect target carrying the invalid path (and method if non-GET).
 */
function buildNotFoundRedirectUrl(req, redirectBasePath = '/404') {
  const safeBase =
    typeof redirectBasePath === 'string' &&
    redirectBasePath.startsWith('/') &&
    !redirectBasePath.startsWith('//')
      ? redirectBasePath
      : '/404';
  const sanitizedFrom = sanitizeFromPath(req?.originalUrl || req?.url || '');
  const method = sanitizeRedirectMethod(req?.method);

  const params = new URLSearchParams();
  if (sanitizedFrom) {
    params.set('from', sanitizedFrom);
    if (method !== 'GET') {
      params.set('method', method);
    }
  }
  const query = params.toString();
  return query ? `${safeBase}?${query}` : safeBase;
}

/**
 * Builds the default diagnostic payload when /404 is opened directly without a redirected path.
 */
function buildGenericNotFoundDiagnostic(req) {
  const method = sanitizeRedirectMethod(req?.method);
  const requestedPath = normalizePath(req?.originalUrl || req?.url || '/404');
  const clientIp = extractClientIp(req);
  const timestamp = new Date().toISOString();

  return {
    statusCode: 404,
    error: 'Page not found',
    code: 'PAGE_NOT_FOUND',
    title: 'Page Not Found',
    reason:
      'The page or endpoint you requested could not be found. It may have been moved, deleted, or the URL may be incorrect.',
    suggestion: { label: 'Return to Home Portal', href: '/' },
    backHref: '/',
    backLabel: '← Back to Home Portal',
    requested: { method, path: requestedPath, clientIp, timestamp },
    availableRoutes: KNOWN_ROUTES.map(({ path, label, methods }) => ({ path, label, methods }))
  };
}

/**
 * Renders the 404 HTML screen using the generic MVC views/404.html template.
 */
function renderGuardianHtml(diagnostic) {
  return NotFoundView.renderNotFound({ diagnostic });
}

/**
 * Emits structured [404 GUARDIAN] logs to terminal and logs/error.logs.
 */
function emitNotFoundLog(diagnostic, redirectUrl, options = {}) {
  const redirectSegment = redirectUrl ? ` | redirect=${redirectUrl}` : '';
  emitLogEvent(
    `[404 GUARDIAN] ${diagnostic.code} | 404 | ${diagnostic.requested.method} ${diagnostic.requested.path} | ${diagnostic.reason} | suggestion=${diagnostic.suggestion?.href || '-'}${redirectSegment} | ip=${diagnostic.requested.clientIp}`,
    {
      customSink: options.logError,
      defaultConsoleFn: (line) => console.warn(line),
      logFilePath: options.logFilePath,
      disableFileLog: options.disableFileLog
    }
  );
}

/**
 * Sends a 404 diagnostic HTML page (via Express view engine when available) or JSON payload.
 */
function sendDiagnostic404Response(req, res, diagnostic) {
  if (shouldRenderHtml(req)) {
    if (typeof res.render === 'function' && req?.app?.get && req.app.get('view engine')) {
      return res.status(404).render('404', { diagnostic });
    }
    return res.status(404).send(renderGuardianHtml(diagnostic));
  }

  return res.status(404).json({
    error: diagnostic.error,
    statusCode: diagnostic.statusCode,
    code: diagnostic.code,
    reason: diagnostic.reason,
    requested: diagnostic.requested,
    suggestion: diagnostic.suggestion,
    availableRoutes: diagnostic.availableRoutes
  });
}

/**
 * Sends a 404 Guardian response, or redirects invalid HTML requests to the generic /404 page.
 */
function sendGuardian404(req, res, overrides = {}) {
  if (res.headersSent) return undefined;

  const diagnostic = diagnoseNotFound(req, overrides);
  const cleanPath = normalizePath(req?.originalUrl || req?.url || '/');
  const shouldRedirect =
    Boolean(overrides.redirectTo404) &&
    !GENERIC_404_PATHS.has(cleanPath) &&
    !overrides.reason &&
    shouldRenderHtml(req) &&
    typeof res.redirect === 'function';

  if (shouldRedirect) {
    const redirectUrl = buildNotFoundRedirectUrl(req, overrides.redirectPath || '/404');
    emitNotFoundLog(diagnostic, redirectUrl, overrides);
    return res.redirect(redirectUrl);
  }

  emitNotFoundLog(diagnostic, null, overrides);
  return sendDiagnostic404Response(req, res, diagnostic);
}

/**
 * Creates the Express handler for the generic /404 page route.
 */
function createGenericNotFoundPageHandler(options = {}) {
  return function genericNotFoundPage(req, res) {
    const fromPath = sanitizeFromPath(req?.query?.from);
    const fromMethod = sanitizeRedirectMethod(req?.query?.method);

    const diagnostic = fromPath
      ? diagnoseNotFound({
          method: fromMethod,
          originalUrl: fromPath,
          headers: req?.headers,
          socket: req?.socket,
          ip: req?.ip
        })
      : buildGenericNotFoundDiagnostic(req);

    if (!fromPath) {
      emitNotFoundLog(diagnostic, null, options);
    }

    return sendDiagnostic404Response(req, res, diagnostic);
  };
}

/**
 * Creates a configurable catch-all 404 Guardian middleware.
 */
function createNotFoundGuardian(options = {}) {
  const mergedOptions = {
    redirectTo404: options.redirectTo404 !== false,
    ...options
  };
  return function notFoundGuardianMiddleware(req, res, _next) {
    return sendGuardian404(req, res, mergedOptions);
  };
}

/**
 * Creates a configurable Express 404 error-handling middleware (err, req, res, next).
 */
function createGuardian404ErrorHandler(options = {}) {
  return function guardian404ErrorMiddleware(err, req, res, next) {
    const is404 = err && (err.status === 404 || err.statusCode === 404 || err.name === 'NotFoundError');
    if (!is404 || res.headersSent) {
      return next(err);
    }
    return sendGuardian404(req, res, {
      ...options,
      redirectTo404: false,
      code: err.code || 'NOT_FOUND',
      title: err.title || 'Resource Not Found',
      error: err.message || 'Resource not found',
      reason: err.reason || err.message || 'The requested resource could not be found.',
      suggestion: err.suggestion,
      backHref: err.backHref,
      backLabel: err.backLabel
    });
  };
}

const genericNotFoundPageHandler = createGenericNotFoundPageHandler();
const notFoundGuardian = createNotFoundGuardian();
const guardian404ErrorHandler = createGuardian404ErrorHandler();

/**
 * Shared helper for web controllers when a requested entity ID cannot be found.
 */
function sendResourceNotFound(req, res, { resourceName, id, backHref, backLabel }) {
  const safeName = String(resourceName || 'Resource').trim();
  const normalizedCode = `${safeName.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}_NOT_FOUND`;
  const cleanLabel = String(backLabel || 'Return').replace(/^←\s*/, '');
  const idPart = id !== undefined && id !== null && id !== '' ? ` with ID #${id}` : '';

  return sendGuardian404(req, res, {
    redirectTo404: false,
    code: normalizedCode,
    title: `${safeName} Not Found`,
    error: `${safeName} not found`,
    reason: `No ${safeName.toLowerCase()} record could be found${idPart}. It may have been deleted or the URL identifier is invalid.`,
    suggestion: { label: cleanLabel, href: backHref || '/' },
    backHref: backHref || '/',
    backLabel: backLabel || '← Home'
  });
}

module.exports = {
  notFoundGuardian,
  createNotFoundGuardian,
  guardian404ErrorHandler,
  createGuardian404ErrorHandler,
  genericNotFoundPageHandler,
  createGenericNotFoundPageHandler,
  buildNotFoundRedirectUrl,
  sanitizeFromPath,
  sendGuardian404,
  sendResourceNotFound,
  diagnoseNotFound,
  renderGuardianHtml,
  escapeHtml,
  KNOWN_ROUTES
};
