/**
 * JobPosting Factory
 * Generates realistic dummy/seed data for JobPosting records.
 * Supports single and bulk generation for unit tests, seeding, and database reset.
 */

class JobPostingFactory {
  static sampleJobs = [
    {
      title: 'Senior Backend Engineer',
      company: 'TechCorp Innovations',
      location: 'Istanbul / Hybrid',
      jobType: 'Full-time',
      description: 'Designing and scaling distributed cloud microservices with Node.js and PostgreSQL.',
      requirements: '5+ years Node.js, PostgreSQL, Docker, AWS experience.',
      salary: '₺85,000 / month',
      contactEmail: 'careers@techcorp.com',
      status: 'Active',
      applicationDeadline: '2026-12-31'
    },
    {
      title: 'Frontend React Developer',
      company: 'Digital Solutions Ltd',
      location: 'Remote',
      jobType: 'Full-time',
      description: 'Building modern responsive web applications with React, Next.js, and TypeScript.',
      requirements: '3+ years React, CSS-in-JS, REST API integration.',
      salary: '₺75,000 / month',
      contactEmail: 'hr@digitalsolutions.com',
      status: 'Active',
      applicationDeadline: '2026-11-30'
    },
    {
      title: 'Data Scientist & AI Researcher',
      company: 'DeepData Labs',
      location: 'Ankara / On-site',
      jobType: 'Full-time',
      description: 'Developing machine learning and NLP pipelines for large-scale enterprise analytics.',
      requirements: 'Python, PyTorch, SQL, statistical modeling expertise.',
      salary: '₺95,000 / month',
      contactEmail: 'jobs@deepdata.io',
      status: 'Active',
      applicationDeadline: '2026-12-15'
    },
    {
      title: 'Mobile App Developer (Flutter/iOS)',
      company: 'AppStudio Inc',
      location: 'Remote',
      jobType: 'Contract',
      description: 'Developing cross-platform mobile apps for international FinTech clients.',
      requirements: 'Flutter, Dart, RESTful APIs, App Store deployment.',
      salary: '₺65,000 / month',
      contactEmail: 'talent@appstudio.dev',
      status: 'Active',
      applicationDeadline: '2026-11-20'
    },
    {
      title: 'Cybersecurity Analyst',
      company: 'SecureNet Systems',
      location: 'Izmir / Hybrid',
      jobType: 'Full-time',
      description: 'Performing vulnerability assessments, penetration testing, and security auditing.',
      requirements: 'Network security, SIEM tools, ethical hacking certification.',
      salary: '₺80,000 / month',
      contactEmail: 'recruitment@securenet.com',
      status: 'Active',
      applicationDeadline: '2026-12-25'
    },
    {
      title: 'Product Management Intern',
      company: 'InnoTech Ventures',
      location: 'Istanbul / Hybrid',
      jobType: 'Internship',
      description: 'Supporting product roadmaps, user stories, and agile sprint planning.',
      requirements: 'Current student or recent graduate in Engineering/Management.',
      salary: '₺30,000 / month',
      contactEmail: 'internships@innotech.com',
      status: 'Active',
      applicationDeadline: '2026-11-15'
    }
  ];

  static counter = 1;

  /**
   * Generates a single mock job posting object
   * @param {Object} overrides - Specific fields to override
   * @returns {Object} Job posting data object
   */
  static create(overrides = {}) {
    const id = overrides.id !== undefined ? overrides.id : this.counter++;
    const sampleIndex = (id - 1) % this.sampleJobs.length;
    const sample = this.sampleJobs[sampleIndex];

    const today = new Date();
    today.setDate(today.getDate() + 30 + (id * 5));
    const deadlineStr = today.toISOString().split('T')[0];

    return {
      id,
      title: overrides.title || (id <= this.sampleJobs.length ? sample.title : `Software Engineer #${id}`),
      company: overrides.company || sample.company,
      location: overrides.location || sample.location,
      jobType: overrides.jobType || sample.jobType,
      description: overrides.description || sample.description,
      requirements: overrides.requirements || sample.requirements,
      salary: overrides.salary || sample.salary,
      contactEmail: overrides.contactEmail || sample.contactEmail,
      postedBy: overrides.postedBy !== undefined ? overrides.postedBy : ((id % 3) + 1),
      status: overrides.status || sample.status,
      applicationDeadline: overrides.applicationDeadline || deadlineStr,
      ...overrides
    };
  }

  /**
   * Generates multiple mock job posting objects
   * @param {number} count - Number of job postings to generate
   * @param {Object} overrides - Shared overrides
   * @returns {Array<Object>} List of generated job postings
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
   * Persists a factory-generated job posting directly into PostgreSQL database
   * @param {Object} client - Connected pg Client/Pool
   * @param {Object} overrides - Specific fields to override
   * @returns {Promise<Object>} Inserted database row
   */
  static async createInDb(client, overrides = {}) {
    const data = this.create(overrides);
    const query = `
      INSERT INTO job_postings (
        title, company, location, job_type, description, requirements,
        salary, contact_email, posted_by, status, application_deadline
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, title, company, location, job_type AS "jobType",
                description, requirements, salary, contact_email AS "contactEmail",
                posted_by AS "postedBy", status, application_deadline AS "applicationDeadline",
                created_at, updated_at;
    `;
    const values = [
      data.title,
      data.company,
      data.location,
      data.jobType,
      data.description,
      data.requirements,
      data.salary,
      data.contactEmail,
      data.postedBy,
      data.status,
      data.applicationDeadline
    ];
    const res = await client.query(query, values);
    return res.rows[0];
  }
}

module.exports = JobPostingFactory;
