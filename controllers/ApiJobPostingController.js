const JobPosting = require('../models/JobPosting');
const User = require('../models/User');

/**
 * ApiJobPostingController
 * Handles both direct RESTful API endpoints (/api/jobs) and nested endpoints
 * (/api/users/:userId/jobs) with PostgreSQL persistence and in-memory fallback.
 */
class ApiJobPostingController {
  /**
   * READ ALL:
   * Direct: GET /api/jobs
   * Nested: GET /api/users/:userId/jobs
   */
  static async getAll(req, res) {
    try {
      const filters = { ...req.query };
      const userId = req.params.userId || req.params.user_id;

      if (userId) {
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        filters.postedBy = Number(userId);
      }

      const jobs = await JobPosting.findAll(filters);
      return res.status(200).json(jobs);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * READ ONE:
   * Direct: GET /api/jobs/:id
   * Nested: GET /api/users/:userId/jobs/:id
   */
  static async getById(req, res) {
    try {
      const id = req.params.jobId || req.params.id;
      const job = await JobPosting.findById(id);

      if (!job) {
        return res.status(404).json({ error: 'Job posting not found' });
      }

      const userId = req.params.userId || req.params.user_id;
      if (userId && Number(job.postedBy) !== Number(userId)) {
        return res.status(404).json({ error: 'Job posting not found for this user' });
      }

      return res.status(200).json(job);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * CREATE:
   * Direct: POST /api/jobs
   * Nested: POST /api/users/:userId/jobs
   */
  static async create(req, res) {
    try {
      const payload = { ...req.body };
      const userId = req.params.userId || req.params.user_id;

      if (userId) {
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        payload.postedBy = Number(userId);
      }

      const newJob = await JobPosting.create(payload);
      return res.status(201).json({
        message: 'Job posting created successfully',
        jobPosting: newJob
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * UPDATE (Full):
   * Direct: PUT /api/jobs/:id
   * Nested: PUT /api/users/:userId/jobs/:id
   */
  static async update(req, res) {
    try {
      const id = req.params.jobId || req.params.id;
      const userId = req.params.userId || req.params.user_id;

      if (userId) {
        const existing = await JobPosting.findById(id);
        if (!existing || Number(existing.postedBy) !== Number(userId)) {
          return res.status(404).json({ error: 'Job posting not found for this user' });
        }
      }

      const updated = await JobPosting.update(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Job posting not found' });
      }

      return res.status(200).json({
        message: 'Job posting updated successfully (PUT)',
        jobPosting: updated
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * UPDATE (Partial):
   * Direct: PATCH /api/jobs/:id
   * Nested: PATCH /api/users/:userId/jobs/:id
   */
  static async partialUpdate(req, res) {
    try {
      const id = req.params.jobId || req.params.id;
      const userId = req.params.userId || req.params.user_id;

      if (userId) {
        const existing = await JobPosting.findById(id);
        if (!existing || Number(existing.postedBy) !== Number(userId)) {
          return res.status(404).json({ error: 'Job posting not found for this user' });
        }
      }

      const updated = await JobPosting.update(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Job posting not found' });
      }

      return res.status(200).json({
        message: 'Job posting modified successfully (PATCH)',
        jobPosting: updated
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * DELETE:
   * Direct: DELETE /api/jobs/:id
   * Nested: DELETE /api/users/:userId/jobs/:id
   */
  static async delete(req, res) {
    try {
      const id = req.params.jobId || req.params.id;
      const userId = req.params.userId || req.params.user_id;

      if (userId) {
        const existing = await JobPosting.findById(id);
        if (!existing || Number(existing.postedBy) !== Number(userId)) {
          return res.status(404).json({ error: 'Job posting not found for this user' });
        }
      }

      const deleted = await JobPosting.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Job posting not found' });
      }

      return res.status(200).json({
        message: 'Job posting deleted successfully',
        deletedJobPosting: deleted
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * RELATIONSHIP: GET /api/jobs/:id/user
   * Returns the alumni profile who published this job
   */
  static async getUser(req, res) {
    try {
      const user = await JobPosting.getPostedByUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'Publisher user not found for this job posting' });
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = ApiJobPostingController;
