/**
 * Announcement Factory
 * Generates realistic dummy/seed data for Announcement records.
 * Supports single and bulk generation for unit tests, seeding, and database reset.
 */

class AnnouncementFactory {
  static categories = ['Event', 'Career', 'Academic', 'General'];

  static sampleAnnouncements = [
    {
      title: 'Annual Alumni Homecoming 2026',
      content: 'Join us on campus for keynote speeches, networking cocktails, and department visits.',
      category: 'Event',
      author: 'Alumni Office'
    },
    {
      title: 'Tech Career Fair & Mentorship Days',
      content: 'Leading companies in technology and engineering are hiring alumni and recent graduates.',
      category: 'Career',
      author: 'Career Center'
    },
    {
      title: 'New Graduate Scholarship Program',
      content: 'Applications for postgraduate research scholarships are now open for alumni members.',
      category: 'Academic',
      author: 'Dean of Engineering'
    },
    {
      title: 'Alumni Start-up Pitch Competition',
      content: 'Showcase your startup to angel investors and venture capital funds with alumni partners.',
      category: 'Career',
      author: 'Entrepreneurship Center'
    },
    {
      title: 'Campus Library Access & Digital Pass',
      content: 'Alumni digital identity cards now provide lifetime access to university academic databases.',
      category: 'General',
      author: 'Library Directorate'
    }
  ];

  static counter = 1;

  /**
   * Generates a single mock announcement object
   * @param {Object} overrides - Specific fields to override
   * @returns {Object} Announcement data object
   */
  static create(overrides = {}) {
    const id = overrides.id !== undefined ? overrides.id : this.counter++;
    const sampleIndex = (id - 1) % this.sampleAnnouncements.length;
    const sample = this.sampleAnnouncements[sampleIndex];

    const today = new Date();
    today.setDate(today.getDate() + (id * 3));
    const dateStr = today.toISOString().split('T')[0];

    return {
      id,
      title: overrides.title || (id <= this.sampleAnnouncements.length ? sample.title : `Announcement #${id}`),
      content: overrides.content || sample.content,
      category: overrides.category || sample.category,
      author: overrides.author || sample.author,
      date: overrides.date || dateStr,
      ...overrides
    };
  }

  /**
   * Generates multiple mock announcement objects
   * @param {number} count - Number of announcements to generate
   * @param {Object} overrides - Shared overrides
   * @returns {Array<Object>} List of generated announcements
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
   * Persists a factory-generated announcement directly into PostgreSQL database
   * @param {Object} client - Connected pg Client/Pool
   * @param {Object} overrides - Specific fields to override
   * @returns {Promise<Object>} Inserted database row
   */
  static async createInDb(client, overrides = {}) {
    const data = this.create(overrides);
    const query = `
      INSERT INTO announcements (title, content, category, author, publication_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, title, content, category, author, publication_date, created_at, updated_at;
    `;
    const values = [data.title, data.content, data.category, data.author, data.date];
    const res = await client.query(query, values);
    return res.rows[0];
  }
}

module.exports = AnnouncementFactory;
