/**
 * navHelper.js
 * Central Dynamic Navigation & Menu Generator based on User Role (RBAC).
 *
 * Supported Roles:
 * - guest (Unauthenticated)
 * - student
 * - alumni
 * - employer
 * - moderator
 * - admin
 */

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Returns role-specific metadata: icon, Turkish label, and CSS badge pill class.
 */
function getRoleMeta(role) {
  switch (String(role || '').toLowerCase()) {
    case 'admin':
      return { icon: '👑', label: 'Yönetici (Admin)', pillBg: '#fee2e2', pillColor: '#991b1b', pillBorder: '#fecaca' };
    case 'moderator':
      return { icon: '⚖️', label: 'Moderatör', pillBg: '#fef3c7', pillColor: '#92400e', pillBorder: '#fde68a' };
    case 'employer':
      return { icon: '💼', label: 'İşveren', pillBg: '#faf5ff', pillColor: '#6b21a8', pillBorder: '#e9d5ff' };
    case 'student':
      return { icon: '🎓', label: 'Öğrenci', pillBg: '#ecfdf5', pillColor: '#065f46', pillBorder: '#a7f3d0' };
    case 'alumni':
    default:
      return { icon: '🎓', label: 'Mezun', pillBg: '#eff6ff', pillColor: '#1e40af', pillBorder: '#bfdbfe' };
  }
}

/**
 * Builds array of nav items for the given user role and active page context.
 * @param {Object|null} currentUser Authenticated session payload or null
 * @param {string} activePage e.g. 'home', 'users', 'jobs', 'announcements', 'applications', 'admin', 'login', 'register'
 * @returns {Array<{ label: string, href: string, active: boolean, highlight?: boolean, isButton?: boolean, isLogout?: boolean, isPill?: boolean }>}
 */
function getNavItems(currentUser = null, activePage = '') {
  const normActive = String(activePage || '').toLowerCase();
  const isAuthenticated = Boolean(currentUser && (currentUser.email || currentUser.userId || currentUser.id));
  const role = isAuthenticated ? String(currentUser.role || 'alumni').toLowerCase() : 'guest';
  const userId = currentUser ? (currentUser.userId || currentUser.id) : null;

  const items = [];

  // 1. ADMIN PANEL (Prominently first for Admin users)
  if (role === 'admin') {
    items.push({
      label: '🛡️ Admin Panel',
      href: '/admin',
      active: normActive === 'admin',
      highlight: true
    });
  }

  // 2. HOME
  items.push({
    label: 'Home',
    href: '/',
    active: normActive === 'home' || normActive === ''
  });

  // 3. ROLE-SPECIFIC DIRECTORY LINK
  if (role === 'employer') {
    items.push({
      label: 'Yetenek Havuzu (Alumni)',
      href: '/users',
      active: normActive === 'users'
    });
  } else if (role === 'student') {
    items.push({
      label: 'Rehber & Mentorlar',
      href: '/users',
      active: normActive === 'users'
    });
  } else {
    items.push({
      label: 'Alumni Directory',
      href: '/users',
      active: normActive === 'users'
    });
  }

  // 4. DEDICATED USER PROFILE & WORKSPACE (For all authenticated users: student, alumni, employer, moderator, admin)
  if (isAuthenticated) {
    items.push({
      label: '👤 Profilim',
      href: '/profile',
      active: normActive === 'profile' || normActive === 'me'
    });
  }

  // 5. ANNOUNCEMENTS
  items.push({
    label: 'Announcements',
    href: '/announcements',
    active: normActive === 'announcements'
  });

  // 6. JOBS
  if (role === 'student') {
    items.push({
      label: '💼 İş & Staj',
      href: '/jobs',
      active: normActive === 'jobs'
    });
  } else {
    items.push({
      label: 'Job Board',
      href: '/jobs',
      active: normActive === 'jobs'
    });
  }

  // 7. ROLE-SPECIFIC ACTIONS (Post Job for Employer / My Jobs for Alumni)
  if (role === 'employer') {
    items.push({
      label: '📢 İlan Ver',
      href: '/jobs#post-job-form',
      active: false
    });
    items.push({
      label: '📋 Adaylar & Başvurular',
      href: '/applications',
      active: normActive === 'applications'
    });
  } else if (role === 'alumni' && userId) {
    items.push({
      label: '💼 İlanlarım',
      href: `/users/${userId}/jobs`,
      active: normActive === 'userjobs'
    });
    items.push({
      label: '📝 Başvurularım',
      href: `/users/${userId}/applications`,
      active: normActive === 'applications'
    });
  } else if (role === 'student') {
    items.push({
      label: '📝 Başvurularım',
      href: '/applications',
      active: normActive === 'applications'
    });
  } else if (role === 'admin' || role === 'moderator') {
    items.push({
      label: 'Applications',
      href: '/applications',
      active: normActive === 'applications'
    });
  } else {
    // Guest
    items.push({
      label: 'Applications',
      href: '/applications',
      active: normActive === 'applications'
    });
  }

  // 8. AUTHENTICATION CONTROLS
  if (!isAuthenticated) {
    items.push({
      label: '➕ Register',
      href: '/register',
      active: normActive === 'register'
    });
    items.push({
      label: '🔑 Login',
      href: '/login',
      active: normActive === 'login',
      isButton: true
    });
  } else {
    // Authenticated User Identity Pill
    const meta = getRoleMeta(role);
    const displayName = currentUser.name || currentUser.email || 'Member';
    items.push({
      label: `${meta.icon} ${escapeHtml(displayName)}`,
      subLabel: meta.label,
      href: '/profile',
      isPill: true,
      roleMeta: meta
    });

    // Logout Action
    items.push({
      label: '🚪 Çıkış Yap',
      href: '/logout',
      isLogout: true
    });
  }

  return items;
}

