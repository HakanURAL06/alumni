/**
 * Application Factory
 * Generates realistic dummy/seed data for Application records connecting Users and JobPostings.
 * Supports single and bulk generation for unit tests, seeding, and database reset.
 */

class ApplicationFactory {
  static sampleNotes = [
    'I have 4+ years of backend development experience with high-traffic Node.js systems.',
    'Very excited about this opportunity. My portfolio includes multiple open-source contributions.',
    'I believe my background in distributed systems and Docker containerization makes me an ideal fit.',
    'I graduated with honors and conducted research directly related to this position.',
    'Looking forward to bringing my engineering and product skills to your innovative team.'
  ];

  static statuses = ['Submitted', 'Under Review', 'Interviewing', 'Accepted', 'Rejected'];

  static counter = 1;

  /**
   * Generates a single mock application object
   * @param {Object} overrides - Specific fields to override
   * @returns {Object} Application data object
   */
  static create(overrides = {}) {
    const id = overrides.id !== undefined ? overrides.id : this.counter++;
    const noteIndex = (id - 1) % this.sampleNotes.length;
    const statusIndex = (id - 1) % this.statuses.length;

    const userId = overrides.userId !== undefined ? overrides.userId : ((id % 3) + 1);
    const jobPostingId = overrides.jobPostingId !== undefined ? overrides.jobPostingId : (id > 3 ? 2 : id);

    return {
      id,
      userId,
      jobPostingId,
      resumeUrl: overrides.resumeUrl || `https://storage.example.com/resumes/alumni-user-${userId}-cv.pdf`,
      coverNote: overrides.coverNote || this.sampleNotes[noteIndex],
      status: overrides.status || this.statuses[statusIndex],
      appliedAt: overrides.appliedAt || new Date().toISOString(),
      ...overrides
    };
  }

  /**
   * Generates multiple mock application objects
   * @param {number} count - Number of applications to generate
   * @param {Object} overrides - Shared overrides
   * @returns {Array<Object>} List of generated applications
   */
  static createMany(count = 3, overrides = {}) {
    const list = [];
    for (let i = 0; i < count; i++) {
      list.push(this.create(overrides));
    }
    return list;
  }

  /**
   * Resets internal auto-increment counter
   * @param {number} start - Starting counter value
   */
  static resetCounter(start = 1) {
    this.counter = start;
  }

  /**
   * Persists a factory-generated application directly into PostgreSQL database
   * @param {Object} client - Connected pg Client/Pool
   * @param {Object} overrides - Specific fields to override
   * @returns {Promise<Object>} Inserted database row
   */
  static async createInDb(client, overrides = {}) {
    const data = this.create(overrides);
    const query = `
      INSERT INTO applications (user_id, job_posting_id, resume_url, cover_note, status)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, job_posting_id) DO UPDATE SET
        resume_url = EXCLUDED.resume_url,
        cover_note = EXCLUDED.cover_note,
        status = EXCLUDED.status
      RETURNING id, user_id AS "userId", job_posting_id AS "jobPostingId",
                resume_url AS "resumeUrl", cover_note AS "coverNote", status,
                applied_at AS "appliedAt", created_at, updated_at;
    `;
    const values = [
      data.userId,
      data.jobPostingId,
      data.resumeUrl,
      data.coverNote,
      data.status
    ];
    const res = await client.query(query, values);
    return res.rows[0];
  }
}

module.exports = ApplicationFactory;
