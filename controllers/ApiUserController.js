const User = require('../models/User');
const { sendServerError, setSessionCookie, clearSessionCookie } = require('../middleware');

/**
 * ApiUserController
 * Handles RESTful API requests for Users, providing JSON CRUD responses
 * backed by PostgreSQL database persistence.
 */
class ApiUserController {
  /**
   * AUTHENTICATE: POST /api/login
   * Validates credentials and returns JWT-like session token and user profile.
   */
  static async login(req, res) {
    try {
      const email = req.body?.email ? String(req.body.email).trim() : '';
      const password = req.body?.password ? String(req.body.password) : '';
      const rememberMe = Boolean(req.body?.rememberMe);

      const authResult = await User.authenticate(email, password);
      if (!authResult.success) {
        return res.status(authResult.status || 401).json({
          error: authResult.error
        });
      }

      const token = User.createSessionToken(authResult.user, { rememberMe });
      setSessionCookie(res, token, rememberMe);

      return res.status(200).json({
        message: 'Login successful',
        token,
        user: authResult.user
      });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'API user authentication',
        backHref: '/api/swagger',
        backLabel: '📖 Open Swagger Docs'
      });
    }
  }

  /**
   * TERMINATE SESSION: POST /api/logout
   * Clears session cookie and returns confirmation.
   */
  static async logout(req, res) {
    try {
      clearSessionCookie(res);
      return res.status(200).json({
        message: 'Logged out successfully'
      });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'API user logout',
        backHref: '/api/swagger',
        backLabel: '📖 Open Swagger Docs'
      });
    }
  }

  /**
   * CURRENT USER: GET /api/me or GET /api/users/me
   * Returns current authenticated user context from token or session cookie.
   */
  static async me(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Unauthenticated. Please provide a valid Bearer token or session cookie.'
        });
      }
      return res.status(200).json(req.user);
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'API current user inspection',
        backHref: '/api/swagger',
        backLabel: '📖 Open Swagger Docs'
      });
    }
  }

  /**
   * READ ALL: GET /api/users
   */
  static async getAll(req, res) {
    try {
      const users = await User.findAll();
      return res.status(200).json(users);
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Users REST API operation',
        backHref: '/api/swagger',
        backLabel: '📖 Open Swagger Docs'
      });
    }
  }

  /**
   * READ ONE: GET /api/users/:id
   */
  static async getById(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json(user);
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Users REST API operation',
        backHref: '/api/swagger',
        backLabel: '📖 Open Swagger Docs'
      });
    }
  }

  /**
   * CREATE: POST /api/users
   */
  static async create(req, res) {
    try {
      const newUser = await User.create(req.body);
      return res.status(201).json({
        message: 'User created successfully',
        user: newUser
      });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Users REST API operation',
        backHref: '/api/swagger',
        backLabel: '📖 Open Swagger Docs'
      });
    }
  }

  /**
   * UPDATE (Full): PUT /api/users/:id
   */
  static async update(req, res) {
    try {
      const updatedUser = await User.update(req.params.id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json({
        message: 'User updated successfully (PUT)',
        user: updatedUser
      });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Users REST API operation',
        backHref: '/api/swagger',
        backLabel: '📖 Open Swagger Docs'
      });
    }
  }

  /**
   * UPDATE (Partial): PATCH /api/users/:id
   */
  static async partialUpdate(req, res) {
    try {
      const updatedUser = await User.update(req.params.id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json({
        message: 'User modified successfully (PATCH)',
        user: updatedUser
      });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Users REST API operation',
        backHref: '/api/swagger',
        backLabel: '📖 Open Swagger Docs'
      });
    }
  }

  /**
   * DELETE: DELETE /api/users/:id
   */
  static async delete(req, res) {
    try {
      const deletedUser = await User.delete(req.params.id);
      if (!deletedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json({
        message: 'User deleted successfully',
        deletedUser
      });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Users REST API operation',
        backHref: '/api/swagger',
        backLabel: '📖 Open Swagger Docs'
      });
    }
  }
}

module.exports = ApiUserController;
