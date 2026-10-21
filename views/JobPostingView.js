const fs = require('fs');
const path = require('path');

const jobsTemplatePath = path.join(__dirname, 'jobs.html');
const jobDetailTemplatePath = path.join(__dirname, 'jobDetail.html');
const jobEditTemplatePath = path.join(__dirname, 'jobEdit.html');

/**
 * JobPostingView
 * Handles rendering HTML views for JobPosting resources (MVC View Layer).
 */
class JobPostingView {
  /**
   * Renders the Career Board & Job Postings management table and creation form.
   * @param {Array} jobs List of job postings
   * @param {Object} options Flash message or alertType
   * @returns {string} Fully rendered HTML string
   */
  static renderJobs(jobs = [], options = {}) {
    let template = fs.readFileSync(jobsTemplatePath, 'utf-8');

    const rows = (jobs || []).map(j => `
      <tr>
        <td>${j.id}</td>
        <td>
          <strong>${j.title}</strong>
          <div style="font-size:0.8rem; color:#64748b;">${j.company}</div>
        </td>
        <td><span class="location-badge">📍 ${j.location || 'Remote'}</span></td>
        <td><span class="type-badge type-${(j.jobType || '').replace(/[^a-zA-Z]/g, '')}">${j.jobType || 'Full-time'}</span></td>
        <td>${j.salary || 'Competitive'}</td>
        <td><span class="status-badge status-${j.status || 'Active'}">${j.status || 'Active'}</span></td>
        <td>
          <div class="actions-cell">
            <a href="/jobs/${j.id}" class="btn-sm btn-view">👁️ View</a>
            <a href="/jobs/${j.id}/edit" class="btn-sm btn-edit">✏️ Edit</a>
            <a href="/jobs/${j.id}/applications" class="btn-sm btn-apps">👥 Candidates</a>
            <form action="/jobs/${j.id}/delete" method="POST" style="display:inline; margin:0;" onsubmit="return confirm('Delete this job posting?');">
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
      .replace('{{JOB_ROWS}}', rows)
      .replace('{{MESSAGE}}', messageHtml);
  }

  /**
   * Renders single job posting detail view with inline application form.
   * @param {Object} job Job posting object
   * @param {Object} options Optional flash messages
   * @returns {string} Fully rendered HTML string
   */
  static renderJobDetail(job = {}, options = {}) {
    let template = fs.readFileSync(jobDetailTemplatePath, 'utf-8');
    const id = job.id != null ? job.id : '';
    const title = job.title || 'Career Opportunity';
    const company = job.company || '';
    const location = job.location || 'Remote';
    const jobType = job.jobType || 'Full-time';
    const salary = job.salary || 'Competitive';
    const contactEmail = job.contactEmail || '';
    const description = job.description || 'No description provided.';
    const requirements = job.requirements || 'No specific requirements listed.';
    const deadline = job.applicationDeadline || 'Open until filled';
    const status = job.status || 'Active';
    const postedBy = job.postedBy != null ? job.postedBy : 'Alumni';
    const posterName = job.user ? job.user.name : (job.postedByUser ? job.postedByUser.name : `Alumni #${postedBy}`);

    let messageHtml = '';
    if (options.message) {
      const alertClass = options.alertType ? `alert-${options.alertType}` : 'alert-success';
      messageHtml = `<div class="${alertClass}">${options.message}</div>`;
    }

    return template
      .replace(/{{ID}}/g, id)
      .replace(/{{TITLE}}/g, title)
      .replace(/{{COMPANY}}/g, company)
      .replace(/{{LOCATION}}/g, location)
      .replace(/{{JOB_TYPE}}/g, jobType)
      .replace(/{{SALARY}}/g, salary)
      .replace(/{{CONTACT_EMAIL}}/g, contactEmail)
      .replace(/{{DESCRIPTION}}/g, description)
      .replace(/{{REQUIREMENTS}}/g, requirements)
      .replace(/{{DEADLINE}}/g, deadline)
      .replace(/{{STATUS}}/g, status)
      .replace(/{{POSTED_BY}}/g, postedBy)
      .replace(/{{POSTER_NAME}}/g, posterName)
      .replace(/{{MESSAGE}}/g, messageHtml);
  }

  /**
   * Renders edit job posting form view.
   * @param {Object} job Job posting object
   * @returns {string} Fully rendered HTML string
   */
  static renderJobEdit(job = {}) {
    let template = fs.readFileSync(jobEditTemplatePath, 'utf-8');
    const id = job.id != null ? job.id : '';
    const title = job.title || '';
    const company = job.company || '';
    const location = job.location || '';
    const jobType = job.jobType || 'Full-time';
    const salary = job.salary || '';
    const contactEmail = job.contactEmail || '';
    const description = job.description || '';
    const requirements = job.requirements || '';
    const deadline = job.applicationDeadline || '';
    const status = job.status || 'Active';
    const postedBy = job.postedBy != null ? job.postedBy : '1';

    return template
      .replace(/{{ID}}/g, id)
      .replace(/{{TITLE}}/g, title)
      .replace(/{{COMPANY}}/g, company)
      .replace(/{{LOCATION}}/g, location)
      .replace(/{{JOB_TYPE}}/g, jobType)
      .replace(/{{SALARY}}/g, salary)
      .replace(/{{CONTACT_EMAIL}}/g, contactEmail)
      .replace(/{{DESCRIPTION}}/g, description)
      .replace(/{{REQUIREMENTS}}/g, requirements)
      .replace(/{{DEADLINE}}/g, deadline)
      .replace(/{{STATUS}}/g, status)
      .replace(/{{POSTED_BY}}/g, postedBy);
  }
}

module.exports = JobPostingView;
