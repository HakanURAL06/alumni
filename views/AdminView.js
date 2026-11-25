const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const { injectDynamicNav } = require('./navHelper');

const adminTemplatePath = path.join(__dirname, 'admin.html');

function escapeAttr(val) {
  return String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

class AdminView {
  /**
   * Renders the Central Administration Console view (views/admin.html).
   * @param {Object} data Entities and administrative metrics
   * @param {Object} options Flash message, currentUser, etc.
   * @returns {string} Fully rendered HTML string
   */
  static renderDashboard(data = {}, options = {}) {
    const template = fs.readFileSync(adminTemplatePath, 'utf-8');
    const users = Array.isArray(data.users) ? data.users : [];
    const jobs = Array.isArray(data.jobs) ? data.jobs : [];
    const announcements = Array.isArray(data.announcements) ? data.announcements : [];
    const applications = Array.isArray(data.applications) ? data.applications : [];
    const currentUser = options.currentUser || data.currentUser || { name: 'Administrator', email: 'admin@istanbul.edu.tr' };

    // 1. Flash Messages
    let messageHtml = '';
    if (options.message) {
      const alertClass = options.alertType ? `alert-${options.alertType}` : 'alert-success';
      messageHtml = `<div class="${alertClass}">${options.message}</div>`;
    }

    // 2. User Rows
    const userRows = users.map(u => {
      const currentRole = String(u.role || 'alumni').toLowerCase();
      const currentStatus = String(u.accountStatus || 'active').toLowerCase();

      const roleOptions = User.VALID_USER_ROLES.map(r =>
        `<option value="${r}" ${r === currentRole ? 'selected' : ''}>${r.toUpperCase()}</option>`
      ).join('');

      const statusOptions = User.VALID_ACCOUNT_STATUSES.map(s =>
        `<option value="${s}" ${s === currentStatus ? 'selected' : ''}>${s}</option>`
      ).join('');

      return `
        <tr>
          <td><strong>#${u.id}</strong></td>
          <td>
            <strong>${escapeAttr(u.name)}</strong>
            ${u.title || u.company ? `<div style="font-size:0.75rem; color:#64748b;">${escapeAttr([u.title, u.company].filter(Boolean).join(' @ '))}</div>` : ''}
          </td>
          <td><code>${escapeAttr(u.email)}</code></td>
          <td>${escapeAttr(u.department || '—')} (${u.graduationYear || '—'})</td>
          <td><span class="badge-pill badge-${currentRole}">${currentRole}</span></td>
          <td><span class="badge-pill status-${currentStatus}">${currentStatus}</span></td>
          <td>
            <form action="/admin/users/${u.id}/role" method="POST" class="action-form">
              <select name="role" class="action-select">${roleOptions}</select>
              <button type="submit" class="btn-action-apply">Assign</button>
            </form>
          </td>
          <td>
            <form action="/admin/users/${u.id}/status" method="POST" class="action-form">
              <select name="status" class="action-select">${statusOptions}</select>
              <button type="submit" class="btn-action-apply">Update</button>
            </form>
          </td>
          <td>
            <div style="display:flex; gap:6px; align-items:center;">
              <a href="/users/${u.id}/edit" class="btn-action-apply" style="text-decoration:none; padding:4px 8px; font-size:0.75rem;">✏️</a>
              <form action="/admin/users/${u.id}/delete" method="POST" class="action-form" onsubmit="return confirm('Delete user #${u.id} (${escapeAttr(u.name)})?');">
                <button type="submit" class="btn-action-delete">🗑️</button>
              </form>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // 3. Job Rows
    const jobRows = jobs.map(j => {
      const currentStatus = String(j.status || 'Active');
      return `
        <tr>
          <td><strong>#${j.id}</strong></td>
          <td>
            <strong>${escapeAttr(j.title)}</strong>
            <div style="font-size:0.75rem; color:#64748b;">${escapeAttr(j.company)}</div>
          </td>
          <td>${escapeAttr(j.location || '—')} &bull; <em>${escapeAttr(j.jobType || 'Full-time')}</em></td>
          <td><span class="badge-pill status-${currentStatus.toLowerCase()}">${escapeAttr(currentStatus)}</span></td>
          <td>User #${j.postedBy || '—'}</td>
          <td>
            <form action="/admin/jobs/${j.id}/status" method="POST" class="action-form">
              <select name="status" class="action-select">
                <option value="Active" ${currentStatus === 'Active' ? 'selected' : ''}>Active</option>
                <option value="Draft" ${currentStatus === 'Draft' ? 'selected' : ''}>Draft</option>
                <option value="Closed" ${currentStatus === 'Closed' ? 'selected' : ''}>Closed</option>
              </select>
              <button type="submit" class="btn-action-apply">Set</button>
            </form>
          </td>
          <td>
            <form action="/admin/jobs/${j.id}/delete" method="POST" class="action-form" onsubmit="return confirm('Delete job posting #${j.id}?');">
              <button type="submit" class="btn-action-delete">🗑️ Delete</button>
            </form>
          </td>
        </tr>
      `;
    }).join('');

    // 4. Announcement Rows
    const announcementRows = announcements.map(a => `
      <tr>
        <td><strong>#${a.id}</strong></td>
        <td><strong>${escapeAttr(a.title)}</strong></td>
        <td><span class="badge-pill badge-moderator">${escapeAttr(a.category || 'General')}</span></td>
        <td>${escapeAttr(a.author || 'University')}</td>
        <td><code>${escapeAttr(a.date || '—')}</code></td>
        <td>
          <form action="/admin/announcements/${a.id}/delete" method="POST" class="action-form" onsubmit="return confirm('Delete announcement #${a.id}?');">
            <button type="submit" class="btn-action-delete">🗑️ Delete</button>
          </form>
        </td>
      </tr>
    `).join('');

    // 5. KPI Breakdowns
    const rolesCount = users.reduce((acc, u) => {
      const r = u.role || 'alumni';
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {});
    const usersBreakdown = Object.entries(rolesCount).map(([r, c]) => `${c} ${r}`).join(' &bull; ');

    const jobsCount = jobs.reduce((acc, j) => {
      const s = j.status || 'Active';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    const jobsBreakdown = Object.entries(jobsCount).map(([s, c]) => `${c} ${s}`).join(' &bull; ');

    const output = template
      .replace('{{MESSAGE}}', messageHtml)
      .replace('{{CURRENT_ADMIN_NAME}}', escapeAttr(currentUser.name || 'Administrator'))
      .replace('{{CURRENT_ADMIN_EMAIL}}', escapeAttr(currentUser.email || 'admin@istanbul.edu.tr'))
      .replace('{{METRIC_USERS_COUNT}}', String(users.length))
      .replace('{{METRIC_USERS_BREAKDOWN}}', usersBreakdown || 'All active accounts')
      .replace('{{METRIC_JOBS_COUNT}}', String(jobs.length))
      .replace('{{METRIC_JOBS_BREAKDOWN}}', jobsBreakdown || 'Live postings')
      .replace('{{METRIC_APPS_COUNT}}', String(applications.length))
      .replace('{{METRIC_APPS_BREAKDOWN}}', `${applications.filter(a => a.status === 'Accepted').length} accepted`)
      .replace('{{METRIC_ANNOUNCEMENTS_COUNT}}', String(announcements.length))
      .replace('{{METRIC_ANNOUNCEMENTS_BREAKDOWN}}', 'Active campus bulletins')
      .replace('{{USER_ROWS}}', userRows || '<tr><td colspan="9" style="text-align:center;">No users registered yet.</td></tr>')
      .replace('{{JOB_ROWS}}', jobRows || '<tr><td colspan="7" style="text-align:center;">No job postings available.</td></tr>')
      .replace('{{ANNOUNCEMENT_ROWS}}', announcementRows || '<tr><td colspan="6" style="text-align:center;">No announcements published.</td></tr>');
    return injectDynamicNav(output, { currentUser, activePage: 'admin' });
  }
}

module.exports = AdminView;
