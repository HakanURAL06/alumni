const User = require('../models/User');
const UserView = require('../views/UserView');
const { sendResourceNotFound, sendServerError, setSessionCookie, clearSessionCookie } = require('../middleware');

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
          if (req.query.login) {
            message = 'Welcome back! You have successfully signed in to the Istanbul University Portal.';
            alertType = 'success';
          } else if (req.query.registered) {
            message = 'Alumni user created successfully! Welcome to the Istanbul University Network.';
            alertType = 'success';
          } else if (req.query.success) {
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
          return res.render('users', { users, message, alertType, currentUser: req.user });
        }
        return res.send(UserView.renderUsers(users, { message, alertType, currentUser: req.user }));
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
   * CURRENT USER PROFILE: GET /profile or GET /me
   * Directs the authenticated user to their own personal user page (/users/:id).
   * Unauthenticated requests redirect to /login?returnUrl=/profile or return 401 for JSON API.
   */
  static async getProfile(req, res) {
    if (req.user && (req.user.id || req.user.userId)) {
      const uid = req.user.id || req.user.userId;
      return res.redirect(`/users/${uid}`);
    }
    if (req.accepts('html') && !req.xhr && !req.headers?.accept?.includes('application/json')) {
      return res.redirect('/login?returnUrl=%2Fprofile');
    }
    return res.status(401).json({ error: 'Unauthorized: No active user session.' });
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
          return res.render('userDetail', { user, currentUser: req.user });
        }
        return res.send(UserView.renderUserDetail(user, { currentUser: req.user }));
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
          return res.render('userEdit', { user, currentUser: req.user });
        }
        return res.send(UserView.renderUserEdit(user, { currentUser: req.user }));
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
   * LOGIN FORM: GET /login or GET /users/login
   * Renders the Member Portal Login view.
   */
  static async getLoginForm(req, res) {
    try {
      // If user is already authenticated and didn't explicitly request logout or force view, redirect to directory
      if (req.user && !req.query?.logout && !req.query?.force) {
        return res.redirect('/users');
      }

      const wantsHtml = Boolean(
        req.accepts &&
        req.accepts('html') &&
        !String(req.originalUrl || req.url || '').startsWith('/api/') &&
        !String(req.headers?.accept || '').includes('application/json')
      );

      let message = null;
      let alertType = 'info';

      if (req.query?.logout) {
        message = 'You have been logged out successfully. See you soon!';
        alertType = 'success';
      } else if (req.query?.registered) {
        message = 'Registration completed! You can now sign in with your credentials.';
        alertType = 'success';
      } else if (req.query?.authRequired) {
        message = 'Please sign in to access that protected portal feature.';
        alertType = 'info';
      }

      const returnUrl = req.query?.returnUrl ? String(req.query.returnUrl) : '';

      if (wantsHtml) {
        if (typeof res.render === 'function') {
          return res.render('login', {
            message,
            alertType,
            returnUrl,
            error: req.query?.error || null,
            email: req.query?.email || '',
            currentUser: req.user
          });
        }
        return res.status(200).send(
          UserView.renderLogin({
            message,
            alertType,
            returnUrl,
            error: req.query?.error || null,
            email: req.query?.email || '',
            currentUser: req.user
          })
        );
      }

      return res.status(200).json({
        page: 'login',
        status: 'ready',
        message: message || undefined
      });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Rendering login form',
        backHref: '/users',
        backLabel: '← Back to Alumni Directory'
      });
    }
  }

  /**
   * LOGIN SUBMIT: POST /login or POST /users/login
   * Authenticates user credentials, generates session token, sets HttpOnly cookie,
   * and redirects browser or returns 200 JSON with token.
   */
  static async login(req, res) {
    try {
      const email = req.body?.email ? String(req.body.email).trim() : '';
      const password = req.body?.password ? String(req.body.password) : '';
      const rememberMe =
        req.body?.rememberMe === true ||
        req.body?.rememberMe === 'true' ||
        req.body?.rememberMe === '1' ||
        req.body?.rememberMe === 'on';
      const rawReturnUrl = req.body?.returnUrl || req.query?.returnUrl || '';
      const safeReturnUrl = (typeof rawReturnUrl === 'string' && rawReturnUrl.startsWith('/') && !rawReturnUrl.startsWith('//'))
        ? rawReturnUrl
        : '/users?login=1';

      const wantsHtml = Boolean(
        req.accepts &&
        req.accepts('html') &&
        !String(req.originalUrl || req.url || '').startsWith('/api/') &&
        !String(req.headers?.accept || '').includes('application/json')
      );

      const authResult = await User.authenticate(email, password);

      if (!authResult.success) {
        const statusCode = authResult.status || 401;
        if (wantsHtml) {
          return res.status(statusCode).send(
            UserView.renderLogin({
              error: authResult.error,
              email,
              returnUrl: rawReturnUrl,
              rememberMe
            })
          );
        }
        return res.status(statusCode).json({
          error: authResult.error
        });
      }

      // Generate Session Token
      const token = User.createSessionToken(authResult.user, { rememberMe });
      setSessionCookie(res, token, rememberMe);

      if (wantsHtml) {
        return res.redirect(safeReturnUrl);
      }

      return res.status(200).json({
        message: 'Login successful',
        token,
        user: authResult.user
      });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'User authentication operation',
        backHref: '/login',
        backLabel: '← Back to Login'
      });
    }
  }

  /**
   * LOGOUT: GET /logout, POST /logout, or POST /users/logout
   * Clears session cookie and redirects browser to /login?logout=1 or returns JSON.
   */
  static async logout(req, res) {
    try {
      clearSessionCookie(res);

      const wantsHtml = Boolean(
        req.accepts &&
        req.accepts('html') &&
        !String(req.originalUrl || req.url || '').startsWith('/api/') &&
        !String(req.headers?.accept || '').includes('application/json')
      );

      if (wantsHtml) {
        return res.redirect('/login?logout=1');
      }

      return res.status(200).json({
        message: 'Logged out successfully'
      });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'User session termination',
        backHref: '/users',
        backLabel: '← Back to Alumni Directory'
      });
    }
  }

  /**
   * REGISTER FORM: GET /register or GET /users/register
   * Renders the dedicated Istanbul University Member Registration page.
   */
  static async getRegisterForm(req, res) {
    try {
      if (req.accepts && req.accepts('html')) {
        const formData = {
          role: req.query?.role || 'alumni',
          graduationYear: req.query?.graduationYear || '2024'
        };
        if (typeof res.render === 'function') {
          return res.render('register', { formData, currentUser: req.user });
        }
        return res.status(200).send(UserView.renderRegister({ formData, currentUser: req.user }));
      }
      return res.status(200).json({
        page: 'register',
        allowedRoles: User.SELF_REGISTER_ROLES,
        requiredFields: ['name', 'email', 'department', 'graduationYear']
      });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Rendering registration form',
        backHref: '/users',
        backLabel: '← Back to Alumni Directory'
      });
    }
  }

  /**
   * REGISTER SUBMIT: POST /register, POST /users/register, or POST /api/register
   * Validates registration inputs (USR-R1..USR-R7), creates the user with role metadata,
   * and redirects HTML clients or returns 201 JSON.
   */
  static async register(req, res) {
    try {
      const validation = User.validateRegistration(req.body || {}, {
        allowPrivilegedRoles: false
      });

      const wantsHtml = Boolean(
        req.accepts &&
        req.accepts('html') &&
        !String(req.originalUrl || req.url || '').startsWith('/api/') &&
        !String(req.headers?.accept || '').includes('application/json')
      );

      if (!validation.valid) {
        if (wantsHtml) {
          return res.status(validation.status).send(
            UserView.renderRegister({
              errors: validation.errors,
              formData: req.body || {}
            })
          );
        }
        return res.status(validation.status).json({
          error: validation.errors[0],
          errors: validation.errors
        });
      }

      const newUser = await User.create(validation.sanitized);
      if (wantsHtml) {
        return res.redirect('/users?success=1&registered=1');
      }

      return res.status(201).json({
        message: 'User registered successfully',
        user: newUser
      });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'User registration operation',
        backHref: '/register',
        backLabel: '← Back to Registration'
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
