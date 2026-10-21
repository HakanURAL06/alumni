/**
 * JobPosting Model
 * Implements complete asynchronous CRUD operations against PostgreSQL database,
 * with relationship mapping to UserModel (posted_by -> users.id) and graceful
 * in-memory fallback for offline/isolated environments.
 */

const db = require('./db');

function formatJobPosting(row) {
  if (!row) return null;
  let deadlineStr = row.applicationDeadline || row.application_deadline;
  if (deadlineStr instanceof Date) {
    deadlineStr = deadlineStr.toISOString().split('T')[0];
  } else if (typeof deadlineStr === 'string' && deadlineStr.includes('T')) {
    deadlineStr = deadlineStr.split('T')[0];
  }

  const formatted = {
    id: row.id,
    title: row.title,
    company: row.company,
    location: row.location || 'Remote',
    jobType: row.jobType || row.job_type || 'Full-time',
    description: row.description || '',
    requirements: row.requirements || '',
    salary: row.salary || null,
    contactEmail: row.contactEmail || row.contact_email,
    postedBy: row.postedBy !== undefined ? row.postedBy : (row.posted_by !== undefined ? row.posted_by : null),
    status: row.status || 'Active',
    applicationDeadline: deadlineStr || null,
    created_at: row.created_at,
    updated_at: row.updated_at
  };

  // Include populated user relationship if available
  if (row.user) {
    formatted.user = row.user;
  } else if (row.userName || row.user_name) {
    formatted.user = {
      id: row.postedBy || row.posted_by,
      name: row.userName || row.user_name,
      department: row.userDepartment || row.user_department,
      email: row.userEmail || row.user_email
    };
  }

  return formatted;
}

class JobPostingModel {
  constructor() {
    this.jobPostings = [
      {
        id: 1,
        title: 'Senior Backend Engineer',
        company: 'TechCorp Innovations',
        location: 'Istanbul / Hybrid',
        jobType: 'Full-time',
        description: 'Scaling distributed cloud services and database infrastructure.',
        requirements: '3+ years Node.js, Express, PostgreSQL, Docker.',
        salary: '₺85,000 - ₺110,000 / month',
        contactEmail: 'careers@techcorp.com',
        postedBy: 1,
        status: 'Active',
        applicationDeadline: '2026-12-31'
      },
      {
        id: 2,
        title: 'Frontend Developer (React)',
        company: 'Digital Solutions Lab',
        location: 'Remote',
        jobType: 'Full-time',
        description: 'Building modern responsive web interfaces for fintech platforms.',
        requirements: 'React, TypeScript, CSS3, RESTful APIs.',
        salary: '₺65,000 - ₺85,000 / month',
        contactEmail: 'hr@digitalsolutions.com',
        postedBy: 2,
        status: 'Active',
        applicationDeadline: '2026-11-30'
      },
      {
        id: 3,
        title: 'Machine Learning Intern',
        company: 'AI Research Group',
        location: 'Ankara',
        jobType: 'Internship',
        description: 'Assist in training and fine-tuning computer vision & NLP models.',
        requirements: 'Python, PyTorch, basic linear algebra.',
        salary: '₺25,000 / month',
        contactEmail: 'internships@airesearch.edu',
        postedBy: 1,
        status: 'Active',
        applicationDeadline: '2026-10-31'
      }
    ];
  }

