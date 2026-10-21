/**
 * Application Model
 * Implements complete asynchronous CRUD operations against PostgreSQL database,
 * managing the Action / Junction relationship between Users and JobPostings,
 * with composite uniqueness (user_id, job_posting_id) and graceful in-memory fallback.
 */

const db = require('./db');

function formatApplication(row) {
  if (!row) return null;

  let appliedAtStr = row.appliedAt || row.applied_at;
  if (appliedAtStr instanceof Date) {
    appliedAtStr = appliedAtStr.toISOString();
  }

  const formatted = {
    id: row.id,
    userId: Number(row.userId !== undefined ? row.userId : row.user_id),
    jobPostingId: Number(row.jobPostingId !== undefined ? row.jobPostingId : row.job_posting_id),
    resumeUrl: row.resumeUrl !== undefined ? row.resumeUrl : (row.resume_url !== undefined ? row.resume_url : null),
    coverNote: row.coverNote !== undefined ? row.coverNote : (row.cover_note || ''),
    status: row.status || 'Pending',
    appliedAt: appliedAtStr || new Date().toISOString(),
    created_at: row.created_at,
    updated_at: row.updated_at
  };

  // Attach populated details if present
  if (row.user) {
    formatted.user = row.user;
  } else if (row.userName || row.user_name) {
    formatted.user = {
      id: formatted.userId,
      name: row.userName || row.user_name,
      department: row.userDepartment || row.user_department,
      email: row.userEmail || row.user_email
    };
  }

  if (row.jobPosting) {
    formatted.jobPosting = row.jobPosting;
  } else if (row.jobTitle || row.job_title) {
    formatted.jobPosting = {
      id: formatted.jobPostingId,
      title: row.jobTitle || row.job_title,
      company: row.jobCompany || row.job_company,
      location: row.jobLocation || row.job_location
    };
  }

  return formatted;
}

class ApplicationModel {
  constructor() {
    this.applications = [
      {
        id: 1,
        userId: 2,
        jobPostingId: 1,
        resumeUrl: 'https://storage.alumni.edu/resumes/ayse_cv.pdf',
        coverNote: 'Interested in backend cloud systems.',
        status: 'Pending',
        appliedAt: '2026-10-21T08:00:00.000Z'
      },
      {
        id: 2,
        userId: 3,
        jobPostingId: 1,
        resumeUrl: 'https://storage.alumni.edu/resumes/mehmet_cv.pdf',
        coverNote: 'Experience in distributed systems.',
        status: 'Reviewed',
        appliedAt: '2026-10-21T08:30:00.000Z'
      },
      {
        id: 3,
        userId: 1,
        jobPostingId: 2,
        resumeUrl: 'https://storage.alumni.edu/resumes/hakan_cv.pdf',
        coverNote: 'Excited about frontend React roles.',
        status: 'Accepted',
        appliedAt: '2026-10-21T09:00:00.000Z'
      }
    ];
  }

  /**
   * CREATE: Submits an application to a job posting
   * @param {Object} data - Application details (userId, jobPostingId, resumeUrl, coverNote, status)
   * @returns {Promise<Object>} The created or updated application record
   */
  async create(data = {}) {
    const userId = Number(data.userId || data.user_id);
    const jobPostingId = Number(data.jobPostingId || data.job_posting_id);
    const resumeUrl = data.resumeUrl !== undefined ? data.resumeUrl : (data.resume_url || null);
    const coverNote = data.coverNote !== undefined ? data.coverNote : (data.cover_note || '');
    const status = data.status || 'Pending';

    try {
      const res = await db.query(
        `INSERT INTO applications (user_id, job_posting_id, resume_url, cover_note, status)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id, job_posting_id) DO UPDATE SET
           resume_url = EXCLUDED.resume_url,
           cover_note = EXCLUDED.cover_note,
           status = EXCLUDED.status,
           updated_at = CURRENT_TIMESTAMP
         RETURNING id, user_id AS "userId", job_posting_id AS "jobPostingId",
                   resume_url AS "resumeUrl", cover_note AS "coverNote",
                   status, applied_at AS "appliedAt", created_at, updated_at;`,
        [userId, jobPostingId, resumeUrl, coverNote, status]
      );
      const created = formatApplication(res.rows[0]);
      this.applications.push(created);
      return created;
    } catch (err) {
      // In-memory fallback
      const existingIndex = this.applications.findIndex(
        a => Number(a.userId) === userId && Number(a.jobPostingId) === jobPostingId
      );

      if (existingIndex !== -1) {
        this.applications[existingIndex] = {
          ...this.applications[existingIndex],
          resumeUrl,
          coverNote,
          status,
          updated_at: new Date().toISOString()
        };
        return formatApplication(this.applications[existingIndex]);
      }

      const nextId = this.applications.length
        ? Math.max(...this.applications.map(a => a.id)) + 1
        : 1;

      const newApp = {
        id: nextId,
        userId,
        jobPostingId,
        resumeUrl,
        coverNote,
        status,
        appliedAt: new Date().toISOString()
      };

      this.applications.push(newApp);
      return formatApplication(newApp);
    }
  }

