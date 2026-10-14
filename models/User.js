/**
 * User (Alumni) Model
 * Implements complete asynchronous CRUD operations against PostgreSQL database,
 * with graceful in-memory fallback for offline/isolated environments.
 */

const db = require('./db');

class UserModel {
  constructor() {
    this.users = [
      { id: 1, name: 'Hakan Ural', department: 'Computer Engineering', graduationYear: 2024, email: 'hakan@alumni.edu' },
      { id: 2, name: 'Ayşe Yılmaz', department: 'Industrial Engineering', graduationYear: 2023, email: 'ayse@alumni.edu' },
      { id: 3, name: 'Mehmet Demir', department: 'Electrical & Electronics Engineering', graduationYear: 2022, email: 'mehmet@alumni.edu' }
    ];
  }

  /**
   * CREATE: Adds a new user record to PostgreSQL database
   * @param {Object} userData - User details (name, department, graduationYear, email)
   * @returns {Promise<Object>} The created user record
   */
  async create(userData = {}) {
    const name = userData.name || 'Yeni Mezun';
    const department = userData.department || 'Computer Engineering';
    const graduationYear = userData.graduationYear ? Number(userData.graduationYear) : 2024;
    const email = userData.email || `${name.toLowerCase().replace(/\s+/g, '')}@alumni.edu`;

    try {
      const res = await db.query(
        `INSERT INTO users (name, department, graduation_year, email)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE SET
           name = EXCLUDED.name,
           department = EXCLUDED.department,
           graduation_year = EXCLUDED.graduation_year
         RETURNING id, name, department, graduation_year AS "graduationYear", email, created_at, updated_at;`,
        [name, department, graduationYear, email]
      );
      const createdUser = res.rows[0];
      this.users.push(createdUser);
      return createdUser;
    } catch (err) {
      // In-memory fallback
      const nextId = this.users.length ? Math.max(...this.users.map(u => u.id)) + 1 : 1;
      const newUser = {
        id: nextId,
        name,
        department,
        graduationYear,
        email
      };
      this.users.push(newUser);
      return newUser;
    }
  }

  /**
   * READ: Returns all user records from PostgreSQL database
   * @returns {Promise<Array<Object>>} List of all users
   */
  async findAll() {
    try {
      const res = await db.query(
        `SELECT id, name, department, graduation_year AS "graduationYear", email, created_at, updated_at
         FROM users
         ORDER BY id ASC;`
      );
      return res.rows;
    } catch (err) {
      // In-memory fallback
      return [...this.users];
    }
  }

  /**
   * READ: Finds a single user by ID in PostgreSQL database
   * @param {number|string} id - User ID
   * @returns {Promise<Object|null>} The user object or null if not found
   */
  async findById(id) {
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

    try {
      const res = await db.query(
        `SELECT id, name, department, graduation_year AS "graduationYear", email, created_at, updated_at
         FROM users
         WHERE id = $1;`,
        [numericId]
      );
      if (res.rows.length === 0) return null;
      return res.rows[0];
    } catch (err) {
      // In-memory fallback
      return this.users.find(u => u.id === numericId) || null;
    }
  }

  /**
   * UPDATE: Updates user fields in PostgreSQL database
   * @param {number|string} id - User ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object|null>} The updated user or null if not found
   */
  async update(id, updateData = {}) {
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

    try {
      const existing = await this.findById(numericId);
      if (!existing) return null;

      const name = updateData.name !== undefined ? updateData.name : existing.name;
      const department = updateData.department !== undefined ? updateData.department : existing.department;
      const graduationYear = updateData.graduationYear !== undefined ? Number(updateData.graduationYear) : existing.graduationYear;
      const email = updateData.email !== undefined ? updateData.email : existing.email;

      const res = await db.query(
        `UPDATE users
         SET name = $1, department = $2, graduation_year = $3, email = $4, updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING id, name, department, graduation_year AS "graduationYear", email, created_at, updated_at;`,
        [name, department, graduationYear, email, numericId]
      );

      if (res.rows.length === 0) return null;
      const updatedUser = res.rows[0];

      // Mirror to in-memory cache
      const memIndex = this.users.findIndex(u => u.id === numericId);
      if (memIndex !== -1) {
        this.users[memIndex] = { ...this.users[memIndex], ...updatedUser };
      }

      return updatedUser;
    } catch (err) {
      // In-memory fallback
      const user = this.users.find(u => u.id === numericId);
      if (!user) return null;

      if (updateData.name !== undefined) user.name = updateData.name;
      if (updateData.department !== undefined) user.department = updateData.department;
      if (updateData.graduationYear !== undefined) user.graduationYear = Number(updateData.graduationYear);
      if (updateData.email !== undefined) user.email = updateData.email;

      return user;
    }
  }

  /**
   * DELETE: Removes a user by ID from PostgreSQL database
   * @param {number|string} id - User ID
   * @returns {Promise<Object|null>} The deleted user or null if not found
   */
  async delete(id) {
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

    try {
      const res = await db.query(
        `DELETE FROM users
         WHERE id = $1
         RETURNING id, name, department, graduation_year AS "graduationYear", email;`,
        [numericId]
      );

      if (res.rows.length === 0) return null;
      const deletedUser = res.rows[0];

      // Mirror to in-memory cache
      const index = this.users.findIndex(u => u.id === numericId);
      if (index !== -1) {
        this.users.splice(index, 1);
      }

      return deletedUser;
    } catch (err) {
      // In-memory fallback
      const index = this.users.findIndex(u => u.id === numericId);
      if (index === -1) return null;

      const [deletedUser] = this.users.splice(index, 1);
      return deletedUser;
    }
  }
}

// Export singleton instance of User model
const User = new UserModel();
module.exports = User;
