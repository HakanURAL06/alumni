const fs = require('fs');
const path = require('path');
const { injectDynamicNav, getRoleMeta } = require('./navHelper');

const usersTemplatePath = path.join(__dirname, 'users.html');
const userDetailTemplatePath = path.join(__dirname, 'userDetail.html');
const userEditTemplatePath = path.join(__dirname, 'userEdit.html');
const registerTemplatePath = path.join(__dirname, 'register.html');
const loginTemplatePath = path.join(__dirname, 'login.html');

function escapeAttr(val) {
  return String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * UserView
 * Handles rendering HTML views for user resources (MVC View Layer).
 */
class UserView {
  /**
   * Renders the Member Portal Login page (views/login.html).
   * @param {Object} options Flash message, error string, email, returnUrl, rememberMe
   * @returns {string} Fully rendered HTML string
   */
  static renderLogin(options = {}) {
    const template = fs.readFileSync(loginTemplatePath, 'utf-8');
    const email = options.email || options.formData?.email || '';
    const returnUrl = options.returnUrl || '';
    const rememberMe = Boolean(options.rememberMe || options.formData?.rememberMe);

    let messageHtml = '';
    if (options.error) {
      messageHtml = `<div class="alert-danger"><strong>Authentication Failed:</strong> ${escapeAttr(options.error)}</div>`;
    } else if (options.message) {
      const alertClass = options.alertType ? `alert-${options.alertType}` : 'alert-success';
      messageHtml = `<div class="${alertClass}">${options.message}</div>`;
    }

    const output = template
      .replace('{{MESSAGE}}', messageHtml)
      .replace(/\{\{FORM_EMAIL\}\}/g, escapeAttr(email))
      .replace(/\{\{RETURN_URL\}\}/g, escapeAttr(returnUrl))
      .replace('{{REMEMBER_CHECKED}}', rememberMe ? 'checked' : '');
    return injectDynamicNav(output, { currentUser: options.currentUser, activePage: 'login' });
  }

  /**
   * Renders the dedicated Member Registration page (views/register.html).
   * @param {Object} options Optional flash messages, errors array, and preserved formData
   * @returns {string} Fully rendered HTML string
   */
  static renderRegister(options = {}) {
    const template = fs.readFileSync(registerTemplatePath, 'utf-8');
    const formData = options.formData || {};
    const selectedRole = String(formData.role || 'alumni').toLowerCase();

    let messageHtml = '';
    if (Array.isArray(options.errors) && options.errors.length > 0) {
      const items = options.errors.map(e => `<li>${escapeAttr(e)}</li>`).join('');
      messageHtml = `<div class="alert-danger"><strong>Registration could not be completed:</strong><ul>${items}</ul></div>`;
    } else if (options.message) {
      const alertClass = options.alertType ? `alert-${options.alertType}` : 'alert-success';
      messageHtml = `<div class="${alertClass}">${options.message}</div>`;
    }

    const output = template
      .replace('{{MESSAGE}}', messageHtml)
      .replace(/\{\{FORM_NAME\}\}/g, escapeAttr(formData.name || ''))
      .replace(/\{\{FORM_EMAIL\}\}/g, escapeAttr(formData.email || ''))
      .replace(/\{\{FORM_DEPARTMENT\}\}/g, escapeAttr(formData.department || ''))
      .replace(/\{\{FORM_GRADUATION_YEAR\}\}/g, escapeAttr(formData.graduationYear || '2024'))
      .replace(/\{\{FORM_STUDENT_NUMBER\}\}/g, escapeAttr(formData.studentNumber || ''))
      .replace(/\{\{FORM_TITLE\}\}/g, escapeAttr(formData.title || ''))
      .replace(/\{\{FORM_COMPANY\}\}/g, escapeAttr(formData.company || ''))
      .replace(/\{\{FORM_LINKEDIN_URL\}\}/g, escapeAttr(formData.linkedinUrl || ''))
      .replace('{{FORM_IS_MENTOR_CHECKED}}', formData.isMentor ? 'checked' : '')
      .replace('{{ROLE_ALUMNI_SELECTED}}', selectedRole === 'alumni' ? 'selected' : '')
      .replace('{{ROLE_STUDENT_SELECTED}}', selectedRole === 'student' ? 'selected' : '')
      .replace('{{ROLE_EMPLOYER_SELECTED}}', selectedRole === 'employer' ? 'selected' : '');
    return injectDynamicNav(output, { currentUser: options.currentUser, activePage: 'register' });
  }
  /**
   * Renders the Alumni Directory table with CRUD action buttons and creation form.
   * @param {Array} users List of alumni users
   * @param {Object} options Optional parameters (e.g. flash message or alert type)
   * @returns {string} Fully rendered HTML string
   */
  static renderUsers(users = [], options = {}) {
    let template = fs.readFileSync(usersTemplatePath, 'utf-8');

    const rows = (users || []).map(u => {
      const roleLabel = u.role || 'alumni';
      const mentorTag = u.isMentor
        ? ' <span style="display:inline-block; background:#ecfdf5; color:#059669; border:1px solid #a7f3d0; font-size:0.7rem; font-weight:700; padding:1px 7px; border-radius:999px; margin-left:4px;">🤝 Mentor</span>'
        : '';
      const roleTag = `<span style="display:inline-block; background:#eff6ff; color:#1d4ed8; font-size:0.7rem; font-weight:700; padding:1px 7px; border-radius:999px; margin-left:6px; text-transform:uppercase;">${escapeAttr(roleLabel)}</span>`;
      const subtitleLine = (u.title || u.company)
        ? `<div style="font-size:0.78rem; color:#64748b; margin-top:2px;">${escapeAttr([u.title, u.company].filter(Boolean).join(' @ '))}</div>`
        : '';
      return `
      <tr>
        <td>${u.id}</td>
        <td><strong>${u.name}</strong>${roleTag}${mentorTag}${subtitleLine}</td>
        <td>${u.department}</td>
        <td>${u.graduationYear}</td>
        <td>${u.email}</td>
        <td>
          <div class="actions-cell">
            <a href="/users/${u.id}" class="btn-sm btn-view">👁️ View</a>
            <a href="/users/${u.id}/edit" class="btn-sm btn-edit">✏️ Edit</a>
            <form action="/users/${u.id}/delete" method="POST" style="display:inline; margin:0;" onsubmit="return confirm('Delete this alumni record?');">
              <button type="submit" class="btn-sm btn-delete">🗑️ Delete</button>
            </form>
          </div>
        </td>
      </tr>
    `;
    }).join('');

    let messageHtml = '';
    if (options.message) {
      const alertClass = options.alertType ? `alert-${options.alertType}` : 'alert-success';
      messageHtml = `<div class="${alertClass}">${options.message}</div>`;
    }

    const output = template
      .replace('{{USER_ROWS}}', rows)
      .replace('{{MESSAGE}}', messageHtml);
    return injectDynamicNav(output, { currentUser: options.currentUser, activePage: 'users' });
  }

  /**
   * Renders the individual Alumni profile view (Read One / User Workspace).
   * @param {Object} user Alumni user object
   * @param {Object} options Optional context options (including currentUser)
   * @returns {string} Fully rendered HTML string
   */
  static renderUserDetail(user = {}, options = {}) {
    let template = fs.readFileSync(userDetailTemplatePath, 'utf-8');
    const id = user.id != null ? user.id : '';
    const name = escapeAttr(user.name || 'Alumni Profile');
    const dept = escapeAttr(user.department || '');
    const grad = user.graduationYear != null ? user.graduationYear : '';
    const email = escapeAttr(user.email || '');

    const currentUser = options.currentUser || null;
    const isOwner = Boolean(currentUser && ((currentUser.id != null && currentUser.id == id) || (currentUser.userId != null && currentUser.userId == id)));
    const isAdmin = Boolean(currentUser && String(currentUser.role || '').toLowerCase() === 'admin');
    const canEdit = isOwner || isAdmin;
    const canDelete = isAdmin;

    const role = String(user.role || 'alumni').toLowerCase();
    const roleMeta = getRoleMeta(role);
    const avatarIcon = roleMeta.icon || '👤';

    const roleBadge = `<span class="badge" style="background:${roleMeta.pillBg}; color:${roleMeta.pillColor}; border:1px solid ${roleMeta.pillBorder}; margin:0;">${roleMeta.icon} ${roleMeta.label}</span>`;

    const status = String(user.accountStatus || 'active').toLowerCase();
    let statusBadge = '<span class="badge" style="background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; margin:0;">● Active</span>';
    let statusLabel = '<span style="color:#059669; font-weight:700;">● Active (Aktif)</span>';
    if (status === 'pending_verification') {
      statusBadge = '<span class="badge" style="background:#fef3c7; color:#92400e; border:1px solid #fde68a; margin:0;">⏳ Pending</span>';
      statusLabel = '<span style="color:#d97706; font-weight:700;">⏳ Onay Bekliyor</span>';
    } else if (status === 'suspended') {
      statusBadge = '<span class="badge" style="background:#fee2e2; color:#991b1b; border:1px solid #fecaca; margin:0;">⚠️ Suspended</span>';
      statusLabel = '<span style="color:#e11d48; font-weight:700;">⚠️ Askıya Alındı</span>';
    } else if (status === 'archived') {
      statusBadge = '<span class="badge" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; margin:0;">📁 Archived</span>';
      statusLabel = '<span style="color:#475569; font-weight:700;">📁 Arşivlendi</span>';
    }

    let mentorBadge = '';
    let mentorRow = '';
    if (user.isMentor) {
      mentorBadge = '<span class="badge" style="background:#faf5ff; color:#6b21a8; border:1px solid #e9d5ff; margin:0;">🌟 Verified Mentor</span>';
      mentorRow = `<div class="detail-row"><strong>Mentorship:</strong><span style="color:#7c3aed; font-weight:700;">🌟 Verified Alumni Mentor (Available for Guidance)</span></div>`;
    }

    const badgesRow = `${roleBadge} ${statusBadge} ${mentorBadge}`;

    let headlineInfo = '';
    if (user.title || user.company) {
      const parts = [];
      if (user.title) parts.push(`<strong>${escapeAttr(user.title)}</strong>`);
      if (user.company) parts.push(`at <strong>${escapeAttr(user.company)}</strong>`);
      headlineInfo = `<div style="font-size:0.9rem; color:#93c5fd; margin-top:4px;">🏢 ${parts.join(' ')}</div>`;
    }

    let extraDetails = '';
    if (user.company) {
      extraDetails += `<div class="detail-row"><strong>Company / Organization:</strong><span>${escapeAttr(user.company)}</span></div>`;
    }
    if (user.title) {
      extraDetails += `<div class="detail-row"><strong>Title / Position:</strong><span>${escapeAttr(user.title)}</span></div>`;
    }
    if (mentorRow) {
      extraDetails += mentorRow;
    }

    let workspaceBanner = '';
    if (isOwner) {
      workspaceBanner = `
        <div style="background:linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%); color:#ffffff; border-radius:12px; padding:18px 22px; margin-bottom:24px; box-shadow:0 4px 14px rgba(30,58,138,0.25); border:1px solid rgba(255,255,255,0.15); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
          <div>
            <div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#93c5fd; margin-bottom:4px;">✨ Kişisel Profil &amp; Çalışma Alanı (Personal Workspace)</div>
            <div style="font-size:1.15rem; font-weight:800;">Hoş geldiniz, ${name}!</div>
            <div style="font-size:0.85rem; color:#cbd5e1; margin-top:2px;">Bu ekran sizin kişisel profilinizdir. Başvurularınızı ve kariyer aktivitelerinizi buradan yönetebilirsiniz.</div>
          </div>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <a href="/users/${id}/edit" class="btn btn-edit" style="font-weight:700;">✏️ Edit Profile</a>
            <a href="/logout" class="btn" style="background:rgba(239,68,68,0.2); color:#fca5a5; border:1px solid rgba(239,68,68,0.4); font-weight:700;">🚪 Çıkış Yap</a>
          </div>
        </div>
      `;
    }

    let roleActivityCard = '';
    if (role === 'student') {
      roleActivityCard = `
        <h2>🎓 Öğrenci Portalı &amp; Kariyer Alanı</h2>
        <div class="rel-card" style="border-left:4px solid #10b981;">
          <h3>📝 Başvurularım &amp; Staj Takibi</h3>
          <p>Yaptığınız staj ve iş başvurularının güncel değerlendirme durumlarını inceleyin.</p>
          <a href="/users/${id}/applications" class="rel-link" style="color:#059669;">Başvurularımı İncele (/users/${id}/applications) &rarr;</a>
        </div>
        <div class="rel-card" style="border-left:4px solid #3b82f6;">
          <h3>💼 Açık İş &amp; Staj İlanları</h3>
          <p>Mezunlar ve kurumsal partnerler tarafından yayınlanan güncel fırsatları keşfedin.</p>
          <a href="/jobs" class="rel-link" style="color:#2563eb;">Kariyer Panosuna Git (/jobs) &rarr;</a>
        </div>
        <div class="rel-card" style="border-left:4px solid #8b5cf6;">
          <h3>👥 Mezun Rehberleri &amp; Mentorlar</h3>
          <p>Sektörde deneyimli İstanbul Üniversitesi mezunlarıyla iletişime geçin ve mentorluk alın.</p>
          <a href="/users" class="rel-link" style="color:#7c3aed;">Mentor Havuzunu Görüntüle (/users) &rarr;</a>
        </div>
      `;
    } else if (role === 'employer') {
      roleActivityCard = `
        <h2>💼 İşveren &amp; İşe Alım Portalı</h2>
        <div class="rel-card" style="border-left:4px solid #8b5cf6;">
          <h3>📢 Yeni İlan Yayınla</h3>
          <p>İstanbul Üniversitesi mezunları ve öğrencileri için yeni bir iş veya staj ilanı oluşturun.</p>
          <a href="/jobs#post-job-form" class="rel-link" style="color:#7c3aed;">Hemen İlan Ver (/jobs) &rarr;</a>
        </div>
        <div class="rel-card" style="border-left:4px solid #3b82f6;">
          <h3>📋 Yayınlanan İlanlarım</h3>
          <p>Şirketiniz adına açılmış tüm kariyer ilanlarını görüntüleyin ve yönetin.</p>
          <a href="/users/${id}/jobs" class="rel-link" style="color:#2563eb;">İlanlarımı Yönet (/users/${id}/jobs) &rarr;</a>
        </div>
        <div class="rel-card" style="border-left:4px solid #10b981;">
          <h3>👥 Aday Başvuruları</h3>
          <p>İlanlarınıza gelen aday başvurularını, CV'leri ve ön yazılarını değerlendirin.</p>
          <a href="/applications" class="rel-link" style="color:#059669;">Adayları Değerlendir (/applications) &rarr;</a>
        </div>
      `;
    } else if (role === 'admin') {
      roleActivityCard = `
        <h2>👑 Yönetici Konsolu &amp; Denetim</h2>
        <div class="rel-card" style="border-left:4px solid #f59e0b;">
          <h3>🛡️ Yönetim Konsolu (Admin Dashboard)</h3>
          <p>Sistem genelindeki tüm kullanıcıları, ilanları, duyuruları ve başvuruları tek ekrandan yönetin.</p>
          <a href="/admin" class="rel-link" style="color:#d97706; font-weight:750;">Yönetim Paneline Git (/admin) &rarr;</a>
        </div>
        <div class="rel-card" style="border-left:4px solid #3b82f6;">
          <h3>💼 Kullanıcı Aktiviteleri</h3>
          <p>Bu kullanıcının sistemdeki tüm kariyer ve başvuru kayıtlarını inceleyin.</p>
          <div style="display:flex; gap:12px; margin-top:8px;">
            <a href="/users/${id}/jobs" class="rel-link">Yayınlanan İlanlar &rarr;</a>
            <a href="/users/${id}/applications" class="rel-link">Yapılan Başvurular &rarr;</a>
          </div>
        </div>
      `;
    } else {
      // Alumni default
      roleActivityCard = `
        <h2>🔗 Mezun Aktiviteleri &amp; Kariyer Ağı</h2>
        <div class="rel-card" style="border-left:4px solid #3b82f6;">
          <h3>💼 Yayınlanan Kariyer İlanları</h3>
          <p>${name} tarafından yayınlanan tüm kariyer fırsatlarını ve açık pozisyonları inceleyin.</p>
          <a href="/users/${id}/jobs" class="rel-link">Yayınlanan İlanlar (/users/${id}/jobs) &rarr;</a>
        </div>
        <div class="rel-card" style="border-left:4px solid #10b981;">
          <h3>📝 İş Başvuruları</h3>
          <p>${name} tarafından yapılan aday başvurularını görüntüleyin.</p>
          <a href="/users/${id}/applications" class="rel-link" style="color:#059669;">Başvuruları Aç (/users/${id}/applications) &rarr;</a>
        </div>
      `;
    }

    const actionsHtml = `
      <a href="/users/${id}/edit" class="btn btn-edit">✏️ Edit Profile</a>
      <form action="/users/${id}/delete" method="POST" style="display:inline;" onsubmit="return confirm('Are you sure you want to delete this profile?');">
        <button type="submit" class="btn btn-delete">🗑️ Delete Profile</button>
      </form>
      <a href="/users" class="btn btn-secondary">← Back to Directory</a>
    `;

    const output = template
      .replace(/{{ID}}/g, id)
      .replace(/{{NAME}}/g, name)
      .replace(/{{DEPARTMENT}}/g, dept)
      .replace(/{{GRADUATION_YEAR}}/g, grad)
      .replace(/{{EMAIL}}/g, email)
      .replace(/{{AVATAR_ICON}}/g, avatarIcon)
      .replace(/{{BADGES_ROW}}/g, badgesRow)
      .replace(/{{ROLE_LABEL}}/g, roleBadge)
      .replace(/{{STATUS_LABEL}}/g, statusLabel)
      .replace(/{{HEADLINE_INFO}}/g, headlineInfo)
      .replace(/{{EXTRA_DETAILS}}/g, extraDetails)
      .replace(/{{PERSONAL_WORKSPACE_BANNER}}/g, workspaceBanner)
      .replace(/{{ACTIONS_HTML}}/g, actionsHtml)
      .replace(/{{ROLE_ACTIVITY_CARD}}/g, roleActivityCard);

    return injectDynamicNav(output, { currentUser: options.currentUser, activePage: 'userdetail' });
  }

  /**
   * Renders the Alumni Edit Form view (Update View).
   * @param {Object} user Alumni user object
   * @param {Object} options Optional context options
   * @returns {string} Fully rendered HTML string
   */
  static renderUserEdit(user = {}, options = {}) {
    let template = fs.readFileSync(userEditTemplatePath, 'utf-8');
    const id = user.id != null ? user.id : '';
    const name = user.name || '';
    const dept = user.department || '';
    const grad = user.graduationYear != null ? user.graduationYear : '';
    const email = user.email || '';

    const output = template
      .replace(/{{ID}}/g, id)
      .replace(/{{NAME}}/g, name)
      .replace(/{{DEPARTMENT}}/g, dept)
      .replace(/{{GRADUATION_YEAR}}/g, grad)
      .replace(/{{EMAIL}}/g, email);
    return injectDynamicNav(output, { currentUser: options.currentUser, activePage: 'useredit' });
  }
}

module.exports = UserView;
