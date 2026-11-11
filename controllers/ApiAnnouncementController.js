const Announcement = require('../models/Announcement');
const { sendServerError } = require('../middleware');

/**
 * ApiAnnouncementController
 * Handles RESTful API requests for Announcements, providing JSON CRUD responses
 * backed by PostgreSQL database persistence.
 */
class ApiAnnouncementController {
  /**
   * READ ALL: GET /api/announcements
   */
  static async getAll(req, res) {
    try {
      const announcements = await Announcement.findAll();
      return res.status(200).json(announcements);
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Announcements REST API operation',
        backHref: '/api/swagger',
        backLabel: '📖 Open Swagger Docs'
      });
    }
  }

  /**
   * READ ONE: GET /api/announcements/:id
   */
  static async getById(req, res) {
    try {
      const announcement = await Announcement.findById(req.params.id);
      if (!announcement) {
        return res.status(404).json({ error: 'Announcement not found' });
      }
      return res.status(200).json(announcement);
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Announcements REST API operation',
        backHref: '/api/swagger',
        backLabel: '📖 Open Swagger Docs'
      });
    }
  }

  /**
   * CREATE: POST /api/announcements
   */
  static async create(req, res) {
    try {
      const newAnnouncement = await Announcement.create(req.body);
      return res.status(201).json({
        message: 'Announcement created successfully',
        announcement: newAnnouncement
      });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Announcements REST API operation',
        backHref: '/api/swagger',
        backLabel: '📖 Open Swagger Docs'
      });
    }
  }

  /**
   * UPDATE (Full): PUT /api/announcements/:id
   */
  static async update(req, res) {
    try {
      const updatedAnnouncement = await Announcement.update(req.params.id, req.body);
      if (!updatedAnnouncement) {
        return res.status(404).json({ error: 'Announcement not found' });
      }
      return res.status(200).json({
        message: 'Announcement updated successfully (PUT)',
        announcement: updatedAnnouncement
      });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Announcements REST API operation',
        backHref: '/api/swagger',
        backLabel: '📖 Open Swagger Docs'
      });
    }
  }

  /**
   * UPDATE (Partial): PATCH /api/announcements/:id
   */
  static async partialUpdate(req, res) {
    try {
      const updatedAnnouncement = await Announcement.update(req.params.id, req.body);
      if (!updatedAnnouncement) {
        return res.status(404).json({ error: 'Announcement not found' });
      }
      return res.status(200).json({
        message: 'Announcement modified successfully (PATCH)',
        announcement: updatedAnnouncement
      });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Announcements REST API operation',
        backHref: '/api/swagger',
        backLabel: '📖 Open Swagger Docs'
      });
    }
  }

  /**
   * DELETE: DELETE /api/announcements/:id
   */
  static async delete(req, res) {
    try {
      const deletedAnnouncement = await Announcement.delete(req.params.id);
      if (!deletedAnnouncement) {
        return res.status(404).json({ error: 'Announcement not found' });
      }
      return res.status(200).json({
        message: 'Announcement deleted successfully',
        deletedAnnouncement
      });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Announcements REST API operation',
        backHref: '/api/swagger',
        backLabel: '📖 Open Swagger Docs'
      });
    }
  }
}

module.exports = ApiAnnouncementController;
