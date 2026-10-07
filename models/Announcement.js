/**
 * Announcement Model
 * In-memory data store with complete CRUD functions (without database connection).
 */
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
   * CREATE: Adds a new announcement to the in-memory store
   * @param {Object} data - Announcement details (title, content, category, author, date)
   * @returns {Object} The created announcement with auto-generated ID
   */
  create(data = {}) {
    const nextId = this.announcements.length
      ? Math.max(...this.announcements.map(a => a.id)) + 1
      : 1;

    const newAnnouncement = {
      id: nextId,
      title: data.title || 'New Announcement',
      content: data.content || '',
      category: data.category || 'General',
      author: data.author || 'Alumni Office',
      date: data.date || new Date().toISOString().split('T')[0]
    };

    this.announcements.push(newAnnouncement);
    return newAnnouncement;
  }

  /**
   * READ: Returns all announcements
   * @returns {Array<Object>} List of all announcements
   */
  findAll() {
    return [...this.announcements];
  }

  /**
   * READ: Finds a single announcement by ID
   * @param {number|string} id - Announcement ID
   * @returns {Object|null} Announcement object or null if not found
   */
  findById(id) {
    const numericId = Number(id);
    return this.announcements.find(a => a.id === numericId) || null;
  }

  /**
   * UPDATE: Updates announcement fields (supports full and partial updates)
   * @param {number|string} id - Announcement ID
   * @param {Object} updateData - Fields to update
   * @returns {Object|null} The updated announcement or null if not found
   */
  update(id, updateData = {}) {
    const announcement = this.findById(id);
    if (!announcement) return null;

    if (updateData.title !== undefined) announcement.title = updateData.title;
    if (updateData.content !== undefined) announcement.content = updateData.content;
    if (updateData.category !== undefined) announcement.category = updateData.category;
    if (updateData.author !== undefined) announcement.author = updateData.author;
    if (updateData.date !== undefined) announcement.date = updateData.date;

    return announcement;
  }

  /**
   * DELETE: Removes an announcement by ID
   * @param {number|string} id - Announcement ID
   * @returns {Object|null} The deleted announcement or null if not found
   */
  delete(id) {
    const numericId = Number(id);
    const index = this.announcements.findIndex(a => a.id === numericId);
    if (index === -1) return null;

    const [deletedAnnouncement] = this.announcements.splice(index, 1);
    return deletedAnnouncement;
  }
}

// Export singleton instance of Announcement model
const Announcement = new AnnouncementModel();
module.exports = Announcement;
