const KNOWN_ROUTES = [
  { path: '/', label: 'Home Portal', methods: ['GET'], aliases: ['/home', '/index', '/portal'] },
  { path: '/about', label: 'About Project', methods: ['GET'], aliases: ['/info'] },
  { path: '/users', label: 'Alumni Directory', methods: ['GET', 'POST'], aliases: ['/user', '/alumni', '/directory', '/members'] },
  { path: '/announcements', label: 'Announcements & Events', methods: ['GET', 'POST'], aliases: ['/announcement', '/news', '/events', '/notices'] },
  { path: '/jobs', label: 'Career & Job Board', methods: ['GET', 'POST'], aliases: ['/job', '/careers', '/vacancies', '/listings'] },
  { path: '/job-postings', label: 'Career & Job Board', methods: ['GET', 'POST'], aliases: ['/jobpostings', '/postings'] },
  { path: '/applications', label: 'Job Applications', methods: ['GET', 'POST'], aliases: ['/application', '/apply', '/candidates'] },
  { path: '/hello', label: 'Greeting Endpoint', methods: ['GET'], aliases: [] },
  { path: '/api/swagger', label: 'Swagger API Docs', methods: ['GET'], aliases: ['/swagger', '/docs', '/api-docs', '/api/docs'] },
  { path: '/api/health', label: 'API Health Check', methods: ['GET', 'POST'], aliases: ['/health', '/status'] },
  { path: '/api/users', label: 'Users REST API', methods: ['GET', 'POST'], aliases: ['/api/user', '/apiusers', '/apiuser'] },
  { path: '/api/announcements', label: 'Announcements REST API', methods: ['GET', 'POST'], aliases: ['/api/announcement', '/apiannouncements', '/apiannouncement'] },
  { path: '/api/jobs', label: 'Jobs REST API', methods: ['GET', 'POST'], aliases: ['/api/job', '/apijobs', '/apijob'] },
  { path: '/api/job-postings', label: 'Job Postings REST API', methods: ['GET', 'POST'], aliases: ['/api/jobpostings'] },
  { path: '/api/applications', label: 'Applications REST API', methods: ['GET', 'POST'], aliases: ['/api/application', '/apiapplications', '/apiapplication'] }
];

const QUICK_NAV_LINKS = [
  { label: '🏠 Home', href: '/' },
  { label: '👥 Alumni Directory', href: '/users' },
  { label: '📢 Announcements', href: '/announcements' },
  { label: '💼 Job Board', href: '/jobs' },
  { label: '📝 Applications', href: '/applications' },
  { label: '📖 Swagger API Docs', href: '/api/swagger' },
  { label: '🩺 Health Check', href: '/api/health' }
];

/**
 * Escapes HTML special characters to prevent reflected XSS in diagnostic screens.
 */
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Strips query string and normalizes trailing slashes for route matching.
 */
function normalizePath(rawUrl) {
  const pathOnly = String(rawUrl || '/').split('?')[0].trim();
  if (pathOnly.length > 1) {
    return pathOnly.replace(/\/+$/, '').toLowerCase() || '/';
  }
  return pathOnly.toLowerCase() || '/';
}

/**
 * Determines whether the client expects the interactive HTML Guardian screen vs JSON.
 */
function shouldRenderHtml(req) {
  const rawAccept = String(req?.headers?.accept || '');
  const cleanPath = normalizePath(req?.originalUrl || req?.url || '/');
  const isApiPath = /^\/api/i.test(cleanPath);
  const acceptsHtmlExplicitly = rawAccept.includes('text/html');
  const acceptsJsonExplicitly = rawAccept.includes('application/json');

  if (acceptsJsonExplicitly && !acceptsHtmlExplicitly) {
    return false;
  }
  if (isApiPath && !acceptsHtmlExplicitly) {
    return false;
  }
  if (req?.xhr) {
    return false;
  }
  if (!rawAccept && typeof req?.accepts === 'function') {
    return Boolean(req.accepts('html'));
  }
  return true;
}

/**
 * Renders the shared branded HTML Guardian diagnostic shell for both 404 and 5xx pages.
 */
