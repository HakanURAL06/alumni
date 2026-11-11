const User = require('../models/User');
const UserView = require('../views/UserView');
const { sendResourceNotFound, sendServerError } = require('../middleware');

const USER_NOT_FOUND_OPTS = {
  resourceName: 'User',
  backHref: '/users',
  backLabel: '← Back to Alumni Directory'
};

/**
 * UserController
 * Implements complete CRUD operations for User resources with View Layer presentation,
 * integrated with database persistence.
 */
class UserController {
  /**
   * READ ALL: GET /users
   * Renders the Alumni Directory HTML view via the View Layer or returns JSON.
   */
  static async getAll(req, res) {
    try {
      const users = await User.findAll();

      // Return HTML view for browser clients using the View Layer
      if (req.accepts('html')) {
        let message = null;
        let alertType = 'success';

        if (req.query) {
          if (req.query.success) {
            message = 'Alumni user created successfully!';
            alertType = 'success';
          } else if (req.query.updated) {
            message = 'Alumni user updated successfully!';
            alertType = 'info';
          } else if (req.query.deleted) {
            message = 'Alumni user deleted successfully!';
            alertType = 'danger';
          }
        }

        if (typeof res.render === 'function') {
          return res.render('users', { users, message, alertType });
        }
        return res.send(UserView.renderUsers(users, { message, alertType }));
      }

      return res.status(200).json(users);
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Alumni Directory operation',
        backHref: '/users',
        backLabel: '← Back to Alumni Directory'
      });
    }
  }

  /**
   * READ ONE: GET /users/:id
   * Renders the individual profile HTML view via the View Layer or returns JSON.
   */
  static async getById(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return sendResourceNotFound(req, res, { ...USER_NOT_FOUND_OPTS, id: req.params.id });
      }

      if (req.accepts('html')) {
        if (typeof res.render === 'function') {
          return res.render('userDetail', { user });
        }
        return res.send(UserView.renderUserDetail(user));
      }

      return res.status(200).json(user);
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Alumni Directory operation',
        backHref: '/users',
        backLabel: '← Back to Alumni Directory'
      });
    }
  }

  /**
   * EDIT FORM: GET /users/:id/edit
   * Renders the HTML edit form via the View Layer for updating an alumni record.
   */
  static async getEditForm(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return sendResourceNotFound(req, res, { ...USER_NOT_FOUND_OPTS, id: req.params.id });
      }

      if (req.accepts('html')) {
        if (typeof res.render === 'function') {
          return res.render('userEdit', { user });
        }
        return res.send(UserView.renderUserEdit(user));
      }

      return res.status(200).json(user);
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Alumni Directory operation',
        backHref: '/users',
        backLabel: '← Back to Alumni Directory'
      });
    }
  }

  /**
   * CREATE: POST /users
   * Receives form data or JSON, creates a new user, and redirects with View Layer feedback.
   */
  static async create(req, res) {
    try {
      const newUser = await User.create(req.body);
      if (req.accepts('html')) {
        return res.redirect('/users?success=1');
      }
      return res.status(201).json({
        message: 'User created successfully',
        user: newUser
      });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Alumni Directory operation',
        backHref: '/users',
        backLabel: '← Back to Alumni Directory'
      });
    }
  }

  /**
   * UPDATE: PUT /users/:id or POST /users/:id/edit
   * Updates existing alumni record and redirects with View Layer feedback.
   */
  static async update(req, res) {
    try {
      const updatedUser = await User.update(req.params.id, req.body);
      if (!updatedUser) {
        return sendResourceNotFound(req, res, { ...USER_NOT_FOUND_OPTS, id: req.params.id });
      }

      if (req.accepts('html')) {
        return res.redirect('/users?updated=1');
      }

      return res.status(200).json({
        message: 'User updated successfully',
        user: updatedUser
      });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Alumni Directory operation',
        backHref: '/users',
        backLabel: '← Back to Alumni Directory'
      });
    }
  }

  /**
   * UPDATE (Partial): PATCH /users/:id
   */
  static async partialUpdate(req, res) {
    return UserController.update(req, res);
  }

  /**
   * DELETE: DELETE /users/:id or POST /users/:id/delete
   * Deletes an alumni record and redirects to /users with View Layer feedback.
   */
  static async delete(req, res) {
    try {
      const deletedUser = await User.delete(req.params.id);
      if (!deletedUser) {
        return sendResourceNotFound(req, res, { ...USER_NOT_FOUND_OPTS, id: req.params.id });
      }

      if (req.accepts('html')) {
        return res.redirect('/users?deleted=1');
      }

      return res.status(200).json({
        message: 'User deleted successfully',
        deletedUser
      });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Alumni Directory operation',
        backHref: '/users',
        backLabel: '← Back to Alumni Directory'
      });
    }
  }
}

module.exports = UserController;
