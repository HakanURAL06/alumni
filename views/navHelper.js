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
      return { icon: '👑', label: 'Yönetici (Admin)', pillBg: '#FEE2E2', pillColor: '#991B1B', pillBorder: '#FECACA' };
    case 'moderator':
      return { icon: '⚖️', label: 'Moderatör', pillBg: '#FEF3C7', pillColor: '#92400E', pillBorder: '#FDE68A' };
    case 'employer':
      return { icon: '💼', label: 'İşveren', pillBg: '#FAF5FF', pillColor: '#6B21A8', pillBorder: '#E9D5FF' };
    case 'student':
      return { icon: '🎓', label: 'Öğrenci', pillBg: '#ECFDF5', pillColor: '#065F46', pillBorder: '#A7F3D0' };
    case 'alumni':
    default:
      return { icon: '🎓', label: 'Mezun', pillBg: '#EFF6FF', pillColor: '#1E40AF', pillBorder: '#BFDBFE' };
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
        <li style="margin-top:6px; margin-bottom:4px;">
          <a href="/profile" class="nav-link user-pill-link" style="text-decoration:none; padding:8px 12px; background:var(--surface-input,#F5F7FA); border:1px solid var(--border-subtle,#E5E7EB); border-radius:8px; display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.1rem;">${roleMeta.icon}</span>
            <div style="display:flex; flex-direction:column; line-height:1.2; overflow:hidden;">
              <span style="font-size:0.82rem; font-weight:700; color:var(--text-primary,#1E293B); text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${item.label}</span>
              <span style="font-size:0.7rem; font-weight:600; color:var(--text-muted,#64748B);">${item.subLabel}</span>
            </div>
          </a>
        </li>
      `;
    }

    if (item.isLogout) {
      return `
        <li style="margin-top:8px;">
          <a href="/logout" class="nav-link btn-logout" style="background:#FEE2E2; color:#DC2626 !important; border:1px solid #FECACA; border-radius:8px; padding:9px 14px; font-weight:600; text-decoration:none; display:flex; align-items:center; gap:8px; font-size:0.86rem; transition:all 0.15s ease;">
            ${item.label}
          </a>
        </li>
      `;
    }

    const activeClass = item.active ? ' active' : '';
    let extraStyle = '';
    if (item.highlight) {
      extraStyle = ' style="color:#D97706; font-weight:700; background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.25); border-radius:8px;"';
    } else if (item.isButton) {
      extraStyle = ' style="background:#1D8CF8; color:#FFFFFF !important; font-weight:600; border-radius:8px; box-shadow:0 1px 2px rgba(29,140,248,0.25);"';
    }

    return `<li><a href="${item.href}" class="nav-link${activeClass}"${extraStyle}>${item.label}</a></li>`;
  }).join('');

  return `<ul class="nav-links" style="display:flex; flex-direction:column; gap:4px; list-style:none; margin:0; padding:0;">${lis}</ul>`;
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
      roleAction = '<a href="/admin" style="color:#D97706; font-weight:700; margin-right:8px; text-decoration:none; padding:4px 10px; border-radius:6px; background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.25); font-size:0.8rem;">🛡️ Admin Paneli &rarr;</a>';
    } else if (role === 'employer') {
      roleAction = '<a href="/jobs#post-job-form" style="color:#7C3AED; font-weight:600; margin-right:8px; text-decoration:none; padding:4px 10px; border-radius:6px; background:rgba(124,58,237,0.08); border:1px solid rgba(124,58,237,0.2); font-size:0.8rem;">📢 İlan Ver &rarr;</a>';
    } else if (role === 'student') {
      roleAction = '<a href="/applications" style="color:#059669; font-weight:600; margin-right:8px; text-decoration:none; padding:4px 10px; border-radius:6px; background:rgba(5,150,105,0.08); border:1px solid rgba(5,150,105,0.2); font-size:0.8rem;">📝 Başvurularım &rarr;</a>';
    }

    const profileLink = '<a href="/profile" style="color:#1D8CF8; font-weight:600; margin-right:8px; text-decoration:none; padding:4px 10px; border-radius:6px; background:rgba(29,140,248,0.08); font-size:0.8rem;">👤 Profilim &rarr;</a>';

    return `
      <div style="display:inline-flex; align-items:center; flex-wrap:wrap; gap:8px;">
        <span style="color:#334155; font-weight:600; font-size:0.82rem; display:inline-flex; align-items:center; gap:6px;">
          ${meta.icon} Hoş geldiniz, <strong>${displayName}</strong>
          <span style="background:${meta.pillBg}; color:${meta.pillColor}; border:1px solid ${meta.pillBorder}; padding:2px 8px; border-radius:999px; font-size:0.72rem; font-weight:700;">${meta.label}</span>
        </span>
        <span style="color:#E2E8F0;">|</span>
        ${roleAction}
        ${profileLink}
        <a href="/logout" style="color:#DC2626; font-weight:600; text-decoration:none; padding:4px 10px; border-radius:6px; background:#FEE2E2; border:1px solid #FECACA; font-size:0.8rem;">🚪 Çıkış Yap</a>
      </div>
    `;
  }

  return `
    <div style="display:inline-flex; align-items:center; flex-wrap:wrap; gap:10px;">
      <a href="/login" style="color:#334155; text-decoration:none; font-weight:600; font-size:0.82rem; padding:5px 12px; border-radius:6px; border:1px solid #CBD5E1; background:#FFFFFF;">🔑 Giriş Yap (Login)</a>
      <a href="/register" style="color:#FFFFFF; text-decoration:none; font-weight:600; font-size:0.82rem; padding:6px 14px; border-radius:6px; background:#1D8CF8; box-shadow:0 1px 2px rgba(29,140,248,0.2);">➕ Kayıt Ol (Register)</a>
      <span style="color:#E2E8F0;">|</span>
      <a href="/api/swagger" target="_blank" rel="noopener" style="color:#64748B; text-decoration:none; font-size:0.8rem; font-weight:500;">Swagger API &rarr;</a>
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
