const {
  logger,
  createLogger,
  formatLogEntry,
  extractResponseType,
  extractContentLength,
  extractClientIp
} = require('./logger');

const {
  DEFAULT_LOG_FILE_PATH,
  stripAnsi,
  formatFileLogLine,
  appendLogLine,
  writeDualLog,
  emitLogEvent
} = require('./logWriter');

const {
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
} = require('./notFoundGuardian');

const {
  serverErrorGuardian,
  createServerErrorGuardian,
  sendServerError,
  diagnoseServerError,
  renderServerErrorHtml,
  resolveServerStatusCode,
  is5xxError
} = require('./serverErrorGuardian');

const {
  authMiddleware,
  requireAuth,
  requireRole,
  requireActive,
  requireOwnershipOrAdmin,
  guestOnly,
  setSessionCookie,
  clearSessionCookie,
  parseCookies,
  wantsHtml
} = require('./auth');

module.exports = {
  logger,
  createLogger,
  formatLogEntry,
  extractResponseType,
  extractContentLength,
  extractClientIp,
  DEFAULT_LOG_FILE_PATH,
  stripAnsi,
  formatFileLogLine,
  appendLogLine,
  writeDualLog,
  emitLogEvent,
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
  KNOWN_ROUTES,
  serverErrorGuardian,
  createServerErrorGuardian,
  sendServerError,
  diagnoseServerError,
  renderServerErrorHtml,
  resolveServerStatusCode,
  is5xxError,
  authMiddleware,
  requireAuth,
  requireRole,
  requireActive,
  requireOwnershipOrAdmin,
  guestOnly,
  setSessionCookie,
  clearSessionCookie,
  parseCookies,
  wantsHtml
};