function renderGuardianScreen({
  statusCode = 500,
  statusLabel = '500 Internal Server Error',
  badgeText = '🛡️ GUARDIAN',
  theme = {},
  title = 'Unexpected Error',
  code = 'ERROR',
  reason = '',
  suggestion = { label: 'Return to Home Portal', href: '/' },
  backHref = '/',
  backLabel = '← Home',
  requested = {},
  extraDiagItems = [],
  extraSectionHtml = ''
}) {
  const {
    accentColor = '#dc2626',
    borderColor = '#fecaca',
    badgeBg = '#fef2f2',
    badgeTextColor = '#b91c1c',
    reasonBg = '#fff7ed',
    reasonBorder = '#ea580c',
    reasonLabelColor = '#c2410c',
    reasonTextColor = '#431407'
  } = theme;

  const safeStatusCode = escapeHtml(statusCode);
  const safeStatusLabel = escapeHtml(statusLabel);
  const safeBadgeText = escapeHtml(badgeText);
  const safeTitle = escapeHtml(title);
  const safeCode = escapeHtml(code);
  const safeReason = escapeHtml(reason);
  const safeMethod = escapeHtml(requested.method || 'GET');
  const safePath = escapeHtml(requested.path || '/');
  const safeIp = escapeHtml(requested.clientIp || '-');
  const safeTimestamp = escapeHtml(requested.timestamp || new Date().toISOString());
  const safeSuggestionLabel = escapeHtml(suggestion?.label || 'Return Home');
  const safeSuggestionHref = escapeHtml(suggestion?.href || '/');
  const safeBackLabel = escapeHtml(backLabel || '← Home');
  const safeBackHref = escapeHtml(backHref || '/');
  const showDistinctBackBtn = backHref && backHref !== suggestion?.href;

  const extraDiagHtml = (extraDiagItems || [])
    .map(
      ({ key, value }) => `<div class="diag-item">
        <div class="diag-key">${escapeHtml(key)}</div>
        <div class="diag-val">${escapeHtml(value)}</div>
      </div>`
    )
    .join('\n      ');

  const navPills = QUICK_NAV_LINKS.map(
    (link) => `<a href="${escapeHtml(link.href)}" class="route-pill">${escapeHtml(link.label)}</a>`
  ).join('\n        ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeStatusCode} Guardian — ${safeTitle}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 960px;
      margin: 30px auto;
      padding: 0 20px;
      color: #1e293b;
      background-color: #f8fafc;
      line-height: 1.6;
    }
    .top-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      background: #0f172a;
      color: #fff;
      padding: 14px 24px;
      border-radius: 12px;
      margin-bottom: 28px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .top-nav .logo { font-weight: 800; font-size: 1.15rem; }
    .top-nav .nav-menu { display: flex; flex-wrap: wrap; gap: 16px; }
    .top-nav a { color: #cbd5e1; text-decoration: none; font-size: 0.9rem; font-weight: 500; }
    .top-nav a:hover { color: #38bdf8; }
    .guardian-card {
      background: #ffffff;
      border: 1px solid ${borderColor};
      border-top: 5px solid ${accentColor};
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08);
    }
    .badge-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 14px;
      flex-wrap: wrap;
    }
    .guardian-badge {
      background: ${badgeBg};
      color: ${badgeTextColor};
      border: 1px solid ${borderColor};
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.04em;
    }
    .code-badge {
      background: #f1f5f9;
      color: #334155;
      padding: 4px 10px;
      border-radius: 6px;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.78rem;
      font-weight: 600;
    }
    h1 {
      margin: 0 0 14px 0;
      font-size: 1.85rem;
      color: #0f172a;
      letter-spacing: -0.02em;
    }
    .reason-box {
      background: ${reasonBg};
      border-left: 4px solid ${reasonBorder};
      padding: 16px 20px;
      border-radius: 8px;
      margin-bottom: 22px;
    }
    .reason-label {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: ${reasonLabelColor};
      margin-bottom: 4px;
    }
    .reason-text {
      margin: 0;
      color: ${reasonTextColor};
      font-size: 1rem;
      font-weight: 500;
    }
    .suggestion-box {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 10px;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 14px;
      margin-bottom: 24px;
    }
    .suggestion-box strong { color: #1e3a8a; }
    .btn-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 28px; }
    .btn {
      display: inline-block;
      padding: 10px 18px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      border: none;
    }
    .btn-primary { background: #0f172a; color: #ffffff; }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-secondary { background: #e2e8f0; color: #1e293b; }
    .btn-secondary:hover { background: #cbd5e1; }
    .diag-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .diag-item .diag-key {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      font-weight: 700;
    }
    .diag-item .diag-val {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.85rem;
      color: #0f172a;
      word-break: break-all;
    }
    .tips-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px 20px;
      margin-bottom: 24px;
    }
    .tips-box h3 { margin: 0 0 8px 0; font-size: 0.95rem; color: #0f172a; }
    .tips-box ul { margin: 0; padding-left: 20px; color: #334155; font-size: 0.9rem; }
    .stack-details {
      margin-bottom: 24px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 16px;
      background: #0f172a;
      color: #e2e8f0;
    }
    .stack-details summary { cursor: pointer; font-weight: 600; font-size: 0.88rem; color: #93c5fd; }
    .stack-details pre {
      margin: 12px 0 0 0;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.78rem;
      white-space: pre-wrap;
      word-break: break-word;
      color: #f8fafc;
    }
    .routes-section h3 {
      margin: 0 0 10px 0;
      font-size: 0.95rem;
      color: #334155;
    }
    .route-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .route-pill {
      background: #f1f5f9;
      color: #334155;
      padding: 6px 12px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .route-pill:hover { background: #e2e8f0; color: #0f172a; }
  </style>
</head>
<body>
  <div class="top-nav">
    <div class="logo">🎓 Alumni Tracking Portal</div>
    <div class="nav-menu">
      <a href="/">Home</a>
      <a href="/users">Alumni Directory</a>
      <a href="/announcements">Announcements</a>
      <a href="/jobs">Job Board</a>
      <a href="/applications">Applications</a>
      <a href="/api/swagger">Swagger Docs</a>
    </div>
  </div>

  <div class="guardian-card">
    <div class="badge-row">
      <span class="guardian-badge">${safeBadgeText}</span>
      <span class="code-badge">${safeCode}</span>
    </div>

    <h1>${safeStatusCode} — ${safeTitle}</h1>

    <div class="reason-box">
      <div class="reason-label">Diagnostic Reason</div>
      <p class="reason-text">${safeReason}</p>
    </div>

    <div class="suggestion-box">
      <div>
        <strong>Recommended Action:</strong>
        <span>${safeSuggestionLabel}</span>
      </div>
      <a href="${safeSuggestionHref}" class="btn btn-primary">${safeSuggestionLabel} ➔</a>
    </div>

    <div class="btn-row">
      ${showDistinctBackBtn ? `<a href="${safeBackHref}" class="btn btn-primary">${safeBackLabel}</a>` : ''}
      <a href="/" class="btn btn-secondary">🏠 Home Portal</a>
      <button type="button" class="btn btn-secondary" onclick="window.history.back()">↩ Go Back</button>
    </div>

    <div class="diag-grid">
      <div class="diag-item">
        <div class="diag-key">HTTP Status</div>
        <div class="diag-val">${safeStatusLabel}</div>
      </div>
      <div class="diag-item">
        <div class="diag-key">Method &amp; Route</div>
        <div class="diag-val">${safeMethod} ${safePath}</div>
      </div>
      <div class="diag-item">
        <div class="diag-key">Client IP</div>
        <div class="diag-val">${safeIp}</div>
      </div>
      <div class="diag-item">
        <div class="diag-key">Timestamp (UTC)</div>
        <div class="diag-val">${safeTimestamp}</div>
      </div>
      ${extraDiagHtml}
    </div>

    ${extraSectionHtml}

    <div class="routes-section">
      <h3>Available Destinations</h3>
      <div class="route-pills">
        ${navPills}
      </div>
    </div>
  </div>
</body>
</html>`;
}

module.exports = {
  KNOWN_ROUTES,
  QUICK_NAV_LINKS,
  escapeHtml,
  normalizePath,
  shouldRenderHtml,
  renderGuardianScreen
};
