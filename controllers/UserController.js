const User = require('../models/User');
const UserView = require('../views/UserView');

/**
 * UserController
 * Implements complete CRUD operations for User resources with View Layer presentation.
 */
class UserController {
  /**
   * READ ALL: GET /users
   * Renders the Alumni Directory HTML view via the View Layer or returns JSON.
   */
  static getAll(req, res) {
    try {
      const users = User.findAll();

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
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * READ ONE: GET /users/:id
   * Renders the individual profile HTML view via the View Layer or returns JSON.
   */
  static getById(req, res) {
    try {
      const user = User.findById(req.params.id);
      if (!user) {
        if (req.accepts('html')) {
          return res.status(404).send('<h2>404 - User Not Found</h2><p><a href="/users">← Back to Directory</a></p>');
        }
        return res.status(404).json({ error: 'User not found' });
      }

      if (req.accepts('html')) {
        if (typeof res.render === 'function') {
          return res.render('userDetail', { user });
        }
        return res.send(UserView.renderUserDetail(user));
      }

      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * EDIT FORM: GET /users/:id/edit
   * Renders the HTML edit form via the View Layer for updating an alumni record.
   */
  static getEditForm(req, res) {
    try {
      const user = User.findById(req.params.id);
      if (!user) {
        if (req.accepts('html')) {
          return res.status(404).send('<h2>404 - User Not Found</h2><p><a href="/users">← Back to Directory</a></p>');
        }
        return res.status(404).json({ error: 'User not found' });
      }

      if (req.accepts('html')) {
        if (typeof res.render === 'function') {
          return res.render('userEdit', { user });
        }
        return res.send(UserView.renderUserEdit(user));
      }

      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * CREATE: POST /users
   * Receives form data or JSON, creates a new user, and redirects with View Layer feedback.
   */
  static create(req, res) {
    try {
      const newUser = User.create(req.body);
      if (req.accepts('html')) {
        return res.redirect('/users?success=1');
      }
      return res.status(201).json({
        message: 'User created successfully',
        user: newUser
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * UPDATE: PUT /users/:id or POST /users/:id/edit
   * Updates existing alumni record and redirects with View Layer feedback.
   */
  static update(req, res) {
    try {
      const updatedUser = User.update(req.params.id, req.body);
      if (!updatedUser) {
        if (req.accepts('html')) {
          return res.status(404).send('<h2>404 - User Not Found</h2><p><a href="/users">← Back to Directory</a></p>');
        }
        return res.status(404).json({ error: 'User not found' });
      }

      if (req.accepts('html')) {
        return res.redirect('/users?updated=1');
      }

      return res.status(200).json({
        message: 'User updated successfully',
        user: updatedUser
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * UPDATE (Partial): PATCH /users/:id
   */
  static partialUpdate(req, res) {
    return UserController.update(req, res);
  }

  /**
   * DELETE: DELETE /users/:id or POST /users/:id/delete
   * Deletes an alumni record and redirects to /users with View Layer feedback.
   */
  static delete(req, res) {
    try {
      const deletedUser = User.delete(req.params.id);
      if (!deletedUser) {
        if (req.accepts('html')) {
          return res.status(404).send('<h2>404 - User Not Found</h2><p><a href="/users">← Back to Directory</a></p>');
        }
        return res.status(404).json({ error: 'User not found' });
      }

      if (req.accepts('html')) {
        return res.redirect('/users?deleted=1');
      }

      return res.status(200).json({
        message: 'User deleted successfully',
        deletedUser
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = UserController;
