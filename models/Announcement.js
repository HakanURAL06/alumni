/**
 * Announcement Model
 * Implements complete asynchronous CRUD operations against PostgreSQL database,
 * with graceful in-memory fallback for offline/isolated environments.
 */

const db = require('./db');

function formatAnnouncement(row) {
  if (!row) return null;
  let dateStr = row.date;
  if (dateStr instanceof Date) {
    dateStr = dateStr.toISOString().split('T')[0];
  } else if (typeof dateStr === 'string' && dateStr.includes('T')) {
    dateStr = dateStr.split('T')[0];
  }
  return {
    ...row,
    date: dateStr || new Date().toISOString().split('T')[0]
  };
}

class AnnouncementModel {
  constructor() {
    this.announcements = [
      {
        id: 1,
        title: 'Annual Alumni Homecoming 2026',
        content: 'Join us on campus for keynote speeches, networking cocktails, and department visits.',
        category: 'Event',
        author: 'Alumni Office',
        date: '2026-10-15'
      },
      {
        id: 2,
        title: 'Tech Career Fair & Mentorship Days',
        content: 'Leading companies in technology and engineering are hiring alumni and recent graduates.',
        category: 'Career',
        author: 'Career Center',
        date: '2026-11-01'
      },
      {
        id: 3,
        title: 'New Graduate Scholarship Program',
        content: 'Applications for postgraduate research scholarships are now open for alumni members.',
        category: 'Academic',
        author: 'Dean of Engineering',
        date: '2026-11-20'
      }
    ];
  }

  /**
   * CREATE: Adds a new announcement to PostgreSQL database
   * @param {Object} data - Announcement details (title, content, category, author, date)
   * @returns {Promise<Object>} The created announcement with auto-generated ID
   */
  async create(data = {}) {
    const title = data.title || 'New Announcement';
    const content = data.content || '';
    const category = data.category || 'General';
    const author = data.author || 'Alumni Office';
    const date = data.date || new Date().toISOString().split('T')[0];

    try {
      const res = await db.query(
        `INSERT INTO announcements (title, content, category, author, publication_date)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, title, content, category, author, publication_date AS date, created_at, updated_at;`,
        [title, content, category, author, date]
      );
      const created = formatAnnouncement(res.rows[0]);
      this.announcements.push(created);
      return created;
    } catch (err) {
      // In-memory fallback
      const nextId = this.announcements.length
        ? Math.max(...this.announcements.map(a => a.id)) + 1
        : 1;

      const newAnnouncement = {
        id: nextId,
        title,
        content,
        category,
        author,
        date
      };

      this.announcements.push(newAnnouncement);
      return newAnnouncement;
    }
  }

  /**
   * READ: Returns all announcements from PostgreSQL database
   * @returns {Promise<Array<Object>>} List of all announcements
   */
  async findAll() {
    try {
      const res = await db.query(
        `SELECT id, title, content, category, author, publication_date AS date, created_at, updated_at
         FROM announcements
         ORDER BY id ASC;`
      );
      return res.rows.map(formatAnnouncement);
    } catch (err) {
      // In-memory fallback
      return [...this.announcements];
    }
  }

  /**
   * READ: Finds a single announcement by ID in PostgreSQL database
   * @param {number|string} id - Announcement ID
   * @returns {Promise<Object|null>} Announcement object or null if not found
   */
  async findById(id) {
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

    try {
      const res = await db.query(
        `SELECT id, title, content, category, author, publication_date AS date, created_at, updated_at
         FROM announcements
         WHERE id = $1;`,
        [numericId]
      );
      if (res.rows.length === 0) return null;
      return formatAnnouncement(res.rows[0]);
    } catch (err) {
      // In-memory fallback
      return this.announcements.find(a => a.id === numericId) || null;
    }
  }

  /**
   * UPDATE: Updates announcement fields in PostgreSQL database
   * @param {number|string} id - Announcement ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object|null>} The updated announcement or null if not found
   */
  async update(id, updateData = {}) {
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

    try {
      const existing = await this.findById(numericId);
      if (!existing) return null;

      const title = updateData.title !== undefined ? updateData.title : existing.title;
      const content = updateData.content !== undefined ? updateData.content : existing.content;
      const category = updateData.category !== undefined ? updateData.category : existing.category;
      const author = updateData.author !== undefined ? updateData.author : existing.author;
      const date = updateData.date !== undefined ? updateData.date : existing.date;

      const res = await db.query(
        `UPDATE announcements
         SET title = $1, content = $2, category = $3, author = $4, publication_date = $5, updated_at = CURRENT_TIMESTAMP
         WHERE id = $6
         RETURNING id, title, content, category, author, publication_date AS date, created_at, updated_at;`,
        [title, content, category, author, date, numericId]
      );

      if (res.rows.length === 0) return null;
      const updated = formatAnnouncement(res.rows[0]);

      // Mirror to in-memory cache
      const memIndex = this.announcements.findIndex(a => a.id === numericId);
      if (memIndex !== -1) {
        this.announcements[memIndex] = { ...this.announcements[memIndex], ...updated };
      }

      return updated;
    } catch (err) {
      // In-memory fallback
      const announcement = this.announcements.find(a => a.id === numericId);
      if (!announcement) return null;

      if (updateData.title !== undefined) announcement.title = updateData.title;
      if (updateData.content !== undefined) announcement.content = updateData.content;
      if (updateData.category !== undefined) announcement.category = updateData.category;
      if (updateData.author !== undefined) announcement.author = updateData.author;
      if (updateData.date !== undefined) announcement.date = updateData.date;

      return announcement;
    }
  }

  /**
   * DELETE: Removes an announcement by ID from PostgreSQL database
   * @param {number|string} id - Announcement ID
   * @returns {Promise<Object|null>} The deleted announcement or null if not found
   */
  async delete(id) {
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

    try {
      const res = await db.query(
        `DELETE FROM announcements
         WHERE id = $1
         RETURNING id, title, content, category, author, publication_date AS date;`,
        [numericId]
      );

      if (res.rows.length === 0) return null;
      const deleted = formatAnnouncement(res.rows[0]);

      // Mirror to in-memory cache
      const index = this.announcements.findIndex(a => a.id === numericId);
      if (index !== -1) {
        this.announcements.splice(index, 1);
      }

      return deleted;
    } catch (err) {
      // In-memory fallback
      const index = this.announcements.findIndex(a => a.id === numericId);
      if (index === -1) return null;

      const [deletedAnnouncement] = this.announcements.splice(index, 1);
      return deletedAnnouncement;
    }
  }
}

// Export singleton instance of Announcement model
const Announcement = new AnnouncementModel();
module.exports = Announcement;
