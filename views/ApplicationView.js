const fs = require('fs');
const path = require('path');

const applicationsTemplatePath = path.join(__dirname, 'applications.html');
const applicationDetailTemplatePath = path.join(__dirname, 'applicationDetail.html');

/**
 * ApplicationView
 * Handles rendering HTML views for Application resources (MVC View Layer).
 */
class ApplicationView {
  /**
   * Renders the Applications management dashboard and candidate review table.
   * @param {Array} applications List of applications (with candidate/job details if available)
   * @param {Object} options Flash message or alertType
   * @returns {string} Fully rendered HTML string
   */
  static renderApplications(applications = [], options = {}) {
    let template = fs.readFileSync(applicationsTemplatePath, 'utf-8');

    const totalCount = applications.length;
    const submittedCount = applications.filter(a => a.status === 'Submitted').length;
    const reviewCount = applications.filter(a => a.status === 'Under Review' || a.status === 'Interviewing').length;
    const acceptedCount = applications.filter(a => a.status === 'Accepted').length;

    const rows = (applications || []).map(a => {
      const candidateName = a.user ? a.user.name : (a.candidateName || `Alumni #${a.userId}`);
      const candidateEmail = a.user ? a.user.email : '';
      const jobTitle = a.jobPosting ? a.jobPosting.title : (a.jobTitle || `Job #${a.jobPostingId}`);
      const company = a.jobPosting ? a.jobPosting.company : (a.jobCompany || '');
      const appliedDate = a.appliedAt ? (typeof a.appliedAt === 'string' ? a.appliedAt.split('T')[0] : a.appliedAt) : 'Recent';

      const resumeButton = a.resumeUrl
        ? `<a href="${a.resumeUrl}" target="_blank" class="btn-sm btn-resume">📄 Resume</a>`
        : `<span style="color:#94a3b8; font-size:0.8rem;">None</span>`;

      return `
        <tr>
          <td>#${a.id}</td>
          <td>
            <a href="/users/${a.userId}" style="color:#0f172a; font-weight:600; text-decoration:none;">${candidateName}</a>
            <div style="font-size:0.8rem; color:#64748b;">${candidateEmail}</div>
          </td>
          <td>
            <a href="/jobs/${a.jobPostingId}" style="color:#2563eb; font-weight:600; text-decoration:none;">${jobTitle}</a>
            <div style="font-size:0.8rem; color:#64748b;">${company}</div>
          </td>
          <td>${resumeButton}</td>
          <td>
            <div style="max-width:200px; font-size:0.85rem; color:#334155; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${a.coverNote || ''}">
              ${a.coverNote || '<em>No cover note</em>'}
            </div>
          </td>
          <td>
            <span class="status-pill status-${(a.status || 'Submitted').replace(/\s+/g, '')}">${a.status || 'Submitted'}</span>
          </td>
          <td>${appliedDate}</td>
          <td>
            <div class="actions-cell">
              <a href="/applications/${a.id}" class="btn-sm btn-view">👁️ Review</a>
              <form action="/applications/${a.id}/status" method="POST" style="display:inline; margin:0;">
                <select name="status" onchange="this.form.submit()" style="padding:4px 6px; font-size:0.75rem; border-radius:4px; border:1px solid #cbd5e1;">
                  <option value="" disabled selected>Change Status...</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </form>
              <form action="/applications/${a.id}/delete" method="POST" style="display:inline; margin:0;" onsubmit="return confirm('Withdraw/delete this application?');">
                <button type="submit" class="btn-sm btn-delete">🗑️</button>
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

    const subtitle = options.subtitle || 'Track, evaluate, and manage candidate submissions across career opportunities.';

    return template
      .replace('{{APPLICATION_ROWS}}', rows)
      .replace('{{MESSAGE}}', messageHtml)
      .replace('{{SUBTITLE}}', subtitle)
      .replace('{{TOTAL_COUNT}}', totalCount)
      .replace('{{SUBMITTED_COUNT}}', submittedCount)
      .replace('{{REVIEW_COUNT}}', reviewCount)
      .replace('{{ACCEPTED_COUNT}}', acceptedCount);
  }

  /**
   * Renders single application detail and review view.
   * @param {Object} application Application object with details
   * @param {Object} options Flash message or alertType
   * @returns {string} Fully rendered HTML string
   */
  static renderApplicationDetail(application = {}, options = {}) {
    let template = fs.readFileSync(applicationDetailTemplatePath, 'utf-8');

    const id = application.id != null ? application.id : '';
    const userId = application.userId != null ? application.userId : '';
    const userName = application.user ? application.user.name : `Alumni #${userId}`;
    const userEmail = application.user ? application.user.email : '';
    const userDept = application.user ? application.user.department : '';
    const gradYear = application.user && application.user.graduationYear ? application.user.graduationYear : '';

    const jobId = application.jobPostingId != null ? application.jobPostingId : '';
    const jobTitle = application.jobPosting ? application.jobPosting.title : `Job #${jobId}`;
    const jobCompany = application.jobPosting ? application.jobPosting.company : '';
    const jobLocation = application.jobPosting ? application.jobPosting.location : '';

    const resumeUrl = application.resumeUrl || '';
    const coverNote = application.coverNote || 'No cover note provided by candidate.';
    const status = application.status || 'Submitted';
    const appliedAt = application.appliedAt || 'Recent';

    let messageHtml = '';
    if (options.message) {
      const alertClass = options.alertType ? `alert-${options.alertType}` : 'alert-success';
      messageHtml = `<div class="${alertClass}">${options.message}</div>`;
    }

    return template
      .replace(/{{ID}}/g, id)
      .replace(/{{USER_ID}}/g, userId)
      .replace(/{{USER_NAME}}/g, userName)
      .replace(/{{USER_EMAIL}}/g, userEmail)
      .replace(/{{USER_DEPT}}/g, userDept)
      .replace(/{{GRAD_YEAR}}/g, gradYear)
      .replace(/{{JOB_ID}}/g, jobId)
      .replace(/{{JOB_TITLE}}/g, jobTitle)
      .replace(/{{JOB_COMPANY}}/g, jobCompany)
      .replace(/{{JOB_LOCATION}}/g, jobLocation)
      .replace(/{{RESUME_URL}}/g, resumeUrl)
      .replace(/{{COVER_NOTE}}/g, coverNote)
      .replace(/{{STATUS}}/g, status)
      .replace(/{{APPLIED_AT}}/g, appliedAt)
      .replace(/{{MESSAGE}}/g, messageHtml);
  }
}

module.exports = ApplicationView;
