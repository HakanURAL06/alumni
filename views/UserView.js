const fs = require('fs');
const path = require('path');
const { injectDynamicNav, getRoleMeta } = require('./navHelper');

const usersTemplatePath = path.join(__dirname, 'users.html');
const userDetailTemplatePath = path.join(__dirname, 'userDetail.html');
const userEditTemplatePath = path.join(__dirname, 'userEdit.html');
const registerTemplatePath = path.join(__dirname, 'register.html');
const loginTemplatePath = path.join(__dirname, 'login.html');
const profileTemplatePath = path.join(__dirname, 'profile.html');

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

  /**
   * Renders the dedicated User Profile & Personal Workspace view (views/profile.html).
   * Accessible to all authenticated users (students, alumni, employers, moderators, admins).
   * @param {Object} user Current authenticated user record
   * @param {Object} options Jobs, applications, flash alerts, and context
   * @returns {string} Fully rendered HTML string
   */
  static renderProfile(user = {}, options = {}) {
    let template = fs.readFileSync(profileTemplatePath, 'utf-8');

    const id = user.id != null ? user.id : '';
    const name = escapeAttr(user.name || 'Kullanıcı Profili');
    const dept = escapeAttr(user.department || '');
    const grad = user.graduationYear != null ? user.graduationYear : '';
    const email = escapeAttr(user.email || '');
    const title = escapeAttr(user.title || '');
    const company = escapeAttr(user.company || '');
    const studentNumber = escapeAttr(user.studentNumber || '');
    const linkedinUrl = escapeAttr(user.linkedinUrl || '');
    const isMentorChecked = user.isMentor ? 'checked' : '';

    const role = String(user.role || 'alumni').toLowerCase();
    const roleMeta = getRoleMeta(role);
    const avatarIcon = roleMeta.icon || '👤';

    const roleBadge = `<span class="badge" style="background:${roleMeta.pillBg}; color:${roleMeta.pillColor}; border:1px solid ${roleMeta.pillBorder};">${roleMeta.icon} ${roleMeta.label}</span>`;

    const status = String(user.accountStatus || 'active').toLowerCase();
    let statusBadge = '<span class="badge" style="background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0;">● Aktif Hesap</span>';
    if (status === 'pending_verification') {
      statusBadge = '<span class="badge" style="background:#fef3c7; color:#92400e; border:1px solid #fde68a;">⏳ Onay Bekliyor</span>';
    } else if (status === 'suspended') {
      statusBadge = '<span class="badge" style="background:#fee2e2; color:#991b1b; border:1px solid #fecaca;">⚠️ Askıya Alındı</span>';
    } else if (status === 'archived') {
      statusBadge = '<span class="badge" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1;">📁 Arşivlendi</span>';
    }

    let mentorBadge = '';
    if (user.isMentor) {
      mentorBadge = '<span class="badge" style="background:#faf5ff; color:#6b21a8; border:1px solid #e9d5ff;">🌟 Verified Mentor</span>';
    }

    let headlineInfo = '';
    if (user.title || user.company) {
      const parts = [];
      if (user.title) parts.push(`<strong>${escapeAttr(user.title)}</strong>`);
      if (user.company) parts.push(`at <strong>${escapeAttr(user.company)}</strong>`);
      headlineInfo = `<div style="font-size:0.9rem; color:#93c5fd; margin-top:6px;">🏢 ${parts.join(' ')}</div>`;
    }

    // Flash Messages & Errors
    let messageHtml = '';
    if (options.message) {
      const alertClass = options.alertType ? `alert-${options.alertType}` : 'alert-success';
      messageHtml = `<div class="${alertClass}">${escapeAttr(options.message)}</div>`;
    }

    let errorHtml = '';
    if (options.error) {
      errorHtml = `<div class="alert-danger"><strong>Hata:</strong> ${escapeAttr(options.error)}</div>`;
    }

    // Format Jobs
    const jobs = Array.isArray(options.jobs) ? options.jobs : [];
    let jobsContent = '';
    if (jobs.length === 0) {
      jobsContent = `
        <div class="empty-state">
          <div class="empty-icon">💼</div>
          <div class="empty-title">Henüz Yayınlanmış İlanınız Yok</div>
          <div class="empty-desc">İstanbul Üniversitesi öğrencileri ve mezunları ile şirketinizdeki açık pozisyonları buluşturmak için yeni bir ilan yayınlayabilirsiniz.</div>
          <a href="/jobs#post-job-form" class="btn btn-primary">📢 İlk İlanınızı Yayınlayın</a>
        </div>
      `;
    } else {
      const rows = jobs.map(j => {
        const jId = j.id != null ? j.id : '';
        const jTitle = escapeAttr(j.title || 'Pozisyon');
        const jCompany = escapeAttr(j.company || '');
        const jType = escapeAttr(j.jobType || 'Full-time');
        const jLocation = escapeAttr(j.location || 'Remote');
        const jSalary = escapeAttr(j.salary || 'Belirtilmedi');
        const jDeadline = escapeAttr(j.applicationDeadline || '-');
        const jStatus = escapeAttr(j.status || 'Active');
        const statusClass = String(jStatus).toLowerCase() === 'active' ? 'background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0;' : 'background:#f1f5f9; color:#475569; border:1px solid #cbd5e1;';

        return `
          <tr>
            <td><strong>#${jId}</strong></td>
            <td>
              <div style="font-weight:750; color:#0f172a;">${jTitle}</div>
              <div style="font-size:0.8rem; color:#64748b;">${jCompany}</div>
            </td>
            <td>
              <div>${jType}</div>
              <div style="font-size:0.78rem; color:#64748b;">📍 ${jLocation}</div>
            </td>
            <td>${jSalary}</td>
            <td><span class="badge" style="${statusClass}">${jStatus}</span></td>
            <td>${jDeadline}</td>
            <td>
              <div style="display:flex; gap:6px;">
                <a href="/jobs/${jId}" class="btn-sm btn-secondary" style="text-decoration:none;">👁️ İncele</a>
                <a href="/jobs/${jId}/edit" class="btn-sm btn-secondary" style="text-decoration:none;">✏️ Düzenle</a>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      jobsContent = `
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Pozisyon &amp; Şirket</th>
                <th>Tür &amp; Konum</th>
                <th>Maaş</th>
                <th>Durum</th>
                <th>Son Başvuru</th>
                <th>Eylemler</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      `;
    }

    // Format Applications
    const applications = Array.isArray(options.applications) ? options.applications : [];
    let applicationsContent = '';
    if (applications.length === 0) {
      applicationsContent = `
        <div class="empty-state">
          <div class="empty-icon">📝</div>
          <div class="empty-title">Henüz Başvuru Yapmadınız</div>
          <div class="empty-desc">İstanbul Üniversitesi kariyer panosundaki güncel açık pozisyonları inceleyip hemen başvuruda bulunabilirsiniz.</div>
          <a href="/jobs" class="btn btn-primary">💼 Açık Pozisyonları İncele</a>
        </div>
      `;
    } else {
      const rows = applications.map(app => {
        const aId = app.id != null ? app.id : '';
        const jTitle = escapeAttr(app.jobPosting?.title || app.jobTitle || `İlan #${app.jobPostingId}`);
        const jCompany = escapeAttr(app.jobPosting?.company || app.jobCompany || '');
        const aDate = app.appliedAt ? escapeAttr(String(app.appliedAt).split('T')[0]) : '-';
        const aStatus = String(app.status || 'Pending');

        let stStyle = 'background:#fef3c7; color:#92400e; border:1px solid #fde68a;';
        let stIcon = '⏳';
        if (aStatus.toLowerCase() === 'reviewed' || aStatus.toLowerCase() === 'under review') {
          stStyle = 'background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe;';
          stIcon = '🔍';
        } else if (aStatus.toLowerCase() === 'accepted') {
          stStyle = 'background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0;';
          stIcon = '✅';
        } else if (aStatus.toLowerCase() === 'rejected') {
          stStyle = 'background:#fee2e2; color:#991b1b; border:1px solid #fecaca;';
          stIcon = '❌';
        }

        const noteSnippet = app.coverNote ? escapeAttr(app.coverNote.length > 50 ? app.coverNote.substring(0, 50) + '...' : app.coverNote) : '<span style="color:#94a3b8;">Not yok</span>';
        const resumeLink = app.resumeUrl ? `<a href="${escapeAttr(app.resumeUrl)}" target="_blank" rel="noopener" style="color:#2563eb; font-weight:600; text-decoration:none;">📄 Özgeçmiş (CV)</a>` : '<span style="color:#94a3b8;">Belirtilmedi</span>';

        return `
          <tr>
            <td><strong>#${aId}</strong></td>
            <td>
              <div style="font-weight:750; color:#0f172a;">${jTitle}</div>
              <div style="font-size:0.8rem; color:#64748b;">${jCompany}</div>
            </td>
            <td>${aDate}</td>
            <td><span class="badge" style="${stStyle}">${stIcon} ${escapeAttr(aStatus)}</span></td>
            <td style="max-width:200px; font-size:0.82rem; color:#475569;">${noteSnippet}</td>
            <td>${resumeLink}</td>
            <td>
              <a href="/jobs/${app.jobPostingId}" class="btn-sm btn-secondary" style="text-decoration:none;">İlanı Gör &rarr;</a>
            </td>
          </tr>
        `;
      }).join('');

      applicationsContent = `
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Başvurulan İlan</th>
                <th>Başvuru Tarihi</th>
                <th>Durum</th>
                <th>Ön Yazı Özeti</th>
                <th>Özgeçmiş</th>
                <th>Eylem</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      `;
    }

    // Format Role Tools Content
    let roleToolsContent = '';
    if (role === 'student') {
      roleToolsContent = `
        <div class="quick-actions-grid">
          <div class="quick-card" style="border-left: 4px solid #10b981;">
            <div>
              <h3>💼 Açık İş &amp; Staj İlanları</h3>
              <p>Mezunlar ve kurumsal ortaklar tarafından açılan güncel staj ve tam zamanlı pozisyonları keşfedin.</p>
            </div>
            <a href="/jobs">İlan Panosuna Git (/jobs) &rarr;</a>
          </div>
          <div class="quick-card" style="border-left: 4px solid #3b82f6;">
            <div>
              <h3>🤝 Mezun Rehberleri &amp; Mentorlar</h3>
              <p>Farklı sektörlerde deneyim kazanmış İstanbul Üniversitesi mezunlarıyla iletişime geçin.</p>
            </div>
            <a href="/users">Mentor Havuzunu Keşfet (/users) &rarr;</a>
          </div>
          <div class="quick-card" style="border-left: 4px solid #8b5cf6;">
            <div>
              <h3>📝 Başvuru Takip Paneli</h3>
              <p>Yaptığınız tüm başvuruların durumunu ve işveren geri bildirimlerini anlık olarak takip edin.</p>
            </div>
            <a href="/applications">Başvurularımı İncele (/applications) &rarr;</a>
          </div>
          <div class="quick-card" style="border-left: 4px solid #f59e0b;">
            <div>
              <h3>📢 Kampüs &amp; Kariyer Duyuruları</h3>
              <p>Kariyer günleri, staj seminerleri ve mezunlar derneği etkinliklerini takip edin.</p>
            </div>
            <a href="/announcements">Duyuruları İncele (/announcements) &rarr;</a>
          </div>
        </div>
      `;
    } else if (role === 'employer') {
      roleToolsContent = `
        <div class="quick-actions-grid">
          <div class="quick-card" style="border-left: 4px solid #8b5cf6;">
            <div>
              <h3>📢 Yeni İlan Yayınla</h3>
              <p>Şirketiniz adına yeni staj, part-time veya tam zamanlı kariyer fırsatı yayınlayın.</p>
            </div>
            <a href="/jobs#post-job-form">Yeni İlan Oluştur (/jobs) &rarr;</a>
          </div>
          <div class="quick-card" style="border-left: 4px solid #3b82f6;">
            <div>
              <h3>👥 Aday Değerlendirme Paneli</h3>
              <p>İlanlarınıza başvuran adayların CV'lerini, ön yazılarını ve yetkinliklerini değerlendirin.</p>
            </div>
            <a href="/applications">Adayları Yönet (/applications) &rarr;</a>
          </div>
          <div class="quick-card" style="border-left: 4px solid #10b981;">
            <div>
              <h3>🎓 Yetenek Havuzu (Alumni Directory)</h3>
              <p>İstanbul Üniversitesi'nden mezun mühendis, yönetici ve uzman profil havuzunu inceleyin.</p>
            </div>
            <a href="/users">Yetenek Havuzuna Git (/users) &rarr;</a>
          </div>
          <div class="quick-card" style="border-left: 4px solid #f59e0b;">
            <div>
              <h3>📢 Kurumsal Etkinlik &amp; Duyuru</h3>
              <p>Şirketinizin kariyer günleri ve workshop etkinliklerini duyuru olarak paylaşın.</p>
            </div>
            <a href="/announcements">Duyurulara Git (/announcements) &rarr;</a>
          </div>
        </div>
      `;
    } else if (role === 'admin') {
      roleToolsContent = `
        <div class="quick-actions-grid">
          <div class="quick-card" style="border-left: 4px solid #ef4444;">
            <div>
              <h3>🛡️ Merkezi Yönetim Konsolu (Admin)</h3>
              <p>Tüm kullanıcıları, rolleri, hesap statülerini ve veri manipülasyon işlemlerini yönetin.</p>
            </div>
            <a href="/admin">Yönetim Konsolunu Aç (/admin) &rarr;</a>
          </div>
          <div class="quick-card" style="border-left: 4px solid #3b82f6;">
            <div>
              <h3>👥 Kullanıcı Rol &amp; Statü Denetimi</h3>
              <p>Kullanıcıların rollerini (student, alumni, employer, moderator, admin) atayın ve denetleyin.</p>
            </div>
            <a href="/admin#users-table">Kullanıcı Yönetimi &rarr;</a>
          </div>
          <div class="quick-card" style="border-left: 4px solid #10b981;">
            <div>
              <h3>💼 İlan &amp; Başvuru Moderasyonu</h3>
              <p>Sistemdeki tüm kariyer ilanlarını ve yapılan başvuruları merkezi olarak denetleyin.</p>
            </div>
            <a href="/admin#governance-forms">Yönetim Araçları &rarr;</a>
          </div>
          <div class="quick-card" style="border-left: 4px solid #8b5cf6;">
            <div>
              <h3>📖 Swagger API Dokümantasyonu</h3>
              <p>Tüm RESTful uç noktalarının OpenAPI / Swagger teknik dokümantasyonunu inceleyin.</p>
            </div>
            <a href="/api/swagger" target="_blank" rel="noopener">Swagger Dokümantasyonu &rarr;</a>
          </div>
        </div>
      `;
    } else {
      // Alumni default
      roleToolsContent = `
        <div class="quick-actions-grid">
          <div class="quick-card" style="border-left: 4px solid #3b82f6;">
            <div>
              <h3>💼 Mezun Kariyer Panosu</h3>
              <p>İstanbul Üniversitesi mezunlarına özel kariyer fırsatlarını ve açık pozisyonları inceleyin.</p>
            </div>
            <a href="/jobs">Kariyer Panosuna Git (/jobs) &rarr;</a>
          </div>
          <div class="quick-card" style="border-left: 4px solid #10b981;">
            <div>
              <h3>🤝 Öğrencilere Mentorluk Verin</h3>
              <p>Deneyimlerinizi ve sektör tecrübenizi yeni mezunlar ve üniversite öğrencileri ile paylaşın.</p>
            </div>
            <a href="#tab-overview" onclick="document.querySelector('[data-tab=tab-overview]').click();">Mentorluk Ayarları &rarr;</a>
          </div>
          <div class="quick-card" style="border-left: 4px solid #8b5cf6;">
            <div>
              <h3>👥 Mezunlar Ağı &amp; Rehber</h3>
              <p>Dönem arkadaşlarınızı bulun ve profesyonel ağınızı İstanbul Üniversitesi mezunlarıyla büyütün.</p>
            </div>
            <a href="/users">Mezunlar Rehberine Git (/users) &rarr;</a>
          </div>
          <div class="quick-card" style="border-left: 4px solid #f59e0b;">
            <div>
              <h3>📢 Mezunlar Derneği Duyuruları</h3>
              <p>Geleneksel mezun buluşmaları, akademik etkinlikler ve haberlerden anında haberdar olun.</p>
            </div>
            <a href="/announcements">Duyuruları İncele (/announcements) &rarr;</a>
          </div>
        </div>
      `;
    }

    const output = template
      .replace(/{{ID}}/g, id)
      .replace(/{{NAME}}/g, name)
      .replace(/{{DEPARTMENT}}/g, dept)
      .replace(/{{GRADUATION_YEAR}}/g, grad)
      .replace(/{{EMAIL}}/g, email)
      .replace(/{{TITLE}}/g, title)
      .replace(/{{COMPANY}}/g, company)
      .replace(/{{STUDENT_NUMBER}}/g, studentNumber)
      .replace(/{{LINKEDIN_URL}}/g, linkedinUrl)
      .replace(/{{IS_MENTOR_CHECKED}}/g, isMentorChecked)
      .replace(/{{AVATAR_ICON}}/g, avatarIcon)
      .replace(/{{ROLE_BADGE}}/g, roleBadge)
      .replace(/{{STATUS_BADGE}}/g, statusBadge)
      .replace(/{{MENTOR_BADGE}}/g, mentorBadge)
      .replace(/{{HEADLINE_INFO}}/g, headlineInfo)
      .replace(/{{ROLE_NAME_TR}}/g, roleMeta.label)
      .replace(/{{JOBS_COUNT}}/g, jobs.length)
      .replace(/{{APPLICATIONS_COUNT}}/g, applications.length)
      .replace(/{{MY_JOBS_CONTENT}}/g, jobsContent)
      .replace(/{{MY_APPLICATIONS_CONTENT}}/g, applicationsContent)
      .replace(/{{ROLE_TOOLS_CONTENT}}/g, roleToolsContent)
      .replace(/{{MESSAGE}}/g, messageHtml)
      .replace(/{{ERROR}}/g, errorHtml);

    return injectDynamicNav(output, { currentUser: options.currentUser || user, activePage: 'profile' });
  }
}

module.exports = UserView;
