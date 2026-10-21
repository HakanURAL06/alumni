const Application = require('../models/Application');
const User = require('../models/User');
const JobPosting = require('../models/JobPosting');
const ApplicationView = require('../views/ApplicationView');

/**
 * ApplicationController
 * Web Presentation Controller for Job Applications:
 * - Direct: /applications
 * - Nested User: /users/:userId/applications (My Applications)
 * - Nested Job: /jobs/:jobId/applications (Candidate Review)
 */
class ApplicationController {
  /**
   * DIRECT: GET /applications
   */
  static async getAll(req, res) {
    try {
      const applications = await Application.findAll();

      if (req.accepts('html')) {
        let message = null;
        let alertType = 'success';

        if (req.query) {
          if (req.query.success) {
            message = 'Application submitted successfully!';
            alertType = 'success';
          } else if (req.query.updated) {
            message = 'Application status updated successfully!';
            alertType = 'info';
          } else if (req.query.deleted) {
            message = 'Application removed/withdrawn successfully!';
            alertType = 'danger';
          }
        }

        if (typeof res.render === 'function') {
          return res.render('applications', { applications, message, alertType });
        }
        return res.send(ApplicationView.renderApplications(applications, { message, alertType }));
      }

      return res.status(200).json(applications);
    } catch (error) {
      return res.status(500).send('Error loading applications');
    }
  }

  /**
   * DIRECT: GET /applications/:id
   */
  static async getById(req, res) {
    try {
      const application = await Application.findByIdWithDetails(req.params.id);
      if (!application) {
        if (req.accepts('html')) {
          return res.status(404).send('Application not found');
        }
        return res.status(404).json({ error: 'Application not found' });
      }

      if (req.accepts('html')) {
        let message = null;
        let alertType = 'success';

        if (req.query && req.query.updated) {
          message = 'Application status updated successfully!';
          alertType = 'info';
        }

        if (typeof res.render === 'function') {
          return res.render('applicationDetail', { application, message, alertType });
        }
        return res.send(ApplicationView.renderApplicationDetail(application, { message, alertType }));
      }

      return res.status(200).json(application);
    } catch (error) {
      return res.status(500).send('Error loading application');
    }
  }

  /**
   * CREATE: POST /applications
   */
  static async create(req, res) {
    try {
      const payload = {
        userId: Number(req.body.userId),
        jobPostingId: Number(req.body.jobPostingId),
        resumeUrl: req.body.resumeUrl || null,
        coverNote: req.body.coverNote || null,
        status: req.body.status || 'Submitted'
      };

      if (!payload.userId || !payload.jobPostingId) {
        return res.status(400).send('userId and jobPostingId are required');
      }

      const newApp = await Application.create(payload);

      if (req.accepts('html')) {
        return res.redirect('/applications?success=1');
      }

      return res.status(201).json({
        message: 'Application submitted successfully',
        application: newApp
      });
    } catch (error) {
      return res.status(500).send('Error submitting application');
    }
  }

  /**
   * UPDATE STATUS: POST /applications/:id/status
   */
  static async updateStatus(req, res) {
    try {
      const id = req.params.id;
      const { status } = req.body;
      const updated = await Application.update(id, { status });

      if (!updated) {
        return res.status(404).send('Application not found');
      }

      if (req.accepts('html')) {
        return res.redirect(`/applications/${id}?updated=1`);
      }

      return res.status(200).json({
        message: 'Application status updated',
        application: updated
      });
    } catch (error) {
      return res.status(500).send('Error updating application status');
    }
  }

  /**
   * DELETE / WITHDRAW: POST /applications/:id/delete or DELETE /applications/:id
   */
  static async delete(req, res) {
    try {
      const id = req.params.id;
      const deleted = await Application.delete(id);
      if (!deleted) {
        return res.status(404).send('Application not found');
      }

      if (req.accepts('html')) {
        return res.redirect('/applications?deleted=1');
      }

      return res.status(200).json({
        message: 'Application withdrawn successfully',
        deletedApplication: deleted
      });
    } catch (error) {
      return res.status(500).send('Error deleting application');
    }
  }

  /**
   * NESTED: GET /users/:userId/applications
   */
  static async getByUser(req, res) {
    try {
      const userId = req.params.userId || req.params.id;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send('User not found');
      }
      const applications = await Application.findByUser(userId);

      if (req.accepts('html') && !req.xhr && !req.headers['sec-fetch-dest']?.includes('empty')) {
        const subtitle = `Applications submitted by alumni ${user.name} (${user.email})`;
        if (typeof res.render === 'function') {
          return res.render('applications', { applications, subtitle });
        }
        return res.send(ApplicationView.renderApplications(applications, { subtitle }));
      }

      return res.status(200).json({ user, applications });
    } catch (error) {
      return res.status(500).send('Error loading user applications');
    }
  }

  /**
   * NESTED: GET /jobs/:jobId/applications
   */
  static async getByJob(req, res) {
    try {
      const jobId = req.params.jobId || req.params.id;
      const job = await JobPosting.findById(jobId);
      if (!job) {
        return res.status(404).send('Job posting not found');
      }
      const applications = await Application.findByJob(jobId);

      if (req.accepts('html') && !req.xhr && !req.headers['sec-fetch-dest']?.includes('empty')) {
        const subtitle = `Candidate applications received for ${job.title} at ${job.company}`;
        if (typeof res.render === 'function') {
          return res.render('applications', { applications, subtitle });
        }
        return res.send(ApplicationView.renderApplications(applications, { subtitle }));
      }

      return res.status(200).json({ job, applications });
    } catch (error) {
      return res.status(500).send('Error loading job applications');
    }
  }
}

module.exports = ApplicationController;
