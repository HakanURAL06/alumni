const User = require('../models/User');

/**
 * Parses raw Cookie header string into a key-value dictionary (RFC 6265).
 * @param {string} cookieHeader Raw Cookie header string
 * @returns {Object.<string, string>} Key-value map of parsed cookies
 */
function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader || typeof cookieHeader !== 'string') return cookies;
  const parts = cookieHeader.split(';');
  for (let i = 0; i < parts.length; i++) {
    const pair = parts[i].trim();
    const eqIdx = pair.indexOf('=');
    if (eqIdx !== -1) {
      const key = pair.substring(0, eqIdx).trim();
      const val = pair.substring(eqIdx + 1).trim();
      try {
        cookies[key] = decodeURIComponent(val);
      } catch (e) {
        cookies[key] = val;
      }
    }
  }
  return cookies;
}

/**
 * Sets hardened session cookie on HTTP response.
 * @param {Object} res Express response object
 * @param {string} token Signed session token
 * @param {boolean} [rememberMe=false] Whether to issue 30-day extended cookie
 */
function setSessionCookie(res, token, rememberMe = false) {
  const maxAge = rememberMe ? (30 * 24 * 60 * 60) : (24 * 60 * 60);
  res.setHeader('Set-Cookie', `session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`);
}

/**
 * Clears session cookie on HTTP response.
 * @param {Object} res Express response object
 */
function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', 'session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
}

/**
 * Helper to determine if client expects an HTML presentation response.
 * @param {Object} req Express request object
 * @returns {boolean}
 */
function wantsHtml(req) {
  return Boolean(
    req &&
    typeof req.accepts === 'function' &&
    req.accepts('html') &&
    !String(req.originalUrl || req.url || '').startsWith('/api/') &&
    !String(req.headers?.accept || '').includes('application/json')
  );
}

/**
 * Global authentication middleware.
 * Inspects Bearer Authorization header or session cookie, verifies token signature and expiration,
 * and attaches verified user identity to req.user and res.locals.currentUser.
 * Always calls next() without blocking.
 */
function authMiddleware(req, res, next) {
  let token = null;

  // 1. Check Bearer Authorization Header
  const authHeader = req.headers?.authorization;
  if (authHeader && typeof authHeader === 'string') {
    const parts = authHeader.trim().split(' ');
    if (parts.length === 2 && /^bearer$/i.test(parts[0])) {
      token = parts[1];
    }
  }

  // 2. Check Cookie Header if no Bearer token
  if (!token) {
    const cookies = req.cookies || parseCookies(req.headers?.cookie);
    token = cookies.session || null;
  }

  // 3. Verify Token
  if (token) {
    const payload = User.verifySessionToken(token);
    if (payload) {
      req.user = payload;
      if (res && res.locals) {
        res.locals.currentUser = payload;
        res.locals.isAuthenticated = true;
      }
      return next();
    }
  }

  req.user = null;
  if (res && res.locals) {
    res.locals.currentUser = null;
    res.locals.isAuthenticated = false;
  }
  return next();
}

/**
 * Route guard requiring an active authenticated session.
 * Unauthenticated web clients are redirected to /login with returnUrl;
 * API clients receive 401 Unauthorized JSON.
 */
function requireAuth(req, res, next) {
  if (req.user) {
    return next();
  }

  if (wantsHtml(req)) {
    const returnUrl = encodeURIComponent(req.originalUrl || req.url || '/');
    return res.redirect(`/login?returnUrl=${returnUrl}`);
  }

  return res.status(401).json({
    error: 'Authentication required. Please provide a valid session token or sign in.'
  });
}

/**
 * Role-Based Access Control (RBAC) route guard factory.
 * Restricts access to users holding one of the specified roles.
 * @param {...string} roles Allowed roles (e.g. 'admin', 'moderator', 'employer', 'alumni', 'student')
 * @returns {Function} Express middleware function
 */
