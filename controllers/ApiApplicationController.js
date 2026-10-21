const Application = require('../models/Application');
const User = require('../models/User');
const JobPosting = require('../models/JobPosting');

/**
 * ApiApplicationController
 * Handles direct RESTful routes (/api/applications) and nested parent-child routes:
 * - User -> Applications: /api/users/:userId/applications
 * - Job -> Applications: /api/jobs/:jobId/applications
 */
class ApiApplicationController {
  /**
   * READ ALL:
   * Direct: GET /api/applications
   * Nested User: GET /api/users/:userId/applications
   * Nested Job: GET /api/jobs/:jobId/applications
   */
  static async getAll(req, res) {
    try {
      const filters = { ...req.query };
      const userId = req.params.userId || req.params.user_id;
      const jobId = req.params.jobId || req.params.job_id || req.params.jobPostingId;

      if (userId) {
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        filters.userId = Number(userId);
      }

      if (jobId) {
        const job = await JobPosting.findById(jobId);
        if (!job) {
          return res.status(404).json({ error: 'Job posting not found' });
        }
        filters.jobPostingId = Number(jobId);
      }

      const applications = await Application.findAll(filters);
      return res.status(200).json(applications);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * READ ONE:
   * Direct: GET /api/applications/:id
   * Nested User: GET /api/users/:userId/applications/:id
   * Nested Job: GET /api/jobs/:jobId/applications/:id
   */
  static async getById(req, res) {
    try {
      const id = req.params.applicationId || req.params.id;
      const application = await Application.findByIdWithDetails(id);

      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }

      const userId = req.params.userId || req.params.user_id;
      if (userId && Number(application.userId) !== Number(userId)) {
        return res.status(404).json({ error: 'Application not found for this user' });
      }

      const jobId = req.params.jobId || req.params.job_id;
      if (jobId && Number(application.jobPostingId) !== Number(jobId)) {
        return res.status(404).json({ error: 'Application not found for this job posting' });
      }

      return res.status(200).json(application);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * CREATE:
   * Direct: POST /api/applications
   * Nested User: POST /api/users/:userId/applications
   * Nested Job: POST /api/jobs/:jobId/applications
   */
  static async create(req, res) {
    try {
      const payload = { ...req.body };
      const userId = req.params.userId || req.params.user_id;
      const jobId = req.params.jobId || req.params.job_id;

      if (userId) {
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        payload.userId = Number(userId);
      }

      if (jobId) {
        const job = await JobPosting.findById(jobId);
        if (!job) {
          return res.status(404).json({ error: 'Job posting not found' });
        }
        payload.jobPostingId = Number(jobId);
      }

      if (!payload.userId || !payload.jobPostingId) {
        return res.status(400).json({ error: 'userId and jobPostingId are required' });
      }

      const newApp = await Application.create(payload);
      return res.status(201).json({
        message: 'Application submitted successfully',
        application: newApp
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * UPDATE (Full): PUT /api/applications/:id
   */
  static async update(req, res) {
    try {
      const id = req.params.applicationId || req.params.id;
      const updated = await Application.update(id, req.body);

      if (!updated) {
        return res.status(404).json({ error: 'Application not found' });
      }

      return res.status(200).json({
        message: 'Application updated successfully (PUT)',
        application: updated
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * UPDATE (Partial):
   * Direct: PATCH /api/applications/:id
   * Nested Job: PATCH /api/jobs/:jobId/applications/:id (e.g. status: Accepted)
   */
  static async partialUpdate(req, res) {
    try {
      const id = req.params.applicationId || req.params.id;
      const jobId = req.params.jobId || req.params.job_id;

      if (jobId) {
        const existing = await Application.findById(id);
        if (!existing || Number(existing.jobPostingId) !== Number(jobId)) {
          return res.status(404).json({ error: 'Application not found for this job posting' });
        }
      }

      const updated = await Application.update(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Application not found' });
      }

      return res.status(200).json({
        message: 'Application status modified successfully (PATCH)',
        application: updated
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * DELETE:
   * Direct: DELETE /api/applications/:id
   * Nested User: DELETE /api/users/:userId/applications/:id (Withdraw application)
   */
  static async delete(req, res) {
    try {
      const id = req.params.applicationId || req.params.id;
      const userId = req.params.userId || req.params.user_id;

      if (userId) {
        const existing = await Application.findById(id);
        if (!existing || Number(existing.userId) !== Number(userId)) {
          return res.status(404).json({ error: 'Application not found for this user' });
        }
      }

      const deleted = await Application.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Application not found' });
      }

      return res.status(200).json({
        message: 'Application withdrawn/deleted successfully',
        deletedApplication: deleted
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = ApiApplicationController;