/**
 * Generates the HTML `<ul class="nav-links">...</ul>` markup.
 */
function renderNavLinksHtml(currentUser = null, activePage = '') {
  const items = getNavItems(currentUser, activePage);

  const lis = items.map(item => {
    if (item.isPill) {
      const { roleMeta } = item;
      return `
        <li>
          <span class="user-pill" style="display:inline-flex; align-items:center; gap:6px; background:${roleMeta.pillBg}; color:${roleMeta.pillColor}; border:1px solid ${roleMeta.pillBorder}; border-radius:999px; padding:4px 12px; font-size:0.8rem; font-weight:700;">
            ${item.label} <span style="font-size:0.7rem; font-weight:600; opacity:0.85;">(${item.subLabel})</span>
          </span>
        </li>
      `;
    }

    if (item.isLogout) {
      return `
        <li>
          <a href="/logout" class="nav-link btn-logout" style="background:rgba(239,68,68,0.15); color:#fca5a5 !important; border:1px solid rgba(239,68,68,0.35); border-radius:6px; padding:6px 12px; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:5px; transition:all 0.15s ease;">
            ${item.label}
          </a>
        </li>
      `;
    }

    const activeClass = item.active ? ' active' : '';
    let extraStyle = '';
    if (item.highlight) {
      extraStyle = ' style="color:#fde047; font-weight:750; background:rgba(234,179,8,0.15); border:1px solid rgba(234,179,8,0.35); border-radius:6px;"';
    } else if (item.isButton) {
      extraStyle = ' style="background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%); color:#ffffff !important; font-weight:700; border-radius:6px;"';
    }

    return `<li><a href="${item.href}" class="nav-link${activeClass}"${extraStyle}>${item.label}</a></li>`;
  }).join('');

  return `<ul class="nav-links" style="display:flex; align-items:center; gap:6px; list-style:none; flex-wrap:wrap; margin:0; padding:0;">${lis}</ul>`;
}

/**
 * Generates the top utility bar right-hand controls.
 */
