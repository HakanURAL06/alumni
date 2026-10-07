const Announcement = require('../models/Announcement');
const AnnouncementView = require('../views/AnnouncementView');

/**
 * AnnouncementController
 * Handles web/presentation actions and management interface for announcements using the View Layer.
 */
class AnnouncementController {
  /**
   * READ ALL: GET /announcements
   * Renders the Announcements management interface HTML view or returns JSON.
   */
  static getAll(req, res) {
    try {
      const announcements = Announcement.findAll();

      if (req.accepts('html')) {
        let message = null;
        let alertType = 'success';

        if (req.query) {
          if (req.query.success) {
            message = 'Announcement published successfully!';
            alertType = 'success';
          } else if (req.query.updated) {
            message = 'Announcement updated successfully!';
            alertType = 'info';
          } else if (req.query.deleted) {
            message = 'Announcement deleted successfully!';
            alertType = 'danger';
          }
        }

        if (typeof res.render === 'function') {
          return res.render('announcements', { announcements, message, alertType });
        }
        return res.send(AnnouncementView.renderAnnouncements(announcements, { message, alertType }));
      }

      return res.status(200).json(announcements);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * READ ONE: GET /announcements/:id
   * Renders the single announcement detail HTML view or returns JSON.
   */
  static getById(req, res) {
    try {
      const announcement = Announcement.findById(req.params.id);
      if (!announcement) {
        if (req.accepts('html')) {
          return res.status(404).send('<h2>404 - Announcement Not Found</h2><p><a href="/announcements">← Back to Announcements</a></p>');
        }
        return res.status(404).json({ error: 'Announcement not found' });
      }

      if (req.accepts('html')) {
        if (typeof res.render === 'function') {
          return res.render('announcementDetail', { announcement });
        }
        return res.send(AnnouncementView.renderAnnouncementDetail(announcement));
      }

      return res.status(200).json(announcement);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * EDIT FORM: GET /announcements/:id/edit
   * Renders the HTML edit form via the View Layer.
   */
  static getEditForm(req, res) {
    try {
      const announcement = Announcement.findById(req.params.id);
      if (!announcement) {
        if (req.accepts('html')) {
          return res.status(404).send('<h2>404 - Announcement Not Found</h2><p><a href="/announcements">← Back to Announcements</a></p>');
        }
        return res.status(404).json({ error: 'Announcement not found' });
      }

      if (req.accepts('html')) {
        if (typeof res.render === 'function') {
          return res.render('announcementEdit', { announcement });
        }
        return res.send(AnnouncementView.renderAnnouncementEdit(announcement));
      }

      return res.status(200).json(announcement);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * CREATE: POST /announcements
   * Receives form data or JSON, publishes a new announcement, and redirects to management view.
   */
  static create(req, res) {
    try {
      const newAnnouncement = Announcement.create(req.body);
      if (req.accepts('html')) {
        return res.redirect('/announcements?success=1');
      }
      return res.status(201).json({
        message: 'Announcement created successfully',
        announcement: newAnnouncement
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * UPDATE: PUT /announcements/:id or POST /announcements/:id/edit
   * Updates an existing announcement and redirects to management view.
   */
  static update(req, res) {
    try {
      const updatedAnnouncement = Announcement.update(req.params.id, req.body);
      if (!updatedAnnouncement) {
        if (req.accepts('html')) {
          return res.status(404).send('<h2>404 - Announcement Not Found</h2><p><a href="/announcements">← Back to Announcements</a></p>');
        }
        return res.status(404).json({ error: 'Announcement not found' });
      }

      if (req.accepts('html')) {
        return res.redirect('/announcements?updated=1');
      }

      return res.status(200).json({
        message: 'Announcement updated successfully',
        announcement: updatedAnnouncement
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * UPDATE (Partial): PATCH /announcements/:id
   */
  static partialUpdate(req, res) {
    return AnnouncementController.update(req, res);
  }

  /**
   * DELETE: DELETE /announcements/:id or POST /announcements/:id/delete
   * Removes an announcement and redirects to management view.
   */
  static delete(req, res) {
    try {
      const deletedAnnouncement = Announcement.delete(req.params.id);
      if (!deletedAnnouncement) {
        if (req.accepts('html')) {
          return res.status(404).send('<h2>404 - Announcement Not Found</h2><p><a href="/announcements">← Back to Announcements</a></p>');
        }
        return res.status(404).json({ error: 'Announcement not found' });
      }

      if (req.accepts('html')) {
        return res.redirect('/announcements?deleted=1');
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

module.exports = AnnouncementController;
