const fs = require('fs');
const path = require('path');
const { escapeHtml, QUICK_NAV_LINKS } = require('../middleware/guardianShared');

const notFoundTemplatePath = path.join(__dirname, '404.html');

const DEFAULT_GENERIC_REASON =
  'The page or endpoint you requested could not be found. It may have been moved, deleted, or the URL may be incorrect.';

/**
 * Ensures rendered links inside the 404 template only target safe internal paths.
 */
function sanitizeLocalHref(rawHref) {
  const candidate = String(rawHref || '/').trim();
  if (candidate.startsWith('/') && !candidate.startsWith('//')) {
    return candidate;
  }
  return '/';
}

/**
 * NotFoundView
 * Renders the generic 404 HTML page (views/404.html) with optional Guardian diagnostics.
 */
class NotFoundView {
  /**
   * Builds default generic 404 metadata merged with optional diagnostic overrides.
   * @param {Object} options Diagnostic object or flat 404 template options
   * @returns {Object} Normalized 404 display model
   */
  static buildViewModel(options = {}) {
    const source = options && options.diagnostic ? options.diagnostic : (options || {});
    const suggestion = source.suggestion && typeof source.suggestion === 'object'
      ? source.suggestion
      : { label: 'Return to Home Portal', href: '/' };

    const suggestionHref = sanitizeLocalHref(suggestion.href);
    const backHref = sanitizeLocalHref(source.backHref || suggestionHref);

    return {
      statusCode: 404,
      statusLabel: source.statusLabel || '404 Not Found',
      badgeText: source.badgeText || '🛡️ 404 GUARDIAN',
      code: source.code || 'PAGE_NOT_FOUND',
      title: source.title || 'Page Not Found',
      reason: source.reason || DEFAULT_GENERIC_REASON,
      suggestionLabel: suggestion.label || 'Return to Home Portal',
      suggestionHref,
      backHref,
      backLabel: source.backLabel || '← Home Portal',
      requested: {
        method: source.requested?.method || 'GET',
        path: source.requested?.path || '/404',
        clientIp: source.requested?.clientIp || '-',
        timestamp: source.requested?.timestamp || new Date().toISOString()
      }
    };
  }

  /**
   * Renders views/404.html with XSS-escaped diagnostic or generic 404 details.
   * @param {Object} options Render options passed directly or via Express res.render
   * @returns {string} Rendered 404 HTML document
   */
  static renderNotFound(options = {}) {
    const template = fs.readFileSync(notFoundTemplatePath, 'utf-8');
    const model = NotFoundView.buildViewModel(options);

    const showDistinctBackBtn = model.backHref && model.backHref !== model.suggestionHref;
    const backButtonHtml = showDistinctBackBtn
      ? `<a href="${escapeHtml(model.backHref)}" class="btn btn-primary">${escapeHtml(model.backLabel)}</a>`
      : '';

    const navPillsHtml = QUICK_NAV_LINKS.map(
      (link) => `<a href="${escapeHtml(link.href)}" class="route-pill">${escapeHtml(link.label)}</a>`
    ).join('\n        ');

    return template
      .replace(/\{\{STATUS_CODE\}\}/g, escapeHtml(model.statusCode))
      .replace(/\{\{STATUS_LABEL\}\}/g, escapeHtml(model.statusLabel))
      .replace(/\{\{BADGE_TEXT\}\}/g, escapeHtml(model.badgeText))
      .replace(/\{\{CODE\}\}/g, escapeHtml(model.code))
      .replace(/\{\{TITLE\}\}/g, escapeHtml(model.title))
      .replace(/\{\{REASON\}\}/g, escapeHtml(model.reason))
      .replace(/\{\{SUGGESTION_LABEL\}\}/g, escapeHtml(model.suggestionLabel))
      .replace(/\{\{SUGGESTION_HREF\}\}/g, escapeHtml(model.suggestionHref))
      .replace(/\{\{BACK_BUTTON_HTML\}\}/g, backButtonHtml)
      .replace(/\{\{METHOD\}\}/g, escapeHtml(model.requested.method))
      .replace(/\{\{REQUEST_PATH\}\}/g, escapeHtml(model.requested.path))
      .replace(/\{\{CLIENT_IP\}\}/g, escapeHtml(model.requested.clientIp))
      .replace(/\{\{TIMESTAMP\}\}/g, escapeHtml(model.requested.timestamp))
      .replace(/\{\{NAV_PILLS\}\}/g, navPillsHtml);
  }
}

module.exports = NotFoundView;
