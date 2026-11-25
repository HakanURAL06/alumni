const JobPosting = require('../models/JobPosting');
const User = require('../models/User');
const JobPostingView = require('../views/JobPostingView');
const { sendResourceNotFound, sendServerError } = require('../middleware');

const JOB_NOT_FOUND_OPTS = {
  resourceName: 'Job posting',
  backHref: '/jobs',
  backLabel: '← Back to Job Board'
};

/**
 * JobPostingController
 * Handles Web Presentation requests and CRUD actions for Job Postings using the View Layer,
 * supporting both direct (/jobs) and nested (/users/:userId/jobs) endpoints.
 */
class JobPostingController {
  /**
   * READ ALL: GET /jobs
   */
  static async getAll(req, res) {
    try {
      const jobs = await JobPosting.findAll();

      if (req.accepts('html')) {
        let message = null;
        let alertType = 'success';

        if (req.query) {
          if (req.query.success) {
            message = 'Job opportunity published successfully!';
            alertType = 'success';
          } else if (req.query.updated) {
            message = 'Job opportunity updated successfully!';
            alertType = 'info';
          } else if (req.query.deleted) {
            message = 'Job opportunity deleted successfully!';
            alertType = 'danger';
          }
        }

        if (typeof res.render === 'function') {
          return res.render('jobs', { jobs, message, alertType, currentUser: req.user });
        }
        return res.send(JobPostingView.renderJobs(jobs, { message, alertType, currentUser: req.user }));
      }

      return res.status(200).json(jobs);
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Loading job postings',
        backHref: '/jobs',
        backLabel: '← Back to Job Board'
      });
    }
  }

  /**
   * READ ONE: GET /jobs/:id
   */
  static async getById(req, res) {
    try {
      const job = await JobPosting.findByIdWithUser(req.params.id);
      if (!job) {
        return sendResourceNotFound(req, res, { ...JOB_NOT_FOUND_OPTS, id: req.params.id });
      }

      if (req.accepts('html')) {
        let message = null;
        let alertType = 'success';

        if (req.query) {
          if (req.query.applied) {
            message = 'Your application was submitted successfully!';
            alertType = 'success';
          } else if (req.query.updated) {
            message = 'Job details updated successfully!';
            alertType = 'info';
          }
        }

        if (typeof res.render === 'function') {
          return res.render('jobDetail', { job, message, alertType, currentUser: req.user });
        }
        return res.send(JobPostingView.renderJobDetail(job, { message, alertType, currentUser: req.user }));
      }

      return res.status(200).json(job);
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Loading job posting details',
        backHref: '/jobs',
        backLabel: '← Back to Job Board'
      });
    }
  }

  /**
   * EDIT FORM: GET /jobs/:id/edit
   */
  static async getEditForm(req, res) {
    try {
      const job = await JobPosting.findById(req.params.id);
      if (!job) {
        return sendResourceNotFound(req, res, { ...JOB_NOT_FOUND_OPTS, id: req.params.id });
      }

      if (req.accepts('html')) {
        if (typeof res.render === 'function') {
          return res.render('jobEdit', { job, currentUser: req.user });
        }
        return res.send(JobPostingView.renderJobEdit(job, { currentUser: req.user }));
      }

      return res.status(200).json(job);
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Loading job edit form',
        backHref: '/jobs',
        backLabel: '← Back to Job Board'
      });
    }
  }

  /**
   * CREATE: POST /jobs
   */
  static async create(req, res) {
    try {
      const payload = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location || 'Remote',
        jobType: req.body.jobType || 'Full-time',
        description: req.body.description || '',
        requirements: req.body.requirements || '',
        salary: req.body.salary || '',
        contactEmail: req.body.contactEmail,
        postedBy: Number(req.body.postedBy) || 1,
        status: req.body.status || 'Active',
        applicationDeadline: req.body.applicationDeadline || null
      };

      const newJob = await JobPosting.create(payload);

      if (req.accepts('html')) {
        return res.redirect('/jobs?success=1');
      }

      return res.status(201).json({
        message: 'Job posting created successfully',
        jobPosting: newJob
      });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Creating job posting',
        backHref: '/jobs',
        backLabel: '← Back to Job Board'
      });
    }
  }

  /**
   * UPDATE: POST /jobs/:id/edit or PUT /jobs/:id
   */
  static async update(req, res) {
    try {
      const id = req.params.id;
      const updated = await JobPosting.update(id, req.body);
      if (!updated) {
        return sendResourceNotFound(req, res, { ...JOB_NOT_FOUND_OPTS, id: req.params.id });
      }

      if (req.accepts('html')) {
        return res.redirect(`/jobs/${id}?updated=1`);
      }

      return res.status(200).json({
        message: 'Job posting updated successfully',
        jobPosting: updated
      });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Updating job posting',
        backHref: '/jobs',
        backLabel: '← Back to Job Board'
      });
    }
  }

  /**
   * DELETE: POST /jobs/:id/delete or DELETE /jobs/:id
   */
  static async delete(req, res) {
    try {
      const id = req.params.id;
      const deleted = await JobPosting.delete(id);
      if (!deleted) {
        return sendResourceNotFound(req, res, { ...JOB_NOT_FOUND_OPTS, id: req.params.id });
      }

      if (req.accepts('html')) {
        return res.redirect('/jobs?deleted=1');
      }

      return res.status(200).json({
        message: 'Job posting deleted successfully',
        deletedJob: deleted
      });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Deleting job posting',
        backHref: '/jobs',
        backLabel: '← Back to Job Board'
      });
    }
  }

  /**
   * NESTED: GET /users/:userId/jobs
   */
  static async getByUser(req, res) {
    try {
      const userId = req.params.userId || req.params.id;
      const user = await User.findById(userId);
      if (!user) {
        return sendResourceNotFound(req, res, {
          resourceName: 'User',
          id: userId,
          backHref: '/users',
          backLabel: '← Back to Alumni Directory'
        });
      }
      const jobs = await JobPosting.findByPostedBy(userId);

      if (req.accepts('html') && !req.xhr && !req.headers['sec-fetch-dest']?.includes('empty')) {
        const subtitle = `Career opportunities published by ${user.name} (${user.department})`;
        if (typeof res.render === 'function') {
          return res.render('jobs', { jobs, subtitle, currentUser: req.user });
        }
        return res.send(JobPostingView.renderJobs(jobs, { subtitle, currentUser: req.user }));
      }

      return res.status(200).json({ user, jobs });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Loading user job postings',
        backHref: '/jobs',
        backLabel: '← Back to Job Board'
      });
    }
  }
}

module.exports = JobPostingController;