  /**
   * CREATE: Adds a new job posting record to PostgreSQL database
   * @param {Object} data - Job details
   * @returns {Promise<Object>} The created job posting
   */
  async create(data = {}) {
    const title = data.title || 'Software Engineer';
    const company = data.company || 'Partner Company';
    const location = data.location || 'Remote';
    const jobType = data.jobType || data.job_type || 'Full-time';
    const description = data.description || '';
    const requirements = data.requirements || '';
    const salary = data.salary !== undefined ? data.salary : null;
    const contactEmail = data.contactEmail || data.contact_email || 'careers@company.com';
    const postedBy = data.postedBy !== undefined ? data.postedBy : (data.posted_by !== undefined ? data.posted_by : null);
    const status = data.status || 'Active';
    const applicationDeadline = data.applicationDeadline || data.application_deadline || null;

    try {
      const res = await db.query(
        `INSERT INTO job_postings (
           title, company, location, job_type, description, requirements,
           salary, contact_email, posted_by, status, application_deadline
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id, title, company, location, job_type AS "jobType",
                   description, requirements, salary, contact_email AS "contactEmail",
                   posted_by AS "postedBy", status, application_deadline AS "applicationDeadline",
                   created_at, updated_at;`,
        [title, company, location, jobType, description, requirements, salary, contactEmail, postedBy, status, applicationDeadline]
      );
      const created = formatJobPosting(res.rows[0]);
      this.jobPostings.push(created);
      return created;
    } catch (err) {
      // In-memory fallback
      const nextId = this.jobPostings.length
        ? Math.max(...this.jobPostings.map(j => j.id)) + 1
        : 1;

      const newJob = {
        id: nextId,
        title,
        company,
        location,
        jobType,
        description,
        requirements,
        salary,
        contactEmail,
        postedBy: postedBy ? Number(postedBy) : null,
        status,
        applicationDeadline
      };

      this.jobPostings.push(newJob);
      return newJob;
    }
  }

