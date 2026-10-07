const User = require('../models/User');

/**
 * ApiUserController
 * Handles RESTful API requests for Users, providing JSON CRUD responses.
 */
class ApiUserController {
  /**
   * READ ALL: GET /api/users
   */
  static getAll(req, res) {
    try {
      const users = User.findAll();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * READ ONE: GET /api/users/:id
   */
  static getById(req, res) {
    try {
      const user = User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * CREATE: POST /api/users
   */
  static create(req, res) {
    try {
      const newUser = User.create(req.body);
      return res.status(201).json({
        message: 'User created successfully',
        user: newUser
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * UPDATE (Full): PUT /api/users/:id
   */
  static update(req, res) {
    try {
      const updatedUser = User.update(req.params.id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json({
        message: 'User updated successfully (PUT)',
        user: updatedUser
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * UPDATE (Partial): PATCH /api/users/:id
   */
  static partialUpdate(req, res) {
    try {
      const updatedUser = User.update(req.params.id, req.body);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json({
        message: 'User modified successfully (PATCH)',
        user: updatedUser
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * DELETE: DELETE /api/users/:id
   */
  static delete(req, res) {
    try {
      const deletedUser = User.delete(req.params.id);
      if (!deletedUser) {
        return res.status(404).json({ error: 'User not found' });
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

module.exports = ApiUserController;
