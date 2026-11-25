const User = require('../models/User');
const JobPosting = require('../models/JobPosting');
const Announcement = require('../models/Announcement');
const Application = require('../models/Application');
const AdminView = require('../views/AdminView');
const { sendServerError } = require('../middleware');

function wantsHtml(req) {
  return Boolean(
    req &&
    typeof req.accepts === 'function' &&
    req.accepts('html') &&
    !String(req.originalUrl || req.url || '').startsWith('/api/') &&
    !String(req.headers?.accept || '').includes('application/json')
  );
}

/**
 * AdminController
 * Central management and governance controller.
 * Guarded strictly by requireAuth and requireRole('admin').
 */
class AdminController {
  /**
   * READ ALL: GET /admin
   * Gathers system metrics and presents central administration dashboard.
   */
  static async getDashboard(req, res) {
    try {
      const [users, jobs, announcements, applications] = await Promise.all([
        User.findAll(),
        JobPosting.findAll(),
        Announcement.findAll(),
        Application.findAll()
      ]);

      const data = { users, jobs, announcements, applications };

      let message = null;
      let alertType = 'success';

      if (req.query?.roleUpdated) {
        message = `Role updated successfully for User #${req.query.userId || ''}!`;
      } else if (req.query?.statusUpdated) {
        message = `Account status updated successfully for User #${req.query.userId || ''}!`;
      } else if (req.query?.userDeleted) {
        message = 'User record removed from database.';
        alertType = 'danger';
      } else if (req.query?.jobStatusUpdated) {
        message = 'Job posting status updated.';
      } else if (req.query?.jobDeleted) {
        message = 'Job posting permanently deleted.';
        alertType = 'danger';
      } else if (req.query?.announcementDeleted) {
        message = 'Announcement permanently deleted.';
        alertType = 'danger';
      } else if (req.query?.manipulated) {
        message = 'Data manipulation command executed and persisted successfully!';
      } else if (req.query?.error) {
        message = req.query.error;
        alertType = 'danger';
      }

      if (wantsHtml(req)) {
        if (typeof res.render === 'function') {
          return res.render('admin', {
            data,
            message,
            alertType,
            currentUser: req.user
          });
        }
        return res.status(200).send(
          AdminView.renderDashboard(data, {
            message,
            alertType,
            currentUser: req.user
          })
        );
      }

      return res.status(200).json({
        metrics: {
          usersCount: users.length,
          jobsCount: jobs.length,
          announcementsCount: announcements.length,
          applicationsCount: applications.length
        },
        users,
        jobs,
        announcements,
        applications
      });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Admin Dashboard loading',
        backHref: '/users',
        backLabel: '← Back to Directory'
      });
    }
  }

  /**
   * ASSIGN ROLE: POST /admin/users/:id/role or PATCH /api/admin/users/:id/role
   */
  static async updateUserRole(req, res) {
    try {
      const targetId = req.params.id;
      const targetRole = req.body?.role;

      if (!targetRole || !User.VALID_USER_ROLES.includes(String(targetRole).toLowerCase())) {
        if (wantsHtml(req)) {
          return res.redirect(`/admin?error=${encodeURIComponent('Invalid role specified.')}`);
        }
        return res.status(400).json({ error: `Invalid role. Allowed: ${User.VALID_USER_ROLES.join(', ')}` });
      }

      const updatedUser = await User.assignRole(targetId, targetRole);
      if (!updatedUser) {
        if (wantsHtml(req)) {
          return res.redirect(`/admin?error=${encodeURIComponent('User not found.')}`);
        }
        return res.status(404).json({ error: 'User not found' });
      }

      if (wantsHtml(req)) {
        return res.redirect(`/admin?roleUpdated=1&userId=${targetId}`);
      }

      return res.status(200).json({
        message: 'User role updated successfully',
        user: updatedUser
      });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Assigning user role',
        backHref: '/admin',
        backLabel: '← Back to Admin Panel'
      });
    }
  }

  /**
   * UPDATE STATUS: POST /admin/users/:id/status or PATCH /api/admin/users/:id/status
   */
  static async updateUserStatus(req, res) {
    try {
      const targetId = req.params.id;
      const targetStatus = req.body?.status || req.body?.accountStatus;

      if (!targetStatus || !User.VALID_ACCOUNT_STATUSES.includes(String(targetStatus).toLowerCase())) {
        if (wantsHtml(req)) {
          return res.redirect(`/admin?error=${encodeURIComponent('Invalid account status specified.')}`);
        }
        return res.status(400).json({ error: `Invalid status. Allowed: ${User.VALID_ACCOUNT_STATUSES.join(', ')}` });
      }

      const updatedUser = await User.updateAccountStatus(targetId, targetStatus);
      if (!updatedUser) {
        if (wantsHtml(req)) {
          return res.redirect(`/admin?error=${encodeURIComponent('User not found.')}`);
        }
        return res.status(404).json({ error: 'User not found' });
      }

      if (wantsHtml(req)) {
        return res.redirect(`/admin?statusUpdated=1&userId=${targetId}`);
      }

      return res.status(200).json({
        message: 'User account status updated successfully',
        user: updatedUser
      });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Updating user account status',
        backHref: '/admin',
        backLabel: '← Back to Admin Panel'
      });
    }
  }

  /**
   * DELETE USER: POST /admin/users/:id/delete or DELETE /api/admin/users/:id
   */
  static async deleteUser(req, res) {
    try {
      const deletedUser = await User.delete(req.params.id);
      if (!deletedUser) {
        if (wantsHtml(req)) {
          return res.redirect(`/admin?error=${encodeURIComponent('User not found.')}`);
        }
        return res.status(404).json({ error: 'User not found' });
      }

      if (wantsHtml(req)) {
        return res.redirect('/admin?userDeleted=1');
      }

      return res.status(200).json({
        message: 'User permanently deleted',
        deletedUser
      });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Deleting user record',
        backHref: '/admin',
        backLabel: '← Back to Admin Panel'
      });
    }
  }

  /**
   * UPDATE JOB STATUS: POST /admin/jobs/:id/status
   */
  static async updateJobStatus(req, res) {
    try {
      const targetStatus = req.body?.status || 'Active';
      const updatedJob = await JobPosting.update(req.params.id, { status: targetStatus });
      if (!updatedJob) {
        if (wantsHtml(req)) {
          return res.redirect(`/admin?error=${encodeURIComponent('Job posting not found.')}`);
        }
        return res.status(404).json({ error: 'Job posting not found' });
      }

      if (wantsHtml(req)) {
        return res.redirect('/admin?jobStatusUpdated=1');
      }

      return res.status(200).json({
        message: 'Job status updated',
        job: updatedJob
      });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Updating job status',
        backHref: '/admin',
        backLabel: '← Back to Admin Panel'
      });
    }
  }

  /**
   * DELETE JOB: POST /admin/jobs/:id/delete
   */
  static async deleteJob(req, res) {
    try {
      const deletedJob = await JobPosting.delete(req.params.id);
      if (!deletedJob) {
        if (wantsHtml(req)) {
          return res.redirect(`/admin?error=${encodeURIComponent('Job posting not found.')}`);
        }
        return res.status(404).json({ error: 'Job posting not found' });
      }

      if (wantsHtml(req)) {
        return res.redirect('/admin?jobDeleted=1');
      }

      return res.status(200).json({
        message: 'Job posting deleted',
        deletedJob
      });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Deleting job posting',
        backHref: '/admin',
        backLabel: '← Back to Admin Panel'
      });
    }
  }

  /**
   * DELETE ANNOUNCEMENT: POST /admin/announcements/:id/delete
   */
  static async deleteAnnouncement(req, res) {
    try {
      const deleted = await Announcement.delete(req.params.id);
      if (!deleted) {
        if (wantsHtml(req)) {
          return res.redirect(`/admin?error=${encodeURIComponent('Announcement not found.')}`);
        }
        return res.status(404).json({ error: 'Announcement not found' });
      }

      if (wantsHtml(req)) {
        return res.redirect('/admin?announcementDeleted=1');
      }

      return res.status(200).json({
        message: 'Announcement deleted',
        deleted
      });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Deleting announcement',
        backHref: '/admin',
        backLabel: '← Back to Admin Panel'
      });
    }
  }

  /**
   * DIRECT DATA MANIPULATION: POST /admin/manipulate or POST /api/admin/manipulate
   * Fast administration endpoint allowing direct property mutations across entities.
   */
  static async manipulate(req, res) {
    try {
      const entity = String(req.body?.entity || 'user').toLowerCase();
      const id = req.body?.id;
      const field = String(req.body?.field || '').trim();
      const rawValue = req.body?.value;

      if (!id || !field) {
        const errorMsg = 'Target ID and Field name are required for data manipulation.';
        if (wantsHtml(req)) {
          return res.redirect(`/admin?error=${encodeURIComponent(errorMsg)}`);
        }
        return res.status(400).json({ error: errorMsg });
      }

      let mutatedResult = null;

      if (entity === 'user') {
        if (field === 'role') {
          mutatedResult = await User.assignRole(id, rawValue);
        } else if (field === 'status' || field === 'accountStatus') {
          mutatedResult = await User.updateAccountStatus(id, rawValue);
        } else {
          mutatedResult = await User.update(id, { [field]: rawValue });
        }
      } else if (entity === 'job') {
        mutatedResult = await JobPosting.update(id, { [field]: rawValue });
      } else if (entity === 'announcement') {
        mutatedResult = await Announcement.update(id, { [field]: rawValue });
      } else {
        const errorMsg = `Unknown entity '${entity}'. Supported: user, job, announcement.`;
        if (wantsHtml(req)) {
          return res.redirect(`/admin?error=${encodeURIComponent(errorMsg)}`);
        }
        return res.status(400).json({ error: errorMsg });
      }

      if (!mutatedResult) {
        const notFoundMsg = `Record #${id} of type '${entity}' could not be found to manipulate.`;
        if (wantsHtml(req)) {
          return res.redirect(`/admin?error=${encodeURIComponent(notFoundMsg)}`);
        }
        return res.status(404).json({ error: notFoundMsg });
      }

      if (wantsHtml(req)) {
        return res.redirect('/admin?manipulated=1');
      }

      return res.status(200).json({
        message: 'Data manipulation completed successfully',
        entity,
        id,
        field,
        value: rawValue,
        result: mutatedResult
      });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Admin direct data manipulation',
        backHref: '/admin',
        backLabel: '← Back to Admin Panel'
      });
    }
  }
}

module.exports = AdminController;