  /**
   * READ ALL: Returns applications matching optional filters
   * @param {Object} [filters={}] - Optional filters (userId, jobPostingId, status)
   * @returns {Promise<Array<Object>>}
   */
  async findAll(filters = {}) {
    try {
      const conditions = [];
      const values = [];

      if (filters.userId || filters.user_id) {
        values.push(Number(filters.userId || filters.user_id));
        conditions.push(`user_id = $${values.length}`);
      }
      if (filters.jobPostingId || filters.job_posting_id) {
        values.push(Number(filters.jobPostingId || filters.job_posting_id));
        conditions.push(`job_posting_id = $${values.length}`);
      }
      if (filters.status) {
        values.push(filters.status);
        conditions.push(`status = $${values.length}`);
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const query = `
        SELECT id, user_id AS "userId", job_posting_id AS "jobPostingId",
               resume_url AS "resumeUrl", cover_note AS "coverNote",
               status, applied_at AS "appliedAt", created_at, updated_at
        FROM applications
        ${whereClause}
        ORDER BY id DESC;
      `;

      const res = await db.query(query, values);
      return res.rows.map(formatApplication);
    } catch (err) {
      // In-memory fallback
      let list = [...this.applications];
      if (filters.userId || filters.user_id) {
        const uid = Number(filters.userId || filters.user_id);
        list = list.filter(a => Number(a.userId) === uid);
      }
      if (filters.jobPostingId || filters.job_posting_id) {
        const jid = Number(filters.jobPostingId || filters.job_posting_id);
        list = list.filter(a => Number(a.jobPostingId) === jid);
      }
      if (filters.status) {
        list = list.filter(a => a.status.toLowerCase() === filters.status.toLowerCase());
      }
      return list.map(formatApplication).sort((a, b) => b.id - a.id);
    }
  }

  /**
   * READ ONE: Finds application by ID
   * @param {number|string} id - Application ID
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

    try {
      const res = await db.query(
        `SELECT id, user_id AS "userId", job_posting_id AS "jobPostingId",
                resume_url AS "resumeUrl", cover_note AS "coverNote",
                status, applied_at AS "appliedAt", created_at, updated_at
         FROM applications
         WHERE id = $1;`,
        [numericId]
      );
      if (res.rows.length === 0) return null;
      return formatApplication(res.rows[0]);
    } catch (err) {
      // In-memory fallback
      const found = this.applications.find(a => a.id === numericId);
      return found ? formatApplication(found) : null;
    }
  }

  /**
   * RELATIONSHIP (Eager Load): Finds application with candidate user and job posting details
   * @param {number|string} id - Application ID
   * @returns {Promise<Object|null>}
   */
  async findByIdWithDetails(id) {
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

    try {
      const res = await db.query(
        `SELECT a.id, a.user_id AS "userId", a.job_posting_id AS "jobPostingId",
                a.resume_url AS "resumeUrl", a.cover_note AS "coverNote",
                a.status, a.applied_at AS "appliedAt", a.created_at, a.updated_at,
                u.name AS "userName", u.department AS "userDepartment", u.email AS "userEmail",
                j.title AS "jobTitle", j.company AS "jobCompany", j.location AS "jobLocation"
         FROM applications a
         LEFT JOIN users u ON a.user_id = u.id
         LEFT JOIN job_postings j ON a.job_posting_id = j.id
         WHERE a.id = $1;`,
        [numericId]
      );
      if (res.rows.length === 0) return null;
      return formatApplication(res.rows[0]);
    } catch (err) {
      // In-memory fallback
      const app = this.applications.find(a => a.id === numericId);
      if (!app) return null;

      const User = require('./User');
      const JobPosting = require('./JobPosting');

      const user = await User.findById(app.userId);
      const job = await JobPosting.findById(app.jobPostingId);

      return formatApplication({
        ...app,
        user: user ? { id: user.id, name: user.name, department: user.department, email: user.email } : null,
        jobPosting: job ? { id: job.id, title: job.title, company: job.company, location: job.location } : null
      });
    }
  }

  /**
   * RELATIONSHIP: Finds all applications submitted by an alumnus user
   * @param {number|string} userId - User ID
   * @returns {Promise<Array<Object>>}
   */
  async findByUser(userId) {
    return await this.findAll({ userId });
  }

  /**
   * RELATIONSHIP: Finds all applications received for a specific job posting
   * @param {number|string} jobPostingId - Job ID
   * @returns {Promise<Array<Object>>}
   */
  async findByJob(jobPostingId) {
    return await this.findAll({ jobPostingId });
  }

  /**
   * UPDATE: Updates application status or details
   * @param {number|string} id - Application ID
   * @param {Object} updateData - Status or notes to update
   * @returns {Promise<Object|null>}
   */
  async update(id, updateData = {}) {
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

    try {
      const existing = await this.findById(numericId);
      if (!existing) return null;

      const status = updateData.status !== undefined ? updateData.status : existing.status;
      const resumeUrl = updateData.resumeUrl !== undefined ? updateData.resumeUrl : (updateData.resume_url !== undefined ? updateData.resume_url : existing.resumeUrl);
      const coverNote = updateData.coverNote !== undefined ? updateData.coverNote : (updateData.cover_note !== undefined ? updateData.cover_note : existing.coverNote);

      const res = await db.query(
        `UPDATE applications
         SET status = $1, resume_url = $2, cover_note = $3, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING id, user_id AS "userId", job_posting_id AS "jobPostingId",
                   resume_url AS "resumeUrl", cover_note AS "coverNote",
                   status, applied_at AS "appliedAt", created_at, updated_at;`,
        [status, resumeUrl, coverNote, numericId]
      );

      if (res.rows.length === 0) return null;
      const updated = formatApplication(res.rows[0]);

      // Mirror in-memory
      const idx = this.applications.findIndex(a => a.id === numericId);
      if (idx !== -1) {
        this.applications[idx] = { ...this.applications[idx], ...updated };
      }

      return updated;
    } catch (err) {
      // In-memory fallback
      const app = this.applications.find(a => a.id === numericId);
      if (!app) return null;

      if (updateData.status !== undefined) app.status = updateData.status;
      if (updateData.resumeUrl !== undefined) app.resumeUrl = updateData.resumeUrl;
      if (updateData.resume_url !== undefined) app.resumeUrl = updateData.resume_url;
      if (updateData.coverNote !== undefined) app.coverNote = updateData.coverNote;
      if (updateData.cover_note !== undefined) app.coverNote = updateData.cover_note;

      return formatApplication(app);
    }
  }

  /**
   * DELETE: Removes or withdraws an application
   * @param {number|string} id - Application ID
   * @returns {Promise<Object|null>}
   */
  async delete(id) {
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

    try {
      const res = await db.query(
        `DELETE FROM applications
         WHERE id = $1
         RETURNING id, user_id AS "userId", job_posting_id AS "jobPostingId",
                   resume_url AS "resumeUrl", cover_note AS "coverNote", status;`,
        [numericId]
      );

      if (res.rows.length === 0) return null;
      const deleted = formatApplication(res.rows[0]);

      // Mirror in-memory
      const idx = this.applications.findIndex(a => a.id === numericId);
      if (idx !== -1) {
        this.applications.splice(idx, 1);
      }

      return deleted;
    } catch (err) {
      // In-memory fallback
      const idx = this.applications.findIndex(a => a.id === numericId);
      if (idx === -1) return null;

      const [deleted] = this.applications.splice(idx, 1);
      return formatApplication(deleted);
    }
  }
}

// Export singleton instance of Application model
const Application = new ApplicationModel();
module.exports = Application;