function renderTopBarRightHtml(currentUser = null) {
  const isAuthenticated = Boolean(currentUser && (currentUser.email || currentUser.userId || currentUser.id));
  const role = isAuthenticated ? String(currentUser.role || 'alumni').toLowerCase() : 'guest';
  const meta = getRoleMeta(role);
  const displayName = escapeHtml(currentUser?.name || currentUser?.email || '');

  if (isAuthenticated) {
    let roleAction = '';
    if (role === 'admin') {
      roleAction = '<a href="/admin" style="color:#fde047; font-weight:700; margin-right:12px; text-decoration:none;">🛡️ Admin Paneli &rarr;</a>';
    } else if (role === 'employer') {
      roleAction = '<a href="/jobs#post-job-form" style="color:#a78bfa; font-weight:600; margin-right:12px; text-decoration:none;">📢 İlan Ver &rarr;</a>';
    } else if (role === 'student') {
      roleAction = '<a href="/applications" style="color:#34d399; font-weight:600; margin-right:12px; text-decoration:none;">📝 Başvurularım &rarr;</a>';
    }

    const profileLink = '<a href="/profile" style="color:#60a5fa; font-weight:600; margin-right:12px; text-decoration:none;">👤 Profilim &rarr;</a>';

    return `
      <div style="display:inline-flex; align-items:center; flex-wrap:wrap; gap:8px;">
        <span style="color:#cbd5e1; font-weight:600; font-size:0.78rem;">
          ${meta.icon} Hoş geldiniz, <strong>${displayName}</strong>
          <span style="background:${meta.pillBg}; color:${meta.pillColor}; padding:1px 6px; border-radius:999px; font-size:0.68rem; margin-left:4px;">${meta.label}</span>
        </span>
        <span style="color:rgba(255,255,255,0.25);">|</span>
        ${roleAction}
        ${profileLink}
        <a href="/logout" style="color:#fca5a5; font-weight:700; text-decoration:none; padding:2px 8px; border-radius:4px; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3);">🚪 Çıkış Yap</a>
      </div>
    `;
  }

  return `
    <div style="display:inline-flex; align-items:center; flex-wrap:wrap; gap:10px;">
      <a href="/login" style="color:#cbd5e1; text-decoration:none; font-weight:600;">🔑 Giriş Yap (Login)</a>
      <span style="color:rgba(255,255,255,0.25);">|</span>
      <a href="/register" style="color:#38bdf8; text-decoration:none; font-weight:600;">➕ Kayıt Ol (Register)</a>
      <span style="color:rgba(255,255,255,0.25);">|</span>
      <a href="/api/swagger" target="_blank" rel="noopener" style="color:#cbd5e1; text-decoration:none;">Swagger API &rarr;</a>
    </div>
  `;
}

/**
 * Injects dynamic navigation into an HTML template string.
 * Replaces:
 * - `<ul class="nav-links"...>...</ul>` or `{{DYNAMIC_NAV_LINKS}}`
 * - `.top-bar-inner > div:last-child` or `{{DYNAMIC_TOP_BAR_RIGHT}}` / `{{DYNAMIC_TOP_BAR}}`
 * @param {string} template Full template HTML
 * @param {Object} options { currentUser, activePage }
 * @returns {string} Processed HTML with dynamic navigation
 */
function injectDynamicNav(template = '', options = {}) {
  if (typeof template !== 'string') return '';
  const currentUser = options.currentUser || null;
  const activePage = options.activePage || '';

  const navHtml = renderNavLinksHtml(currentUser, activePage);
  const topBarHtml = renderTopBarRightHtml(currentUser);

  let output = template;

  // 1. Replace placeholder if present, or regex replace existing nav-links list
  if (output.includes('{{DYNAMIC_NAV_LINKS}}')) {
    output = output.replace(/\{\{DYNAMIC_NAV_LINKS\}\}/g, navHtml);
  } else {
    output = output.replace(/<ul class="nav-links"[^>]*>[\s\S]*?<\/ul>/i, navHtml);
  }

  // 2. Replace top-bar placeholder if present
  if (output.includes('{{DYNAMIC_TOP_BAR_RIGHT}}')) {
    output = output.replace(/\{\{DYNAMIC_TOP_BAR_RIGHT\}\}/g, topBarHtml);
  } else if (output.includes('{{DYNAMIC_TOP_BAR}}')) {
    output = output.replace(/\{\{DYNAMIC_TOP_BAR\}\}/g, topBarHtml);
  } else if (/<div class="top-bar-right"[^>]*>[\s\S]*?<\/div>/i.test(output)) {
    output = output.replace(/<div class="top-bar-right"[^>]*>[\s\S]*?<\/div>/i, `<div class="top-bar-right">${topBarHtml}</div>`);
  } else {
    // If top-bar-inner has a right-side div, replace its contents
    output = output.replace(
      /(<div class="[^"]*top-bar-inner[^"]*">\s*(?:<div class="(?:status-indicator|top-bar-left)">[\s\S]*?<\/div>)\s*)<div[^>]*>[\s\S]*?<\/div>(\s*<\/div>)/i,
      `$1<div>${topBarHtml}</div>$2`
    );
  }

  return output;
}

module.exports = {
  getRoleMeta,
  getNavItems,
  renderNavLinksHtml,
  renderTopBarRightHtml,
  injectDynamicNav
};
