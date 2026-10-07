const Announcement = require('../models/Announcement');

/**
 * ApiAnnouncementController
 * Handles RESTful API requests for Announcements, providing JSON CRUD responses.
 */
class ApiAnnouncementController {
  /**
   * READ ALL: GET /api/announcements
   */
  static getAll(req, res) {
    try {
      const announcements = Announcement.findAll();
      return res.status(200).json(announcements);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * READ ONE: GET /api/announcements/:id
   */
  static getById(req, res) {
    try {
      const announcement = Announcement.findById(req.params.id);
      if (!announcement) {
        return res.status(404).json({ error: 'Announcement not found' });
      }
      return res.status(200).json(announcement);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * CREATE: POST /api/announcements
   */
  static create(req, res) {
    try {
      const newAnnouncement = Announcement.create(req.body);
      return res.status(201).json({
        message: 'Announcement created successfully',
        announcement: newAnnouncement
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * UPDATE (Full): PUT /api/announcements/:id
   */
  static update(req, res) {
    try {
      const updatedAnnouncement = Announcement.update(req.params.id, req.body);
      if (!updatedAnnouncement) {
        return res.status(404).json({ error: 'Announcement not found' });
      }
      return res.status(200).json({
        message: 'Announcement updated successfully (PUT)',
        announcement: updatedAnnouncement
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * UPDATE (Partial): PATCH /api/announcements/:id
   */
  static partialUpdate(req, res) {
    try {
      const updatedAnnouncement = Announcement.update(req.params.id, req.body);
      if (!updatedAnnouncement) {
        return res.status(404).json({ error: 'Announcement not found' });
      }
      return res.status(200).json({
        message: 'Announcement modified successfully (PATCH)',
        announcement: updatedAnnouncement
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * DELETE: DELETE /api/announcements/:id
   */
  static delete(req, res) {
    try {
      const deletedAnnouncement = Announcement.delete(req.params.id);
      if (!deletedAnnouncement) {
        return res.status(404).json({ error: 'Announcement not found' });
      }
      return res.status(200).json({
        message: 'Announcement deleted successfully',
        deletedAnnouncement
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = ApiAnnouncementController;
