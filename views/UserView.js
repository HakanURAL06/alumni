const fs = require('fs');
const path = require('path');

const usersTemplatePath = path.join(__dirname, 'users.html');
const userDetailTemplatePath = path.join(__dirname, 'userDetail.html');
const userEditTemplatePath = path.join(__dirname, 'userEdit.html');

/**
 * UserView
 * Handles rendering HTML views for user resources (MVC View Layer).
 */
class UserView {
  /**
   * Renders the Alumni Directory table with CRUD action buttons and creation form.
   * @param {Array} users List of alumni users
   * @param {Object} options Optional parameters (e.g. flash message or alert type)
   * @returns {string} Fully rendered HTML string
   */
  static renderUsers(users = [], options = {}) {
    let template = fs.readFileSync(usersTemplatePath, 'utf-8');

    const rows = (users || []).map(u => `
      <tr>
        <td>${u.id}</td>
        <td><strong>${u.name}</strong></td>
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
    `).join('');

    let messageHtml = '';
    if (options.message) {
      const alertClass = options.alertType ? `alert-${options.alertType}` : 'alert-success';
      messageHtml = `<div class="${alertClass}">${options.message}</div>`;
    }

    return template
      .replace('{{USER_ROWS}}', rows)
      .replace('{{MESSAGE}}', messageHtml);
  }

  /**
   * Renders the individual Alumni profile view (Read One).
   * @param {Object} user Alumni user object
   * @returns {string} Fully rendered HTML string
   */
  static renderUserDetail(user = {}) {
    let template = fs.readFileSync(userDetailTemplatePath, 'utf-8');
    const id = user.id != null ? user.id : '';
    const name = user.name || 'Alumni Profile';
    const dept = user.department || '';
    const grad = user.graduationYear != null ? user.graduationYear : '';
    const email = user.email || '';

    return template
      .replace(/{{ID}}/g, id)
      .replace(/{{NAME}}/g, name)
      .replace(/{{DEPARTMENT}}/g, dept)
      .replace(/{{GRADUATION_YEAR}}/g, grad)
      .replace(/{{EMAIL}}/g, email);
  }

  /**
   * Renders the Alumni Edit Form view (Update View).
   * @param {Object} user Alumni user object
   * @returns {string} Fully rendered HTML string
   */
  static renderUserEdit(user = {}) {
    let template = fs.readFileSync(userEditTemplatePath, 'utf-8');
    const id = user.id != null ? user.id : '';
    const name = user.name || '';
    const dept = user.department || '';
    const grad = user.graduationYear != null ? user.graduationYear : '';
    const email = user.email || '';

    return template
      .replace(/{{ID}}/g, id)
      .replace(/{{NAME}}/g, name)
      .replace(/{{DEPARTMENT}}/g, dept)
      .replace(/{{GRADUATION_YEAR}}/g, grad)
      .replace(/{{EMAIL}}/g, email);
  }
}

module.exports = UserView;
