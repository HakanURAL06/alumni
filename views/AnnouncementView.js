const fs = require('fs');
const path = require('path');

const announcementsTemplatePath = path.join(__dirname, 'announcements.html');
const announcementDetailTemplatePath = path.join(__dirname, 'announcementDetail.html');
const announcementEditTemplatePath = path.join(__dirname, 'announcementEdit.html');

/**
 * AnnouncementView
 * Handles rendering HTML views for Announcement resources (MVC View Layer).
 */
class AnnouncementView {
  /**
   * Renders the Announcements management table and creation form.
   * @param {Array} announcements List of announcements
   * @param {Object} options Flash message or alertType
   * @returns {string} Fully rendered HTML string
   */
  static renderAnnouncements(announcements = [], options = {}) {
    let template = fs.readFileSync(announcementsTemplatePath, 'utf-8');

    const rows = (announcements || []).map(a => `
      <tr>
        <td>${a.id}</td>
        <td><strong>${a.title}</strong></td>
        <td><span class="category-badge category-${a.category}">${a.category}</span></td>
        <td>${a.author}</td>
        <td>${a.date}</td>
        <td>
          <div class="actions-cell">
            <a href="/announcements/${a.id}" class="btn-sm btn-view">👁️ View</a>
            <a href="/announcements/${a.id}/edit" class="btn-sm btn-edit">✏️ Edit</a>
            <form action="/announcements/${a.id}/delete" method="POST" style="display:inline; margin:0;" onsubmit="return confirm('Delete this announcement?');">
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
      .replace('{{ANNOUNCEMENT_ROWS}}', rows)
      .replace('{{MESSAGE}}', messageHtml);
  }

  /**
   * Renders single announcement detail view.
   * @param {Object} announcement Announcement object
   * @returns {string} Fully rendered HTML string
   */
  static renderAnnouncementDetail(announcement = {}) {
    let template = fs.readFileSync(announcementDetailTemplatePath, 'utf-8');
    const id = announcement.id != null ? announcement.id : '';
    const title = announcement.title || 'Announcement';
    const category = announcement.category || 'General';
    const author = announcement.author || 'Alumni Office';
    const date = announcement.date || '';
    const content = announcement.content || '';

    return template
      .replace(/{{ID}}/g, id)
      .replace(/{{TITLE}}/g, title)
      .replace(/{{CATEGORY}}/g, category)
      .replace(/{{AUTHOR}}/g, author)
      .replace(/{{DATE}}/g, date)
      .replace(/{{CONTENT}}/g, content);
  }

  /**
   * Renders edit announcement form view.
   * @param {Object} announcement Announcement object
   * @returns {string} Fully rendered HTML string
   */
  static renderAnnouncementEdit(announcement = {}) {
    let template = fs.readFileSync(announcementEditTemplatePath, 'utf-8');
    const id = announcement.id != null ? announcement.id : '';
    const title = announcement.title || '';
    const category = announcement.category || 'General';
    const author = announcement.author || '';
    const date = announcement.date || '';
    const content = announcement.content || '';

    return template
      .replace(/{{ID}}/g, id)
      .replace(/{{TITLE}}/g, title)
      .replace(/{{CATEGORY}}/g, category)
      .replace(/{{AUTHOR}}/g, author)
      .replace(/{{DATE}}/g, date)
      .replace(/{{CONTENT}}/g, content);
  }
}

module.exports = AnnouncementView;