  /**
   * READ: Returns all job postings with optional filtering
   * @param {Object} [filters={}] - Optional filters (status, jobType, company, postedBy)
   * @returns {Promise<Array<Object>>} List of job postings
   */
  async findAll(filters = {}) {
    try {
      const conditions = [];
      const values = [];

      if (filters.status) {
        values.push(filters.status);
        conditions.push(`status = $${values.length}`);
      }
      if (filters.jobType) {
        values.push(filters.jobType);
        conditions.push(`job_type = $${values.length}`);
      }
      if (filters.company) {
        values.push(`%${filters.company}%`);
        conditions.push(`company ILIKE $${values.length}`);
      }
      if (filters.postedBy) {
        values.push(Number(filters.postedBy));
        conditions.push(`posted_by = $${values.length}`);
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const query = `
        SELECT id, title, company, location, job_type AS "jobType",
               description, requirements, salary, contact_email AS "contactEmail",
               posted_by AS "postedBy", status, application_deadline AS "applicationDeadline",
               created_at, updated_at
        FROM job_postings
        ${whereClause}
        ORDER BY id DESC;
      `;

      const res = await db.query(query, values);
      return res.rows.map(formatJobPosting);
    } catch (err) {
      // In-memory fallback
      let list = [...this.jobPostings];
      if (filters.status) {
        list = list.filter(j => j.status.toLowerCase() === filters.status.toLowerCase());
      }
      if (filters.jobType) {
        list = list.filter(j => j.jobType.toLowerCase() === filters.jobType.toLowerCase());
      }
      if (filters.company) {
        list = list.filter(j => j.company.toLowerCase().includes(filters.company.toLowerCase()));
      }
      if (filters.postedBy) {
        list = list.filter(j => Number(j.postedBy) === Number(filters.postedBy));
      }
      return list.sort((a, b) => b.id - a.id);
    }
  }

  /**
   * READ: Finds a single job posting by ID
   * @param {number|string} id - Job ID
   * @returns {Promise<Object|null>} The job posting or null if not found
   */
  async findById(id) {
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

    try {
      const res = await db.query(
        `SELECT id, title, company, location, job_type AS "jobType",
                description, requirements, salary, contact_email AS "contactEmail",
                posted_by AS "postedBy", status, application_deadline AS "applicationDeadline",
                created_at, updated_at
         FROM job_postings
         WHERE id = $1;`,
        [numericId]
      );
      if (res.rows.length === 0) return null;
      return formatJobPosting(res.rows[0]);
    } catch (err) {
      // In-memory fallback
      const found = this.jobPostings.find(j => j.id === numericId);
      return found ? formatJobPosting(found) : null;
    }
  }

  /**
   * RELATIONSHIP: Finds a job posting by ID including the publisher User details (Eager Load / JOIN)
   * @param {number|string} id - Job ID
   * @returns {Promise<Object|null>} The job posting with nested user object
   */
  async findByIdWithUser(id) {
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

    try {
      const res = await db.query(
        `SELECT j.id, j.title, j.company, j.location, j.job_type AS "jobType",
                j.description, j.requirements, j.salary, j.contact_email AS "contactEmail",
                j.posted_by AS "postedBy", j.status, j.application_deadline AS "applicationDeadline",
                j.created_at, j.updated_at,
                u.name AS "userName", u.department AS "userDepartment", u.email AS "userEmail"
         FROM job_postings j
         LEFT JOIN users u ON j.posted_by = u.id
         WHERE j.id = $1;`,
        [numericId]
      );
      if (res.rows.length === 0) return null;
      return formatJobPosting(res.rows[0]);
    } catch (err) {
      // In-memory fallback
      const job = this.jobPostings.find(j => j.id === numericId);
      if (!job) return null;

      let user = null;
      if (job.postedBy) {
        // Require User model dynamically to avoid circular dependency
        const User = require('./User');
        user = await User.findById(job.postedBy);
      }

      return formatJobPosting({
        ...job,
        user: user ? { id: user.id, name: user.name, department: user.department, email: user.email } : null
      });
    }
  }

  /**
   * RELATIONSHIP: Retrieves the User object who posted this job
   * @param {number|string} jobPostingId - Job ID
   * @returns {Promise<Object|null>} The alumni User object or null
   */
  async getPostedByUser(jobPostingId) {
    const job = await this.findById(jobPostingId);
    if (!job || !job.postedBy) return null;

    const User = require('./User');
    return await User.findById(job.postedBy);
  }

  /**
   * READ: Finds all job postings for a given company
   * @param {string} company - Company name
   * @returns {Promise<Array<Object>>} Matching job postings
   */
  async findByCompany(company) {
    if (!company) return [];
    return await this.findAll({ company });
  }

  /**
   * READ: Finds all job postings by employment type
   * @param {string} jobType - Employment type (Full-time, Remote, etc.)
   * @returns {Promise<Array<Object>>} Matching job postings
   */
  async findByJobType(jobType) {
    if (!jobType) return [];
    return await this.findAll({ jobType });
  }

  /**
   * RELATIONSHIP: Finds all job postings published by a specific alumnus user
   * @param {number|string} userId - User ID
   * @returns {Promise<Array<Object>>} List of jobs posted by this user
   */
  async findByPostedBy(userId) {
    const numericId = Number(userId);
    if (isNaN(numericId)) return [];
    return await this.findAll({ postedBy: numericId });
  }

  /**
   * UPDATE: Updates job posting fields in PostgreSQL database
   * @param {number|string} id - Job ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object|null>} The updated job posting or null
   */
  async update(id, updateData = {}) {
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

    try {
      const existing = await this.findById(numericId);
      if (!existing) return null;

      const title = updateData.title !== undefined ? updateData.title : existing.title;
      const company = updateData.company !== undefined ? updateData.company : existing.company;
      const location = updateData.location !== undefined ? updateData.location : existing.location;
      const jobType = updateData.jobType !== undefined ? updateData.jobType : (updateData.job_type !== undefined ? updateData.job_type : existing.jobType);
      const description = updateData.description !== undefined ? updateData.description : existing.description;
      const requirements = updateData.requirements !== undefined ? updateData.requirements : existing.requirements;
      const salary = updateData.salary !== undefined ? updateData.salary : existing.salary;
      const contactEmail = updateData.contactEmail !== undefined ? updateData.contactEmail : (updateData.contact_email !== undefined ? updateData.contact_email : existing.contactEmail);
      const postedBy = updateData.postedBy !== undefined ? updateData.postedBy : (updateData.posted_by !== undefined ? updateData.posted_by : existing.postedBy);
      const status = updateData.status !== undefined ? updateData.status : existing.status;
      const applicationDeadline = updateData.applicationDeadline !== undefined ? updateData.applicationDeadline : (updateData.application_deadline !== undefined ? updateData.application_deadline : existing.applicationDeadline);

      const res = await db.query(
        `UPDATE job_postings
         SET title = $1, company = $2, location = $3, job_type = $4,
             description = $5, requirements = $6, salary = $7, contact_email = $8,
             posted_by = $9, status = $10, application_deadline = $11, updated_at = CURRENT_TIMESTAMP
         WHERE id = $12
         RETURNING id, title, company, location, job_type AS "jobType",
                   description, requirements, salary, contact_email AS "contactEmail",
                   posted_by AS "postedBy", status, application_deadline AS "applicationDeadline",
                   created_at, updated_at;`,
        [title, company, location, jobType, description, requirements, salary, contactEmail, postedBy, status, applicationDeadline, numericId]
      );

      if (res.rows.length === 0) return null;
      const updated = formatJobPosting(res.rows[0]);

      // Mirror to in-memory cache
      const memIndex = this.jobPostings.findIndex(j => j.id === numericId);
      if (memIndex !== -1) {
        this.jobPostings[memIndex] = { ...this.jobPostings[memIndex], ...updated };
      }

      return updated;
    } catch (err) {
      // In-memory fallback
      const job = this.jobPostings.find(j => j.id === numericId);
      if (!job) return null;

      if (updateData.title !== undefined) job.title = updateData.title;
      if (updateData.company !== undefined) job.company = updateData.company;
      if (updateData.location !== undefined) job.location = updateData.location;
      if (updateData.jobType !== undefined) job.jobType = updateData.jobType;
      if (updateData.description !== undefined) job.description = updateData.description;
      if (updateData.requirements !== undefined) job.requirements = updateData.requirements;
      if (updateData.salary !== undefined) job.salary = updateData.salary;
      if (updateData.contactEmail !== undefined) job.contactEmail = updateData.contactEmail;
      if (updateData.postedBy !== undefined) job.postedBy = updateData.postedBy ? Number(updateData.postedBy) : null;
      if (updateData.status !== undefined) job.status = updateData.status;
      if (updateData.applicationDeadline !== undefined) job.applicationDeadline = updateData.applicationDeadline;

      return formatJobPosting(job);
    }
  }

  /**
   * DELETE: Removes a job posting by ID
   * @param {number|string} id - Job ID
   * @returns {Promise<Object|null>} The deleted job posting or null
   */
  async delete(id) {
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

    try {
      const res = await db.query(
        `DELETE FROM job_postings
         WHERE id = $1
         RETURNING id, title, company, location, job_type AS "jobType",
                   description, requirements, salary, contact_email AS "contactEmail",
                   posted_by AS "postedBy", status, application_deadline AS "applicationDeadline";`,
        [numericId]
      );

      if (res.rows.length === 0) return null;
      const deleted = formatJobPosting(res.rows[0]);

      // Mirror to in-memory cache
      const index = this.jobPostings.findIndex(j => j.id === numericId);
      if (index !== -1) {
        this.jobPostings.splice(index, 1);
      }

      return deleted;
    } catch (err) {
      // In-memory fallback
      const index = this.jobPostings.findIndex(j => j.id === numericId);
      if (index === -1) return null;

      const [deleted] = this.jobPostings.splice(index, 1);
      return formatJobPosting(deleted);
    }
  }

  /**
   * RELATIONSHIP: Retrieves all candidate applications for this job posting (JobPosting -> Applications)
   * @param {number|string} jobPostingId - Job ID
   * @returns {Promise<Array<Object>>} List of candidate applications
   */
  async getApplications(jobPostingId) {
    const numericId = Number(jobPostingId);
    if (isNaN(numericId)) return [];

    try {
      const res = await db.query(
        `SELECT a.id, a.user_id AS "userId", a.job_posting_id AS "jobPostingId",
                a.resume_url AS "resumeUrl", a.cover_note AS "coverNote",
                a.status, a.applied_at AS "appliedAt", a.created_at, a.updated_at,
                u.name AS "userName", u.department AS "userDepartment", u.email AS "userEmail"
         FROM applications a
         LEFT JOIN users u ON a.user_id = u.id
         WHERE a.job_posting_id = $1
         ORDER BY a.id DESC;`,
        [numericId]
      );
      return res.rows;
    } catch (err) {
      // In-memory fallback
      const Application = require('./Application');
      return await Application.findByJob(numericId);
    }
  }

  /**
   * RELATIONSHIP: Finds a job posting along with all candidate applications
   * @param {number|string} id - Job ID
   * @returns {Promise<Object|null>}
   */
  async findByIdWithApplications(id) {
    const job = await this.findById(id);
    if (!job) return null;

    const applications = await this.getApplications(id);
    return {
      ...job,
      applications
    };
  }
}

// Export singleton instance of JobPosting model
const JobPosting = new JobPostingModel();
module.exports = JobPosting;
