const User = require('../models/User');
const JobPosting = require('../models/JobPosting');
const Application = require('../models/Application');
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
   * Renders the dedicated User Profile & Personal Workspace view with the user's jobs,
   * applications, profile edit form, and account security controls.
   * Unauthenticated requests redirect to /login?returnUrl=/profile or return 401 for JSON API.
   */
  static async getProfile(req, res) {
    try {
      if (!req.user || (!req.user.id && !req.user.userId)) {
        if (req.accepts('html') && !req.xhr && !req.headers?.accept?.includes('application/json')) {
          return res.redirect('/login?returnUrl=%2Fprofile');
        }
        return res.status(401).json({ error: 'Unauthorized: No active user session.' });
      }

      const uid = req.user.id || req.user.userId;
      const user = await User.findById(uid);
      if (!user) {
        return sendResourceNotFound(req, res, { ...USER_NOT_FOUND_OPTS, id: uid });
      }

      const [jobs, applications] = await Promise.all([
        JobPosting.findByPostedBy(uid),
        Application.findByUser(uid)
      ]);

      if (req.accepts('html')) {
        let message = null;
        let error = null;
        let alertType = 'success';

        if (req.query) {
          if (req.query.updated) {
            message = 'Profil bilgileriniz başarıyla güncellendi!';
            alertType = 'success';
          } else if (req.query.passwordUpdated) {
            message = 'Şifreniz başarıyla güncellendi! Yeni şifreniz aktif edilmiştir.';
            alertType = 'success';
          } else if (req.query.error) {
            error = req.query.error;
            alertType = 'danger';
          }
        }

        if (typeof res.render === 'function') {
          return res.render('profile', { user, jobs, applications, currentUser: req.user, message, error, alertType });
        }
        return res.send(UserView.renderProfile(user, { jobs, applications, currentUser: req.user, message, error, alertType }));
      }

      return res.status(200).json({ user, jobs, applications });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'User profile workspace operation',
        backHref: '/users',
        backLabel: '← Back to Alumni Directory'
      });
    }
  }

  /**
   * UPDATE PROFILE: POST /profile/edit
   * Updates profile information (name, department, graduationYear, title, company, studentNumber, linkedinUrl, isMentor)
   * for the authenticated user.
   */
  static async updateProfile(req, res) {
    try {
      if (!req.user || (!req.user.id && !req.user.userId)) {
        if (req.accepts('html')) {
          return res.redirect('/login?returnUrl=%2Fprofile');
        }
        return res.status(401).json({ error: 'Unauthorized: No active user session.' });
      }

      const uid = req.user.id || req.user.userId;
      const existingUser = await User.findById(uid);
      if (!existingUser) {
        return sendResourceNotFound(req, res, { ...USER_NOT_FOUND_OPTS, id: uid });
      }

      const { name, department, graduationYear, title, company, studentNumber, linkedinUrl, isMentor } = req.body || {};

      const errors = [];
      const cleanName = name ? String(name).trim() : existingUser.name;
      if (!cleanName || cleanName.length < 2) {
        errors.push('Ad Soyad alanı en az 2 karakter olmalıdır.');
      }

      const cleanDept = department ? String(department).trim() : existingUser.department;
      if (!cleanDept || cleanDept.length < 2) {
        errors.push('Fakülte / Bölüm alanı en az 2 karakter olmalıdır.');
      }

      let cleanYear = graduationYear ? Number(graduationYear) : existingUser.graduationYear;
      if (!cleanYear || isNaN(cleanYear) || cleanYear < 1900 || cleanYear > 2100) {
        errors.push('Geçerli bir mezuniyet yılı belirtilmelidir (1900-2100).');
      }

      if (errors.length > 0) {
        if (req.accepts('html')) {
          return res.redirect(`/profile?error=${encodeURIComponent(errors.join(' '))}`);
        }
        return res.status(400).json({ error: errors.join(' ') });
      }

      const updateData = {
        name: cleanName,
        department: cleanDept,
        graduationYear: cleanYear,
        title: title !== undefined ? String(title).trim() : existingUser.title,
        company: company !== undefined ? String(company).trim() : existingUser.company,
        studentNumber: studentNumber !== undefined ? String(studentNumber).trim() : existingUser.studentNumber,
        linkedinUrl: linkedinUrl !== undefined ? String(linkedinUrl).trim() : existingUser.linkedinUrl,
        isMentor: isMentor === true || isMentor === 'true' || isMentor === '1' || isMentor === 'on'
      };

      const updatedUser = await User.update(uid, updateData);

      // Re-sign session cookie so updated name is immediately reflected in top-bar/pill
      if (updatedUser) {
        const token = User.createSessionToken(updatedUser);
        setSessionCookie(res, token);
      }

      if (req.accepts('html')) {
        return res.redirect('/profile?updated=1');
      }
      return res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Update profile operation',
        backHref: '/profile',
        backLabel: '← Back to Profile'
      });
    }
  }

  /**
   * UPDATE PASSWORD: POST /profile/password
   * Securely validates the current password and hashes the new password with PBKDF2 SHA-512.
   */
  static async updatePassword(req, res) {
    try {
      if (!req.user || (!req.user.id && !req.user.userId)) {
        if (req.accepts('html')) {
          return res.redirect('/login?returnUrl=%2Fprofile');
        }
        return res.status(401).json({ error: 'Unauthorized: No active user session.' });
      }

      const uid = req.user.id || req.user.userId;
      const existingUser = await User.findById(uid);
      if (!existingUser) {
        return sendResourceNotFound(req, res, { ...USER_NOT_FOUND_OPTS, id: uid });
      }

      const { currentPassword, newPassword, confirmPassword } = req.body || {};

      if (!currentPassword || !newPassword || !confirmPassword) {
        const msg = 'Lütfen tüm şifre alanlarını doldurunuz.';
        if (req.accepts('html')) {
          return res.redirect(`/profile?error=${encodeURIComponent(msg)}#tab-security`);
        }
        return res.status(400).json({ error: msg });
      }

      if (String(newPassword).length < 8) {
        const msg = 'Yeni şifreniz en az 8 karakter uzunluğunda olmalıdır.';
        if (req.accepts('html')) {
          return res.redirect(`/profile?error=${encodeURIComponent(msg)}#tab-security`);
        }
        return res.status(400).json({ error: msg });
      }

      if (newPassword !== confirmPassword) {
        const msg = 'Yeni şifre ve şifre tekrarı birbiriyle eşleşmiyor.';
        if (req.accepts('html')) {
          return res.redirect(`/profile?error=${encodeURIComponent(msg)}#tab-security`);
        }
        return res.status(400).json({ error: msg });
      }

      const authCheck = await User.authenticate(existingUser.email, currentPassword);
      if (!authCheck.success) {
        const msg = 'Mevcut şifreniz hatalı. Lütfen kontrol edip tekrar deneyiniz.';
        if (req.accepts('html')) {
          return res.redirect(`/profile?error=${encodeURIComponent(msg)}#tab-security`);
        }
        return res.status(400).json({ error: msg });
      }

      await User.updatePassword(uid, newPassword);

      if (req.accepts('html')) {
        return res.redirect('/profile?passwordUpdated=1#tab-security');
      }
      return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      return sendServerError(req, res, error, {
        operation: 'Update password operation',
        backHref: '/profile',
        backLabel: '← Back to Profile'
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
