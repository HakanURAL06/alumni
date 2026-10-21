const JobPosting = require('../models/JobPosting');
const User = require('../models/User');
const JobPostingView = require('../views/JobPostingView');

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
          return res.render('jobs', { jobs, message, alertType });
        }
        return res.send(JobPostingView.renderJobs(jobs, { message, alertType }));
      }

      return res.status(200).json(jobs);
    } catch (error) {
      return res.status(500).send('Error loading job postings');
    }
  }

  /**
   * READ ONE: GET /jobs/:id
   */
  static async getById(req, res) {
    try {
      const job = await JobPosting.findByIdWithUser(req.params.id);
      if (!job) {
        if (req.accepts('html')) {
          return res.status(404).send('Job posting not found');
        }
        return res.status(404).json({ error: 'Job posting not found' });
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
          return res.render('jobDetail', { job, message, alertType });
        }
        return res.send(JobPostingView.renderJobDetail(job, { message, alertType }));
      }

      return res.status(200).json(job);
    } catch (error) {
      return res.status(500).send('Error loading job posting');
    }
  }

  /**
   * EDIT FORM: GET /jobs/:id/edit
   */
  static async getEditForm(req, res) {
    try {
      const job = await JobPosting.findById(req.params.id);
      if (!job) {
        return res.status(404).send('Job posting not found');
      }

      if (req.accepts('html')) {
        if (typeof res.render === 'function') {
          return res.render('jobEdit', { job });
        }
        return res.send(JobPostingView.renderJobEdit(job));
      }

      return res.status(200).json(job);
    } catch (error) {
      return res.status(500).send('Error loading edit form');
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
      return res.status(500).send('Error creating job posting');
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
        return res.status(404).send('Job posting not found');
      }

      if (req.accepts('html')) {
        return res.redirect(`/jobs/${id}?updated=1`);
      }

      return res.status(200).json({
        message: 'Job posting updated successfully',
        jobPosting: updated
      });
    } catch (error) {
      return res.status(500).send('Error updating job posting');
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
        return res.status(404).send('Job posting not found');
      }

      if (req.accepts('html')) {
        return res.redirect('/jobs?deleted=1');
      }

      return res.status(200).json({
        message: 'Job posting deleted successfully',
        deletedJob: deleted
      });
    } catch (error) {
      return res.status(500).send('Error deleting job posting');
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
        return res.status(404).send('User not found');
      }
      const jobs = await JobPosting.findByPostedBy(userId);

      if (req.accepts('html') && !req.xhr && !req.headers['sec-fetch-dest']?.includes('empty')) {
        const subtitle = `Career opportunities published by ${user.name} (${user.department})`;
        if (typeof res.render === 'function') {
          return res.render('jobs', { jobs, subtitle });
        }
        return res.send(JobPostingView.renderJobs(jobs, { subtitle }));
      }

      return res.status(200).json({ user, jobs });
    } catch (error) {
      return res.status(500).send('Error loading user job postings');
    }
  }
}

module.exports = JobPostingController;