function requireRole(...roles) {
  const allowedRoles = roles.flat().map(r => String(r).toLowerCase());

  return function roleGuard(req, res, next) {
    if (!req.user) {
      return requireAuth(req, res, next);
    }

    const userRole = String(req.user.role || '').toLowerCase();
    if (allowedRoles.includes(userRole) || userRole === 'admin') {
      return next();
    }

    if (wantsHtml(req)) {
      return res.status(403).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>403 Forbidden — Istanbul University Alumni Portal</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
            .card { background: #1e293b; border: 1px solid #334155; border-top: 4px solid #ef4444; border-radius: 12px; padding: 36px; max-width: 520px; width: 100%; box-shadow: 0 10px 25px rgba(0,0,0,0.4); text-align: center; }
            h1 { font-size: 1.8rem; margin: 0 0 12px; color: #f87171; }
            p { color: #cbd5e1; font-size: 0.95rem; line-height: 1.5; margin-bottom: 24px; }
            .btn { display: inline-block; background: #2563eb; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>⛔ 403 Forbidden</h1>
            <p>Your account role (<strong>${userRole || 'member'}</strong>) does not have sufficient permission to access this resource. Required role: <strong>${allowedRoles.join(', ')}</strong>.</p>
            <a href="/users" class="btn">← Return to Alumni Directory</a>
          </div>
        </body>
        </html>
      `);
    }

    return res.status(403).json({
      error: `Forbidden: Insufficient privileges. Required role: ${allowedRoles.join(' or ')}.`
    });
  };
}

/**
 * Route guard verifying that an authenticated user's accountStatus is 'active' (USR-R7).
 * Blocks 'suspended', 'archived', and 'pending_verification' accounts from performing operations.
 */
function requireActive(req, res, next) {
  if (!req.user) {
    return requireAuth(req, res, next);
  }

  const status = String(req.user.accountStatus || 'active').toLowerCase();
  if (status === 'active') {
    return next();
  }

  if (wantsHtml(req)) {
    return res.status(403).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>403 Account Restricted</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
          .card { background: #1e293b; border-top: 4px solid #f59e0b; border-radius: 12px; padding: 36px; max-width: 500px; text-align: center; }
          h1 { color: #fbbf24; margin-bottom: 12px; }
          p { color: #cbd5e1; }
          a { color: #38bdf8; text-decoration: none; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>⚠️ Account Status: ${status}</h1>
          <p>Your account is currently in <strong>${status}</strong> state. Mutating platform actions are restricted until verification or review is complete.</p>
          <p><a href="/users">← Back to Alumni Directory</a></p>
        </div>
      </body>
      </html>
    `);
  }

  return res.status(403).json({
    error: `Forbidden: Your account status is '${status}'. Please contact university administration.`
  });
}

/**
 * Data Ownership or Administrative oversight route guard factory (USR-R5, USR-R6).
 * Verifies that the authenticated actor owns the target resource or holds the 'admin' role.
 * @param {Function} getOwnerIdFn Function accepting req and returning the resource owner's ID
 * @returns {Function} Express middleware function
 */
function requireOwnershipOrAdmin(getOwnerIdFn) {
  return function ownershipGuard(req, res, next) {
    if (!req.user) {
      return requireAuth(req, res, next);
    }

    const userRole = String(req.user.role || '').toLowerCase();
    if (userRole === 'admin') {
      return next();
    }

    const actorId = Number(req.user.userId || req.user.id);
    const ownerId = Number(typeof getOwnerIdFn === 'function' ? getOwnerIdFn(req) : null);

    if (Number.isInteger(actorId) && Number.isInteger(ownerId) && actorId === ownerId) {
      return next();
    }

    if (wantsHtml(req)) {
      return res.status(403).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>403 Unauthorized Resource Access</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #0f172a; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
            .card { background: #1e293b; border-top: 4px solid #ef4444; border-radius: 12px; padding: 36px; max-width: 500px; text-align: center; }
            h1 { color: #f87171; }
            p { color: #cbd5e1; }
            a { color: #38bdf8; font-weight: 600; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>🚫 Access Denied</h1>
            <p>You can only modify or delete resources that you personally published or own.</p>
            <p><a href="/users">← Back to Directory</a></p>
          </div>
        </body>
        </html>
      `);
    }

    return res.status(403).json({
      error: 'Forbidden: You do not have permission to modify this resource (ownership required).'
    });
  };
}

/**
 * Route guard for guest-only pages (e.g. /login, /register).
 * Redirects already authenticated users to /users (or returns 400 for APIs).
 */
function guestOnly(req, res, next) {
  if (req.user && !req.query?.force) {
    if (wantsHtml(req)) {
      return res.redirect('/users');
    }
    return res.status(400).json({
      error: 'Already authenticated. Please log out before creating a new session or account.'
    });
  }
  return next();
}

module.exports = {
  parseCookies,
  setSessionCookie,
  clearSessionCookie,
  wantsHtml,
  authMiddleware,
  requireAuth,
  requireRole,
  requireActive,
  requireOwnershipOrAdmin,
  guestOnly
};
